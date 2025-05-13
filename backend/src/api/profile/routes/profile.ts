export default {
  routes: [
    {
      method: 'GET',
      path: '/profile/:id',
      handler: 'profile.find',
      config: {
        policies: [],
        auth: {
          scope: ['api::profile.profile.find']
        }
      },
    },
  ],
}; 