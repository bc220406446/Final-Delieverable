export default {
  routes: [
    {
      method: 'GET',
      path: '/requests/my-requests',
      handler: 'request.myRequests',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/requests',
      handler: 'request.create',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PATCH',
      path: '/requests/:id/accept',
      handler: 'request.accept',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PATCH',
      path: '/requests/:id/reject',
      handler: 'request.reject',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'DELETE',
      path: '/requests/:id',
      handler: 'request.delete',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/requests/:id',
      handler: 'request.update',
      config: { policies: [], middlewares: [] },
    },
  ],
};
