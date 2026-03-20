import { factories } from '@strapi/strapi';

const es = () => strapi.entityService as any;

export default factories.createCoreController('api::review.review', () => ({

  // GET /api/reviews/my-reviews
  // Returns reviews given by and received by the logged-in user.
  async myReviews(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const [given, received] = await Promise.all([
      es().findMany('api::review.review', {
        filters: { reviewer_email: user.email },
        sort:    { createdAt: 'desc' },
      }),
      es().findMany('api::review.review', {
        filters: { reviewee_email: user.email },
        sort:    { createdAt: 'desc' },
      }),
    ]);

    return ctx.send({ given, received });
  },

  // POST /api/reviews
  // Reviewer submits a review for a completed exchange.
  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const body = ctx.request.body?.data ?? ctx.request.body;

    // Validate the exchange exists and is completed
    const exchanges = await es().findMany('api::exchange.exchange', {
      filters: { exchange_id: body.exchange_id, status: 'completed' },
    });
    if (!exchanges?.length) {
      return ctx.badRequest('Exchange not found or not completed yet.');
    }

    const exchange = exchanges[0];

    // Verify reviewer is a participant
    const isRequester = exchange.requester_email === user.email;
    const isProvider  = exchange.provider_email  === user.email;
    if (!isRequester && !isProvider) {
      return ctx.forbidden('You are not a participant in this exchange.');
    }

    // Prevent duplicate review for same exchange by same reviewer
    const existing = await es().findMany('api::review.review', {
      filters: { exchange_id: body.exchange_id, reviewer_email: user.email },
    });
    if (existing?.length > 0) {
      return ctx.badRequest('You have already reviewed this exchange.');
    }

    // Reviewee is the other party
    const revieweeName  = isRequester ? exchange.provider_name  : exchange.requester_name;
    const revieweeEmail = isRequester ? exchange.provider_email : exchange.requester_email;
    // Skill being reviewed = what reviewer received
    const skillTitle    = isRequester ? exchange.skill_b_title  : exchange.skill_a_title;

    const created = await es().create('api::review.review', {
      data: {
        exchange_id:    body.exchange_id,
        reviewer_name:  user.fullName || user.username,
        reviewer_email: user.email,
        reviewee_name:  revieweeName,
        reviewee_email: revieweeEmail,
        skill_title:    skillTitle,
        rating:         body.rating,
        comment:        body.comment,
      },
    });

    return ctx.send({ data: created });
  },

}));
