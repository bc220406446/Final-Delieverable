export default {
  routes: [
    {
      method:  'GET',
      path:    '/skill-categories',
      handler: 'skill-category.find',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'POST',
      path:    '/skill-categories',
      handler: 'skill-category.create',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'PUT',
      path:    '/skill-categories/:id',
      handler: 'skill-category.update',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'DELETE',
      path:    '/skill-categories/:id',
      handler: 'skill-category.delete',
      config:  { policies: [], middlewares: [] },
    },
  ],
};
