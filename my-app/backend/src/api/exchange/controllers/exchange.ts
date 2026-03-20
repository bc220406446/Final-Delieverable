import { factories } from '@strapi/strapi';

const es = () => strapi.entityService as any;

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await (strapi.plugin('email').service('email') as any).send({
      to, subject, html, text: html.replace(/<[^>]+>/g, ''),
    });
  } catch (err: any) {
    strapi.log.warn(`[CSEP] Exchange email failed: ${err?.message}`);
  }
}

export default factories.createCoreController('api::exchange.exchange', () => ({

  // GET /api/exchanges/my-exchanges
  async myExchanges(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const [asRequester, asProvider] = await Promise.all([
      es().findMany('api::exchange.exchange', {
        filters: { requester_email: user.email },
        sort:    { createdAt: 'desc' },
      }),
      es().findMany('api::exchange.exchange', {
        filters: { provider_email: user.email },
        sort:    { createdAt: 'desc' },
      }),
    ]);

    // Merge and deduplicate by id
    const seen  = new Set<number>();
    const all   = [...asRequester, ...asProvider].filter((e: any) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    return ctx.send({ data: all });
  },

  // PATCH /api/exchanges/:id/confirm
  // The calling user marks their side as done.
  // When both sides confirmed → status becomes completed.
  async confirm(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id }  = ctx.params;
    const exchange = await es().findOne('api::exchange.exchange', id);
    if (!exchange)                          return ctx.notFound('Exchange not found.');
    if (exchange.status !== 'active')       return ctx.badRequest('Exchange is not active.');

    const isRequester = exchange.requester_email === user.email;
    const isProvider  = exchange.provider_email  === user.email;
    if (!isRequester && !isProvider)        return ctx.forbidden('Not your exchange.');

    // Determine which flag to set
    const updateData: any = {};
    if (isRequester) updateData.requester_confirmed = true;
    if (isProvider)  updateData.provider_confirmed  = true;

    // Check if the other side already confirmed → auto-complete
    const otherConfirmed = isRequester
      ? exchange.provider_confirmed
      : exchange.requester_confirmed;

    if (otherConfirmed) updateData.status = 'completed';

    const updated = await es().update('api::exchange.exchange', id, { data: updateData });

    // If just completed, email both parties
    if (updateData.status === 'completed') {
      const completionHtml = (name: string) =>
        `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#14532d">🎉 Exchange Completed!</h2>
          <p>Hi <strong>${name}</strong>, your skill exchange has been completed successfully.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
            <tr><td style="padding:6px 0;color:#6b7280;width:140px">Exchange ID:</td><td style="font-weight:600">${exchange.exchange_id}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Skills exchanged:</td><td style="font-weight:600">${exchange.skill_a_title} ↔ ${exchange.skill_b_title}</td></tr>
          </table>
          <p style="color:#6b7280;font-size:13px">You can now leave a review from your Exchanges page.</p>
        </div>`;

      await Promise.all([
        sendEmail(exchange.requester_email, 'Exchange Completed — CSEP', completionHtml(exchange.requester_name)),
        sendEmail(exchange.provider_email,  'Exchange Completed — CSEP', completionHtml(exchange.provider_name)),
      ]);
    }

    return ctx.send({ data: updated });
  },

  // PATCH /api/exchanges/:id/cancel
  async cancel(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const { id }   = ctx.params;
    const exchange  = await es().findOne('api::exchange.exchange', id);
    if (!exchange)                    return ctx.notFound('Exchange not found.');
    if (exchange.status !== 'active') return ctx.badRequest('Exchange is not active.');

    const isRequester = exchange.requester_email === user.email;
    const isProvider  = exchange.provider_email  === user.email;
    if (!isRequester && !isProvider)  return ctx.forbidden('Not your exchange.');

    const updated = await es().update('api::exchange.exchange', id, { data: { status: 'cancelled' } });

    // Notify the other party
    const cancellerName = isRequester ? exchange.requester_name : exchange.provider_name;
    const otherEmail    = isRequester ? exchange.provider_email : exchange.requester_email;
    const otherName     = isRequester ? exchange.provider_name  : exchange.requester_name;

    await sendEmail(
      otherEmail,
      'Exchange Cancelled — CSEP',
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#991b1b">Exchange Cancelled</h2>
        <p>Hi <strong>${otherName}</strong>, <strong>${cancellerName}</strong> has cancelled the exchange.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">
          <tr><td style="padding:6px 0;color:#6b7280;width:140px">Exchange ID:</td><td style="font-weight:600">${exchange.exchange_id}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Skills:</td><td style="font-weight:600">${exchange.skill_a_title} ↔ ${exchange.skill_b_title}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px">You can report any issues from the Exchanges page.</p>
      </div>`
    );

    return ctx.send({ data: updated });
  },

}));
