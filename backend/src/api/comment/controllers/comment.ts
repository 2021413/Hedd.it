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
}));

export default createCommentController;
