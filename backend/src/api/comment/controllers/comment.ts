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
              fields: ['id', 'username']
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
  }
}));

export default createCommentController;
