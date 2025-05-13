/**
 * community router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    // Routes par défaut
    {
      method: 'GET',
      path: '/communities',
      handler: 'community.find',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/communities/:id',
      handler: 'community.findOne',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/communities',
      handler: 'community.create'
    },
    // Routes personnalisées
    {
      method: 'GET',
      path: '/communities/by-name/:name',
      handler: 'community.findByName',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/communities/user/:id',
      handler: 'community.findUserCommunities',
      config: {
        auth: false
      }
    },
    {
      method: 'PUT',
      path: '/communities/custom-update/:id',
      handler: 'community.updateCommunity',
      config: {
        auth: {
          scope: ['api::community.community.updateCommunity']
        }
      }
    },
    {
      method: 'DELETE',
      path: '/communities/:id',
      handler: 'community.deleteCommunity',
      config: {
        auth: {
          scope: ['api::community.community.deleteCommunity']
        }
      }
    }
  ]
};
