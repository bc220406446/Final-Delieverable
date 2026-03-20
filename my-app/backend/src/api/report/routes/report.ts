export default {
  routes: [
    {
      method:  'GET',
      path:    '/reports/my-reports',
      handler: 'report.myReports',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'POST',
      path:    '/reports',
      handler: 'report.create',
      config:  { policies: [], middlewares: [] },
    },
    // Admin actions
    {
      method:  'PATCH',
      path:    '/reports/:id/resolve',
      handler: 'report.resolve',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'PATCH',
      path:    '/reports/:id/dismiss',
      handler: 'report.dismiss',
      config:  { policies: [], middlewares: [] },
    },
  ],
};
