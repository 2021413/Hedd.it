/**
 * post router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    // Routes par défaut
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/posts/:id',
      handler: 'post.findOne',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/posts',
      handler: 'post.create'
    },
    // Routes personnalisées
    {
      method: 'POST',
      path: '/posts/create',
      handler: 'post.create',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'PUT',
      path: '/posts/:id',
      handler: 'post.update',
      config: {
        auth: {
          scope: ['update']
        }
      }
    },
    {
      method: 'DELETE',
      path: '/posts/:id',
      handler: 'post.delete',
      config: {
        auth: {
          scope: ['delete']
        }
      }
    },
    // Routes de vote
    {
      method: 'POST',
      path: '/posts/:id/upvote',
      handler: 'post.upvote',
      config: {
        auth: {
          scope: ['api::post.post.upvote']
        }
      }
    },
    {
      method: 'POST',
      path: '/posts/:id/downvote',
      handler: 'post.downvote',
      config: {
        auth: {
          scope: ['api::post.post.downvote']
        }
      }
    },
    {
      method: 'POST',
      path: '/posts/:id/remove-upvote',
      handler: 'post.removeUpvote',
      config: {
        auth: {
          scope: ['api::post.post.removeUpvote']
        }
      }
    },
    {
      method: 'POST',
      path: '/posts/:id/remove-downvote',
      handler: 'post.removeDownvote',
      config: {
        auth: {
          scope: ['api::post.post.removeDownvote']
        }
      }
    }
  ]
};
