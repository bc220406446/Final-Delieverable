export default {
  routes: [
    {
      method:  'GET',
      path:    '/reviews/my-reviews',
      handler: 'review.myReviews',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'POST',
      path:    '/reviews',
      handler: 'review.create',
      config:  { policies: [], middlewares: [] },
    },
  ],
};
