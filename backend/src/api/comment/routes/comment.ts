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
    }
  ]
};
