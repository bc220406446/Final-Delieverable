export default {
  routes: [
    {
      method:  'GET',
      path:    '/exchanges/my-exchanges',
      handler: 'exchange.myExchanges',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'PATCH',
      path:    '/exchanges/:id/confirm',
      handler: 'exchange.confirm',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'PATCH',
      path:    '/exchanges/:id/cancel',
      handler: 'exchange.cancel',
      config:  { policies: [], middlewares: [] },
    },
  ],
};
