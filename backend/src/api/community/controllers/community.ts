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
  }
}));

export default createCommunityController;
