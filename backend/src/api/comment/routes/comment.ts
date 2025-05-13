/**
 * comment router
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/comments/thread',
      handler: 'comment.thread',    
      config: {
        policies: [],
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/comments',
      handler: 'comment.create',
      config: {
        policies: [],
        auth: {
          scope: ['api::comment.comment.create']
        }
      }
    },
    // Routes de vote
    {
      method: 'POST',
      path: '/comments/:id/upvote',
      handler: 'comment.upvote',
      config: {
        auth: {
          scope: ['api::comment.comment.upvote']
        }
      }
    },
    {
      method: 'POST',
      path: '/comments/:id/downvote',
      handler: 'comment.downvote',
      config: {
        auth: {
          scope: ['api::comment.comment.downvote']
        }
      }
    },
    {
      method: 'POST',
      path: '/comments/:id/remove-upvote',
      handler: 'comment.removeUpvote',
      config: {
        auth: {
          scope: ['api::comment.comment.removeUpvote']
        }
      }
    },
    {
      method: 'POST',
      path: '/comments/:id/remove-downvote',
      handler: 'comment.removeDownvote',
      config: {
        auth: {
          scope: ['api::comment.comment.removeDownvote']
        }
      }
    },
    {
      method: 'DELETE',
      path: '/comments/:id',
      handler: 'comment.delete',
      config: {
        auth: {
          scope: ['api::comment.comment.delete']
        }
      }
    }
  ]
};
