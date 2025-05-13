/**
 * comment controller
 */

import { factories } from '@strapi/strapi'

interface StrapiUser {
  id: number;
  username: string;
}

interface StrapiPost {
  id: number;
  title: string;
}

interface StrapiComment {
  id: number;
  content: string;
  author?: StrapiUser;
  post?: StrapiPost;
  parent?: StrapiComment;
}

const createCommentController = factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    const { content, post, parent } = ctx.request.body.data;
    if (!ctx.state.user) {
      return ctx.unauthorized('Utilisateur non authentifié');
    }
    const userId = ctx.state.user.id;

    // Validation des données requises
    if (!content || !post) {
      return ctx.badRequest('Le contenu et l\'ID du post sont requis');
    }

    try {
      // Utilisation de la transaction pour garantir l'intégrité des données
      const result = await strapi.db.transaction(async () => {
        // Vérification que le post existe
        const postExists = await strapi.query('api::post.post').findOne({
          where: { id: post }
        });

        if (!postExists) {
          throw new Error('Post non trouvé');
        }

        // Si c'est une réponse, vérifier que le commentaire parent existe
        if (parent) {
          const parentExists = await strapi.query('api::comment.comment').findOne({
            where: { id: parent }
          });

          if (!parentExists) {
            throw new Error('Commentaire parent non trouvé');
          }
        }

        // Création du commentaire
        const comment = await strapi.entityService.create('api::comment.comment', {
          data: {
            content,
            author: userId,
            post,
            parent,
            publishedAt: new Date()
          },
          populate: {
            author: {
              fields: ['id', 'username'],
              populate: {
                avatar: {
                  fields: ['url', 'name']
                }
              }
            },
            post: {
              fields: ['id', 'title']
            },
            parent: {
              fields: ['id']
            }
          }
        });

        return comment;
      });

      return {
        data: result
      };

    } catch (error) {
      if (error.message === 'Post non trouvé') {
        return ctx.notFound(error.message);
      }
      if (error.message === 'Commentaire parent non trouvé') {
        return ctx.notFound(error.message);
      }
      return ctx.throw(500, error);
    }
  },

  async find(ctx) {
    // On surcharge la récupération pour bien populate toutes les relations utiles
    ctx.query = {
      ...ctx.query,
      populate: {
        parent: { fields: ['id'] },
        author: {
          fields: ['id', 'username'],
          populate: { avatar: { fields: ['url', 'name'] } }
        },
        post: { fields: ['id', 'title'] },
        upvotes: true,
        downvotes: true,
      }
    };
    // On appelle le contrôleur de base avec ce populate
    return await super.find(ctx);
  },

  // Route custom pour récupérer l'arbre des commentaires d'un post
  async thread(ctx) {
    const postId = ctx.query.post;
    if (!postId) {
      return ctx.badRequest('Paramètre post manquant');
    }

    // Récupère tous les commentaires du post, avec parent et author/avatar
    const comments = await strapi.entityService.findMany('api::comment.comment', {
      filters: { post: postId },
      populate: {
        parent: { fields: ['id'] },
        author: { fields: ['id', 'username'], populate: { avatar: { fields: ['url', 'name'] } } },
        upvotes: true,
        downvotes: true,
      },
      sort: ['createdAt:asc'],
      publicationState: 'preview',
      limit: 1000,
    });

    // On construit la map id -> commentaire
    const commentMap = {};
    comments.forEach((c) => {
      commentMap[c.id] = { ...c, replies: [] };
    });

    // On construit l'arbre
    const roots = [];
    comments.forEach((c) => {
      const parentId = (c as any).parent?.id;
      if (parentId && commentMap[parentId]) {
        commentMap[parentId].replies.push(commentMap[c.id]);
      } else {
        roots.push(commentMap[c.id]);
      }
    });

    ctx.body = roots;
  },

  async upvote(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const comment = await strapi.db.query('api::comment.comment').findOne({
        where: { id },
        populate: ['upvotes', 'downvotes', 'author', 'post']
      });

      if (!comment) {
        return ctx.notFound('Commentaire non trouvé');
      }

      const upvoteIds = comment.upvotes?.map(u => u.id) || [];
      const downvoteIds = comment.downvotes?.map(d => d.id) || [];

      if (upvoteIds.includes(userId)) {
        return ctx.badRequest('Vous avez déjà upvoté ce commentaire');
      }

      const data = {
        upvotes: [...upvoteIds, userId],
        downvotes: downvoteIds.filter(id => id !== userId)
      };

      const updatedComment = await strapi.db.query('api::comment.comment').update({
        where: { id },
        data,
        populate: ['upvotes', 'downvotes', 'author', 'post']
      });

      const score = (updatedComment.upvotes?.length || 0) - (updatedComment.downvotes?.length || 0);

      return {
        data: {
          ...updatedComment,
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

      const comment = await strapi.db.query('api::comment.comment').findOne({
        where: { id },
        populate: ['upvotes', 'downvotes', 'author', 'post']
      });

      if (!comment) {
        return ctx.notFound('Commentaire non trouvé');
      }

      const upvoteIds = comment.upvotes?.map(u => u.id) || [];
      const downvoteIds = comment.downvotes?.map(d => d.id) || [];

      if (downvoteIds.includes(userId)) {
        return ctx.badRequest('Vous avez déjà downvoté ce commentaire');
      }

      const data = {
        downvotes: [...downvoteIds, userId],
        upvotes: upvoteIds.filter(id => id !== userId)
      };

      const updatedComment = await strapi.db.query('api::comment.comment').update({
        where: { id },
        data,
        populate: ['upvotes', 'downvotes', 'author', 'post']
      });

      const score = (updatedComment.upvotes?.length || 0) - (updatedComment.downvotes?.length || 0);

      return {
        data: {
          ...updatedComment,
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

      const comment = await strapi.db.query('api::comment.comment').findOne({
        where: { id },
        populate: ['upvotes']
      });

      if (!comment) {
        return ctx.notFound('Commentaire non trouvé');
      }

      const upvoteIds = comment.upvotes?.map(u => u.id) || [];

      if (!upvoteIds.includes(userId)) {
        return ctx.badRequest('Vous n\'avez pas upvoté ce commentaire');
      }

      const updatedComment = await strapi.db.query('api::comment.comment').update({
        where: { id },
        data: {
          upvotes: upvoteIds.filter(id => id !== userId)
        },
        populate: ['upvotes', 'downvotes']
      });

      return { data: updatedComment };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async removeDownvote(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const comment = await strapi.db.query('api::comment.comment').findOne({
        where: { id },
        populate: ['downvotes']
      });

      if (!comment) {
        return ctx.notFound('Commentaire non trouvé');
      }

      const downvoteIds = comment.downvotes?.map(d => d.id) || [];

      if (!downvoteIds.includes(userId)) {
        return ctx.badRequest('Vous n\'avez pas downvoté ce commentaire');
      }

      const updatedComment = await strapi.db.query('api::comment.comment').update({
        where: { id },
        data: {
          downvotes: downvoteIds.filter(id => id !== userId)
        },
        populate: ['upvotes', 'downvotes']
      });

      return { data: updatedComment };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Utilisateur non authentifié');
      }
      // On récupère le commentaire
      const comment = await strapi.db.query('api::comment.comment').findOne({
        where: { id },
        populate: ['author', 'replies']
      });
      if (!comment) {
        return ctx.notFound('Commentaire non trouvé');
      }
      // Seul l'auteur ou un admin peut supprimer
      const isAdmin = user.roles?.some(r => r.code === 'strapi-super-admin' || r.code === 'admin');
      if (comment.author?.id !== user.id && !isAdmin) {
        return ctx.forbidden('Vous n\'êtes pas autorisé à supprimer ce commentaire');
      }
      // Suppression récursive des réponses
      async function deleteReplies(commentId: number) {
        const replies = await strapi.db.query('api::comment.comment').findMany({ where: { parent: commentId } });
        for (const reply of replies) {
          await deleteReplies(reply.id);
          await strapi.db.query('api::comment.comment').delete({ where: { id: reply.id } });
        }
      }
      await deleteReplies(comment.id);
      await strapi.db.query('api::comment.comment').delete({ where: { id: comment.id } });
      ctx.body = { message: 'Commentaire supprimé' };
    } catch (error) {
      return ctx.throw(500, error);
    }
  },
}));

export default createCommentController;
