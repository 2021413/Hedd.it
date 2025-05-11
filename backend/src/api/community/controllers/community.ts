/**
 * community controller
 */

import { factories } from '@strapi/strapi'

const createCommunityController = factories.createCoreController('api::community.community', ({ strapi }) => ({
  async create(ctx) {
    try {
      const userId = ctx.state.user.id;
      
      // Ajout automatique du créateur comme membre et modérateur
      ctx.request.body.data = {
        ...ctx.request.body.data,
        creator: userId,
        moderators: [userId],
        members: [userId]
      };

      // Création de la communauté avec le contrôleur par défaut
      const response = await super.create(ctx);
      return response;
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
              media: true
            }
          },
          avatar: true,
          banner: true
        }
      }) as any[];

      if (!entry || entry.length === 0) {
        return ctx.notFound('Communauté non trouvée');
      }

      const community = entry[0] as any;

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
  }
}));

export default createCommunityController;
