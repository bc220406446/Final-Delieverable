import { factories } from '@strapi/strapi';

const es = () => strapi.entityService as any;

async function sendRequestEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    await (strapi.plugin('email').service('email') as any).send({ to, subject, html,
      text: html.replace(/<[^>]+>/g, '') });
  } catch (err: any) {
    strapi.log.warn(`[CSEP] Email send failed: ${err?.message}`);
  }
}

export default factories.createCoreController('api::request.request', () => ({

  // GET /api/requests/my-requests
  async myRequests(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    const [sent, received] = await Promise.all([
      es().findMany('api::request.request', { filters: { requester_email: user.email }, sort: { createdAt: 'desc' } }),
      es().findMany('api::request.request', { filters: { provider_email: user.email },  sort: { createdAt: 'desc' } }),
    ]);
    return ctx.send({ sent, received });
  },

  // POST /api/requests
  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    const body = ctx.request.body?.data ?? ctx.request.body;

    if (body.provider_email === user.email)
      return ctx.badRequest('You cannot request your own skill.');

    const existing = await es().findMany('api::request.request', {
      filters: { requester_email: user.email, requested_skill_id: body.requested_skill_id, status: 'pending' },
    });
    if (existing?.length > 0)
      return ctx.badRequest('You already have a pending request for this skill.');

    const created = await es().create('api::request.request', {
      data: { ...body, requester_email: user.email, requester_name: user.fullName || user.username, status: 'pending' },
    });

    // Email to provider
    await sendRequestEmail(
      body.provider_email,
      'New Skill Exchange Request — CSEP',
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#14532d">New Exchange Request</h2>
        <p><strong>${user.fullName || user.username}</strong> wants to exchange skills with you.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
          <tr><td style="padding:6px 0;color:#6b7280;width:140px">Requesting your skill:</td><td style="font-weight:600">${body.requested_skill_title}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Offering in exchange:</td><td style="font-weight:600">${body.offered_skill_title}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Preferred slot:</td><td>${body.preferred_slot}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Mode:</td><td>${body.mode}</td></tr>
          ${body.message ? `<tr><td style="padding:6px 0;color:#6b7280">Message:</td><td>${body.message}</td></tr>` : ''}
        </table>
        <p style="color:#6b7280;font-size:13px">Log in to your CSEP dashboard to Accept or Reject this request.</p>
      </div>`
    );

    // Confirmation to requester
    await sendRequestEmail(
      user.email,
      'Request Sent — CSEP',
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#14532d">Your Request Was Sent!</h2>
        <p>Your exchange request has been sent to <strong>${body.provider_name}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
          <tr><td style="padding:6px 0;color:#6b7280;width:140px">Skill requested:</td><td style="font-weight:600">${body.requested_skill_title}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">You offered:</td><td style="font-weight:600">${body.offered_skill_title}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px">You'll receive an email when the provider responds.</p>
      </div>`
    );

    return ctx.send({ data: created });
  },

  // PUT /api/requests/:id — requester edits their pending request
  async update(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    const { id } = ctx.params;
    const req = await es().findOne('api::request.request', id);
    if (!req) return ctx.notFound('Request not found.');
    if (req.requester_email !== user.email) return ctx.forbidden('Not your request to edit.');
    if (req.status !== 'pending') return ctx.badRequest('Only pending requests can be edited.');
    const body = ctx.request.body?.data ?? ctx.request.body;
    const updated = await es().update('api::request.request', id, { data: body });
    return ctx.send({ data: updated });
  },

  // PATCH /api/requests/:id/accept
  async accept(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    const { id } = ctx.params;
    const req = await es().findOne('api::request.request', id);
    if (!req) return ctx.notFound('Request not found.');
    if (req.provider_email !== user.email) return ctx.forbidden('Not your request to accept.');
    if (req.status !== 'pending') return ctx.badRequest('Request is no longer pending.');

    const body   = ctx.request.body?.data ?? ctx.request.body ?? {};
    // Store accepted_skill_title = the single skill provider chose from requester's offered list.
    // This is what the provider will receive in the exchange.
    const updated = await es().update('api::request.request', id, {
      data: {
        status: 'accepted',
        accepted_skill_title: body.accepted_skill_title ?? '',
      },
    });

    // Email requester
    await sendRequestEmail(
      req.requester_email,
      'Your Request Was Accepted — CSEP',
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#14532d">🎉 Request Accepted!</h2>
        <p><strong>${req.provider_name}</strong> accepted your exchange request.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
          <tr><td style="padding:6px 0;color:#6b7280;width:140px">Skill exchange:</td><td style="font-weight:600">${req.requested_skill_title} ↔ ${req.offered_skill_title}</td></tr>
          ${body.accepted_skill_title ? `<tr><td style="padding:6px 0;color:#6b7280">They'll offer:</td><td style="font-weight:600">${body.accepted_skill_title}</td></tr>` : ''}
        </table>
        <p style="color:#6b7280;font-size:13px">Log in to your dashboard to view your exchanges.</p>
      </div>`
    );

    return ctx.send({ data: updated });
  },

  // PATCH /api/requests/:id/reject
  async reject(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    const { id } = ctx.params;
    const req = await es().findOne('api::request.request', id);
    if (!req) return ctx.notFound('Request not found.');
    if (req.provider_email !== user.email) return ctx.forbidden('Not your request to reject.');
    if (req.status !== 'pending') return ctx.badRequest('Request is no longer pending.');

    const updated = await es().update('api::request.request', id, { data: { status: 'rejected' } });

    // Email requester
    await sendRequestEmail(
      req.requester_email,
      'Your Request Was Declined — CSEP',
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#991b1b">Request Declined</h2>
        <p><strong>${req.provider_name}</strong> was unable to accept your request at this time.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
          <tr><td style="padding:6px 0;color:#6b7280;width:140px">Skill requested:</td><td style="font-weight:600">${req.requested_skill_title}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px">You can browse other skills and send new requests.</p>
      </div>`
    );

    return ctx.send({ data: updated });
  },

  // DELETE /api/requests/:id
  async delete(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    const { id } = ctx.params;
    const req = await es().findOne('api::request.request', id);
    if (!req) return ctx.notFound('Request not found.');
    if (req.requester_email !== user.email) return ctx.forbidden('Not your request to cancel.');
    if (req.status !== 'pending') return ctx.badRequest('Only pending requests can be cancelled.');
    await es().delete('api::request.request', id);
    return ctx.send({ data: null });
  },

}));
