/**
 * post controller
 */

import { factories } from '@strapi/strapi'

interface StrapiUser {
  id: number;
  username: string;
  email: string;
  avatar?: any;
  banner?: any;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface StrapiMember {
  id: number;
  username: string;
}

interface StrapiCommunity {
  id: number;
  name: string;
  description?: string;
  isPrivate?: boolean;
  avatar?: any;
  banner?: any;
  rules?: any;
  slug?: string;
  members?: StrapiMember[];
  moderators?: StrapiMember[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface StrapiMedia {
  id: number;
  url: string;
}

interface StrapiComment {
  id: number;
  content: string;
  author: StrapiUser;
  createdAt: string;
}

interface StrapiEntityPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  author: {
    id: number;
    username: string;
    avatar?: any;
    banner?: any;
  };
  community: {
    id: number;
    name: string;
  };
  media: StrapiMedia[];
  comments: StrapiComment[];
  upvotes?: Array<{ id: number }>;
  downvotes?: Array<{ id: number }>;
}

interface StrapiPost {
  id: number;
  title: string;
  content: string;
  media?: Array<{
    id: number;
    url: string;
  }>;
  author?: {
    id: number;
    username: string;
    avatar?: {
      url: string;
    };
    banner?: {
      url: string;
    };
  };
  community?: StrapiCommunity;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  upvotes?: Array<{ id: number }>;
  downvotes?: Array<{ id: number }>;
  comments?: Array<{ id: number }>;
}

interface VoteData {
  connect?: number[];
  disconnect?: number[];
}

interface UpdatePostData {
  upvotes?: VoteData;
  downvotes?: VoteData;
}

const createPostController = factories.createCoreController('api::post.post', ({ strapi }) => ({
  async find(ctx) {
    try {
      // Récupérer les posts avec pagination et relations nécessaires
      const { results: data, pagination: meta } = await strapi.entityService.findPage('api::post.post', {
        ...ctx.query,
        populate: {
          author: { populate: ['avatar', 'banner'] },
          community: { populate: ['avatar', 'banner'] },
          upvotes: true,
          downvotes: true,
        },
      });

      // Enrichir la réponse avec les détails de l'auteur et de la communauté
      const enrichedData = await Promise.all(
        data.map(async (item) => {
          const post = item;
          const authorId = post.author?.id;
          const communityId = post.community?.id;

          const [author, community] = await Promise.all([
            authorId
              ? strapi.entityService.findOne('plugin::users-permissions.user', authorId, {
                  populate: ['avatar', 'banner'],
                })
              : null,
            communityId
              ? strapi.entityService.findOne('api::community.community', communityId, {
                  populate: ['avatar', 'banner'],
                })
              : null,
          ]);

          return {
            ...item,
            author: author
              ? {
                  id: (author as StrapiUser).id,
                  username: (author as StrapiUser).username,
                  avatar: (author as StrapiUser).avatar ?? null,
                  banner: (author as StrapiUser).banner ?? null,
                }
              : null,
            community: community
              ? {
                  id: (community as StrapiCommunity).id,
                  name: (community as StrapiCommunity).name,
                  avatar: (community as StrapiCommunity).avatar ?? null,
                  banner: (community as StrapiCommunity).banner ?? null,
                }
              : null,
            upvotes: post.upvotes || [],
            downvotes: post.downvotes || [],
          };
        })
      );

      return { data: enrichedData, meta };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      // Récupérer le post avec toutes les relations nécessaires
      const post = await strapi.entityService.findOne('api::post.post', id, {
        populate: {
          author: {
            populate: ['avatar', 'banner']
          },
          community: {
            populate: ['avatar', 'banner'],
            fields: ['id', 'name', 'description']
          },
          media: true,
          comments: {
            populate: ['author']
          },
          upvotes: true,
          downvotes: true
        }
      }) as unknown as StrapiEntityPost;

      if (!post) {
        return ctx.notFound('Post non trouvé');
      }

      // Enrichir les données de la communauté
      let enrichedCommunity = null;
      if (post.community?.id) {
        const communityData = await strapi.entityService.findOne('api::community.community', post.community.id, {
          populate: ['avatar', 'banner']
        }) as unknown as StrapiCommunity;
        
        if (communityData) {
          enrichedCommunity = {
            data: {
              id: communityData.id,
              attributes: {
                name: communityData.name,
                avatar: communityData.avatar,
                banner: communityData.banner
              }
            }
          };
        }
      }

      return {
        data: {
          id: post.id,
          attributes: {
            ...post,
            author: post.author ? {
              data: {
                id: post.author.id,
                attributes: {
                  username: post.author.username,
                  avatar: post.author.avatar,
                  banner: post.author.banner
                }
              }
            } : null,
            community: enrichedCommunity,
            upvotes: post.upvotes || [],
            downvotes: post.downvotes || []
          }
        }
      };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async create(ctx) {
    try {
      const { title, content, community, media } = ctx.request.body.data;
      const userId = ctx.state.user.id;

      // Validation des données requises
      if (!title || !content || !community) {
        return ctx.badRequest('Titre, contenu et communauté sont requis');
      }

      // Vérification de l'appartenance à la communauté
      const communityData = await strapi.entityService.findOne('api::community.community', community, {
        populate: ['members']
      }) as unknown as StrapiCommunity;

      if (!communityData) {
        return ctx.notFound('Communauté non trouvée');
      }

      const isMember = communityData.members.some(member => member.id === userId);
      if (!isMember) {
        return ctx.forbidden('Vous devez être membre de la communauté pour poster');
      }

      // Création du post
      const post = await strapi.entityService.create('api::post.post', {
        data: {
          title,
          content,
          author: userId,
          community,
          media: media || [],
          publishedAt: new Date()
        },
        populate: {
          author: {
            populate: ['avatar', 'banner']
          },
          community: {
            fields: ['id', 'name']
          },
          media: true
        }
      }) as unknown as StrapiPost;

      return {
        data: post
      };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      // Vérification que l'utilisateur est l'auteur du post
      const existingPost = await strapi.entityService.findOne('api::post.post', id, {
        populate: ['author']
      }) as unknown as StrapiPost;

      if (!existingPost) {
        return ctx.notFound('Post non trouvé');
      }

      if (existingPost.author?.id !== userId) {
        return ctx.forbidden('Vous n\'êtes pas autorisé à modifier ce post');
      }

      // Mise à jour du post
      const updatedPost = await super.update(ctx);
      return updatedPost;
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      // Vérification que l'utilisateur est l'auteur du post
      const existingPost = await strapi.entityService.findOne('api::post.post', id, {
        populate: ['author', 'community.moderators', 'comments']
      }) as unknown as StrapiPost;

      if (!existingPost) {
        return ctx.notFound('Post non trouvé');
      }

      const isAuthor = existingPost.author?.id === userId;
      const isModerator = existingPost.community?.moderators?.some(mod => mod.id === userId);

      if (!isAuthor && !isModerator) {
        return ctx.forbidden({ message: "Vous n'êtes pas autorisé à supprimer ce post" });
      }

      // Suppression récursive de tous les commentaires associés au post
      async function deleteCommentAndReplies(commentId: number) {
        // Supprimer d'abord toutes les réponses (récursif)
        const replies = await strapi.db.query('api::comment.comment').findMany({ where: { parent: commentId } });
        for (const reply of replies) {
          await deleteCommentAndReplies(reply.id);
        }
        // Supprimer le commentaire lui-même
        await strapi.db.query('api::comment.comment').delete({ where: { id: commentId } });
      }

      // Supprimer tous les commentaires principaux du post (et leurs réponses)
      if (existingPost.comments && existingPost.comments.length > 0) {
        for (const comment of existingPost.comments) {
          await deleteCommentAndReplies(comment.id);
        }
      }

      // Suppression du post
      const deletedPost = await strapi.entityService.delete('api::post.post', id);
      return deletedPost;
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async upvote(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const post = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: ['upvotes', 'downvotes', 'author', 'community']
      });

      if (!post) {
        return ctx.notFound('Post non trouvé');
      }

      const upvoteIds = post.upvotes?.map(u => u.id) || [];
      const downvoteIds = post.downvotes?.map(d => d.id) || [];

      // Si déjà upvoté, on ne fait rien
      if (upvoteIds.includes(userId)) {
        return ctx.badRequest('Vous avez déjà upvoté ce post');
      }

      // Mise à jour des votes
      const data = {
        upvotes: [...upvoteIds, userId],
        downvotes: downvoteIds.filter(id => id !== userId)
      };

      const updatedPost = await strapi.db.query('api::post.post').update({
        where: { id },
        data,
        populate: ['upvotes', 'downvotes', 'author', 'community']
      });

      // Calculer le score
      const score = (updatedPost.upvotes?.length || 0) - (updatedPost.downvotes?.length || 0);

      return {
        data: {
          ...updatedPost,
          score,
          hasUpvoted: true,
          hasDownvoted: false
        }
      };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async downvote(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const post = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: ['upvotes', 'downvotes', 'author', 'community']
      });

      if (!post) {
        return ctx.notFound('Post non trouvé');
      }

      const upvoteIds = post.upvotes?.map(u => u.id) || [];
      const downvoteIds = post.downvotes?.map(d => d.id) || [];

      // Si déjà downvoté, on ne fait rien
      if (downvoteIds.includes(userId)) {
        return ctx.badRequest('Vous avez déjà downvoté ce post');
      }

      // Mise à jour des votes
      const data = {
        downvotes: [...downvoteIds, userId],
        upvotes: upvoteIds.filter(id => id !== userId)
      };

      const updatedPost = await strapi.db.query('api::post.post').update({
        where: { id },
        data,
        populate: ['upvotes', 'downvotes', 'author', 'community']
      });

      // Calculer le score
      const score = (updatedPost.upvotes?.length || 0) - (updatedPost.downvotes?.length || 0);

      return {
        data: {
          ...updatedPost,
          score,
          hasUpvoted: false,
          hasDownvoted: true
        }
      };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async removeUpvote(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const post = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: ['upvotes']
      });

      if (!post) {
        return ctx.notFound('Post non trouvé');
      }

      const upvoteIds = post.upvotes?.map(u => u.id) || [];

      if (!upvoteIds.includes(userId)) {
        return ctx.badRequest('Vous n\'avez pas upvoté ce post');
      }

      const updatedPost = await strapi.db.query('api::post.post').update({
        where: { id },
        data: {
          upvotes: upvoteIds.filter(id => id !== userId)
        },
        populate: ['upvotes', 'downvotes']
      });

      return { data: updatedPost };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async removeDownvote(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const post = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: ['downvotes']
      });

      if (!post) {
        return ctx.notFound('Post non trouvé');
      }

      const downvoteIds = post.downvotes?.map(d => d.id) || [];

      if (!downvoteIds.includes(userId)) {
        return ctx.badRequest('Vous n\'avez pas downvoté ce post');
      }

      const updatedPost = await strapi.db.query('api::post.post').update({
        where: { id },
        data: {
          downvotes: downvoteIds.filter(id => id !== userId)
        },
        populate: ['upvotes', 'downvotes']
      });

      return { data: updatedPost };
    } catch (error) {
      return ctx.throw(500, error);
    }
  }
}))

export default createPostController;
