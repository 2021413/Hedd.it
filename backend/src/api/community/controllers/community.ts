/**
 * community controller
 */

import { factories } from '@strapi/strapi'

interface StrapiUser {
  id: number;
  username?: string;
  email?: string;
  provider?: string;
  password?: string;
  resetPasswordToken?: string;
  confirmationToken?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: any;
  communities?: Array<{ id: number }>;
  moderatedCommunities?: Array<{ id: number }>;
  createdCommunities?: Array<{ id: number }>;
  createdAt?: string;
  updatedAt?: string;
}

interface StrapiCommunity {
  id: number;
  name?: string;
  description?: string;
  isPrivate?: boolean;
  creator?: {
    id: number;
    username: string;
  };
  members?: Array<{
    id: number;
    username: string;
  }>;
  moderators?: Array<{
    id: number;
    username: string;
  }>;
  posts?: Array<{
    id: number;
    title: string;
    content: string;
    media?: Array<{
      url: string;
    }>;
  }>;
  avatar?: any;
  banner?: any;
  rules?: any;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

const createCommunityController = factories.createCoreController('api::community.community', ({ strapi }) => ({
  async find(ctx) {
    try {
      const data = await strapi.entityService.findMany('api::community.community', {
        ...ctx.query,
        sort: { id: 'asc' },
        populate: {
          creator: {
            fields: ['id', 'username']
          },
          members: {
            fields: ['id', 'username']
          },
          moderators: {
            fields: ['id', 'username']
          },
          avatar: true,
          banner: true
        }
      });

      // Transformer les données pour correspondre au format Strapi
      const formattedData = data.map(community => ({
        id: community.id,
        attributes: {
          name: community.name,
          slug: community.slug,
          description: community.description,
          isPrivate: community.isPrivate,
          createdAt: community.createdAt,
          updatedAt: community.updatedAt,
          publishedAt: community.publishedAt
        }
      }));

      return { 
        data: formattedData,
        meta: {
          pagination: {
            page: 1,
            pageSize: formattedData.length,
            pageCount: 1,
            total: formattedData.length
          }
        }
      };
    } catch (error) {
      console.error('Erreur dans find:', error);
      return ctx.throw(500, error);
    }
  },

  async create(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      // Nettoyer le nom de la communauté en remplaçant les espaces multiples par un seul espace
      let communityData = { ...ctx.request.body.data };
      if (communityData.name) {
        communityData.name = communityData.name.trim().replace(/\s+/g, ' ');
        
        // Créer un slug à partir du nom (remplacer les espaces par des tirets)
        communityData.slug = communityData.name.toLowerCase().replace(/\s+/g, '-');

        // Vérifier si une communauté avec ce slug existe déjà
        const existingCommunity = await strapi.entityService.findMany('api::community.community', {
          filters: {
            slug: communityData.slug
          }
        });

        if (existingCommunity && existingCommunity.length > 0) {
          return ctx.badRequest('Une communauté avec ce nom existe déjà');
        }
      }
      
      // Ajout automatique du créateur comme membre et modérateur
      const data = {
        ...communityData,
        creator: userId,
        moderators: [userId],
        members: [userId]
      };

      // Création de la communauté avec le service Strapi
      const entry = await strapi.entityService.create('api::community.community', {
        data: data,
        populate: {
          creator: true,
          members: true,
          moderators: true
        }
      });

      return { data: entry };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async findByName(ctx) {
    try {
      const { name } = ctx.params;

      const entry = await strapi.entityService.findMany('api::community.community', {
        filters: {
          $or: [
            { name: { $eq: name } },
            { slug: { $eq: name } }
          ]
        },
        populate: {
          creator: {
            fields: ['id', 'username', 'email']
          },
          members: {
            fields: ['id', 'username']
          },
          moderators: {
            fields: ['id', 'username']
          },
          posts: {
            populate: {
              media: true,
              upvotes: true,
              downvotes: true
            }
          },
          avatar: true,
          banner: true
        }
      }) as StrapiCommunity[];

      if (!entry || entry.length === 0) {
        return ctx.notFound('Communauté non trouvée');
      }

      const community = entry[0];

      return { 
        data: {
          id: community.id,
          name: community.name,
          description: community.description,
          isPrivate: community.isPrivate,
          rules: community.rules,
          slug: community.slug,
          createdAt: community.createdAt,
          creator: community.creator,
          members: community.members,
          moderators: community.moderators,
          posts: community.posts,
          avatar: community.avatar,
          banner: community.banner
        }
      };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async findUserCommunities(ctx) {
    try {
      const { id } = ctx.params;
      
      // Vérifier si l'utilisateur existe
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', id, {
        populate: ['communities', 'moderatedCommunities', 'createdCommunities']
      }) as unknown as StrapiUser;

      if (!user) {
        return ctx.notFound('Utilisateur non trouvé');
      }

      // Récupérer tous les IDs uniques des communautés
      const communityIds = new Set([
        ...(user.communities?.map(c => c.id) || []),
        ...(user.moderatedCommunities?.map(c => c.id) || []),
        ...(user.createdCommunities?.map(c => c.id) || [])
      ]);

      // Récupérer les détails complets des communautés
      const communities = await strapi.entityService.findMany('api::community.community', {
        filters: {
          id: {
            $in: Array.from(communityIds)
          }
        },
        populate: {
          creator: {
            fields: ['id', 'username']
          },
          members: {
            fields: ['id', 'username']
          },
          moderators: {
            fields: ['id', 'username']
          },
          avatar: true,
          banner: true
        }
      }) as StrapiCommunity[];

      return {
        data: communities.map(community => ({
          ...community,
          userRole: {
            isCreator: community.creator?.id === parseInt(id),
            isModerator: user.moderatedCommunities?.some(c => c.id === community.id) || false,
            isMember: user.communities?.some(c => c.id === community.id) || false
          }
        }))
      };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async updateCommunity(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user?.id;
      const data = ctx.request.body.data;

      // Vérifier si la communauté existe
      const community = await strapi.entityService.findOne('api::community.community', id, {
        populate: ['creator', 'moderators']
      }) as StrapiCommunity;
      if (!community) {
        return ctx.notFound('Communauté non trouvée');
      }

      // Vérifier si l'utilisateur est modérateur ou créateur
      const mods = (community as any).moderators;
      const creator = (community as any).creator;
      const isModerator = mods?.some((mod: any) => mod.id === userId);
      const isCreator = creator?.id === userId;
      if (!isModerator && !isCreator) {
        return ctx.unauthorized('Vous n\'avez pas les droits pour modifier cette communauté');
      }

      // Mettre à jour la communauté
      const updated = await strapi.entityService.update('api::community.community', id, {
        data,
        populate: ['creator', 'moderators', 'members', 'avatar', 'banner']
      });
      return { data: updated };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  /**
   * Suppression en cascade d'une communauté, de ses posts et de tous les commentaires associés à ses posts
   * Seul le créateur ou un modérateur peut supprimer
   */
  async deleteCommunity(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user?.id;
      // Vérifier si la communauté existe et récupérer les modérateurs/creator
      const community = await strapi.entityService.findOne('api::community.community', id, {
        populate: ['creator', 'moderators', 'posts']
      }) as any;
      if (!community) {
        return ctx.notFound('Communauté non trouvée');
      }
      const mods = (community as any).moderators;
      const creator = (community as any).creator;
      const isModerator = mods?.some((mod: any) => mod.id === userId);
      const isCreator = creator?.id === userId;
      if (!isModerator && !isCreator) {
        return ctx.unauthorized('Vous n\'avez pas les droits pour supprimer cette communauté');
      }
      // Suppression en cascade dans une transaction
      await strapi.db.transaction(async () => {
        // Supprimer tous les posts et leurs commentaires
        if (Array.isArray(community.posts)) {
          for (const post of community.posts) {
            // Récupérer tous les commentaires du post
            const postWithComments = await strapi.entityService.findOne('api::post.post', post.id, { populate: ['comments'] });
            const commentsArr = (postWithComments && (postWithComments as any).comments) ? (postWithComments as any).comments : [];
            if (Array.isArray(commentsArr) && commentsArr.length > 0) {
              for (const comment of commentsArr) {
                // Suppression récursive des commentaires et réponses
                async function deleteCommentAndReplies(commentId: number) {
                  const replies = await strapi.db.query('api::comment.comment').findMany({ where: { parent: commentId } });
                  for (const reply of replies) {
                    await deleteCommentAndReplies(reply.id);
                  }
                  await strapi.db.query('api::comment.comment').delete({ where: { id: commentId } });
                }
                await deleteCommentAndReplies(comment.id);
              }
            }
            // Supprimer le post
            await strapi.entityService.delete('api::post.post', post.id);
          }
        }
        // Supprimer la communauté
        await strapi.entityService.delete('api::community.community', id);
      });
      ctx.body = { message: 'Communauté et contenu supprimés' };
    } catch (error) {
      return ctx.throw(500, error);
    }
  }
}));

export default createCommunityController;
