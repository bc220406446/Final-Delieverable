import { factories } from '@strapi/strapi';

const es = () => strapi.entityService as any;

export default factories.createCoreController('api::report.report', () => ({

  // GET /api/reports/my-reports
  async myReports(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    const reports = await es().findMany('api::report.report', {
      filters: { reporter_email: user.email },
      sort:    { createdAt: 'desc' },
    });
    return ctx.send({ data: reports });
  },

  // POST /api/reports
  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    const body = ctx.request.body?.data ?? ctx.request.body;

    // Prevent duplicate pending report for same target by same user
    const existing = await es().findMany('api::report.report', {
      filters: {
        reporter_email: user.email,
        target_id:      body.target_id,
        report_status:  'pending',
      },
    });
    if (existing?.length > 0) {
      return ctx.badRequest('You already have a pending report for this target.');
    }

    const created = await es().create('api::report.report', {
      data: {
        type:           body.type,
        target_id:      body.target_id,
        target_label:   body.target_label,
        reason:         body.reason,
        description:    body.description,
        reporter_name:  user.fullName || user.username,
        reporter_email: user.email,
        report_status:  'pending',
      },
    });

    return ctx.send({ data: created });
  },

  // PATCH /api/reports/:id/resolve
  // Admin resolves: takes action on the reported content then marks resolved.
  async resolve(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    if (user.role?.type !== 'admin') return ctx.forbidden('Admin access required.');

    const { id } = ctx.params;
    const body   = ctx.request.body?.data ?? ctx.request.body ?? {};

    const report = await es().findOne('api::report.report', id);
    if (!report) return ctx.notFound('Report not found.');

    // action can be: 'block_user' | 'reject_skill' | 'block_user_and_reject_skill' | 'none'
    const action = body.action ?? 'none';

    if ((action === 'block_user' || action === 'block_user_and_reject_skill') && report.type !== 'Exchange') {
      // Block the reported user — find by target_id (email or username)
      const users = await es().findMany('plugin::users-permissions.user', {
        filters: {
          $or: [
            { email:    report.target_id },
            { username: report.target_id },
          ],
        },
      });
      if (users?.length > 0) {
        await es().update('plugin::users-permissions.user', users[0].id, {
          data: { blocked: true },
        });
        strapi.log.info(`[CSEP] User ${report.target_id} blocked via report ${id}`);
      }
    }

    if ((action === 'reject_skill' || action === 'block_user_and_reject_skill') && report.type === 'Skill') {
      // Reject the skill — find by title
      const skills = await es().findMany('api::skill.skill', {
        filters: { title: report.target_label },
        publicationState: 'preview',
      });
      if (skills?.length > 0) {
        await es().update('api::skill.skill', skills[0].id, {
          data: { state: 'rejected', publishedAt: null },
        });
        strapi.log.info(`[CSEP] Skill "${report.target_label}" rejected via report ${id}`);
      }
    }

    if (report.type === 'Exchange' && action === 'block_user') {
      // For exchange reports: block the other party (not reporter)
      const exchanges = await es().findMany('api::exchange.exchange', {
        filters: { exchange_id: report.target_id },
      });
      if (exchanges?.length > 0) {
        const exchange    = exchanges[0];
        // Block whoever is not the reporter
        const targetEmail = exchange.requester_email === report.reporter_email
          ? exchange.provider_email
          : exchange.requester_email;

        const users = await es().findMany('plugin::users-permissions.user', {
          filters: { email: targetEmail },
        });
        if (users?.length > 0) {
          await es().update('plugin::users-permissions.user', users[0].id, {
            data: { blocked: true },
          });
          strapi.log.info(`[CSEP] User ${targetEmail} blocked via exchange report ${id}`);
        }
      }
    }

    const updated = await es().update('api::report.report', id, {
      data: { report_status: 'resolved', admin_note: body.admin_note ?? '' },
    });

    return ctx.send({ data: updated });
  },

  // PATCH /api/reports/:id/dismiss
  async dismiss(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    if (user.role?.type !== 'admin') return ctx.forbidden('Admin access required.');

    const { id }   = ctx.params;
    const body     = ctx.request.body?.data ?? ctx.request.body ?? {};
    const report   = await es().findOne('api::report.report', id);
    if (!report)   return ctx.notFound('Report not found.');

    const updated = await es().update('api::report.report', id, {
      data: { report_status: 'dismissed', admin_note: body.admin_note ?? '' },
    });
    return ctx.send({ data: updated });
  },

}));