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
    }
  ]
};
