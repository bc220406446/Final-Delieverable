import { factories } from '@strapi/strapi';

const es = () => strapi.entityService as any;

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await (strapi.plugin('email').service('email') as any).send({
      to, subject, html, text: html.replace(/<[^>]+>/g, ''),
    });
  } catch (err: any) {
    strapi.log.warn('[CSEP] Exchange email failed: ' + err?.message);
  }
}

export default factories.createCoreController('api::exchange.exchange', () => ({

  // GET /api/exchanges/my-exchanges
  async myExchanges(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const [asRequester, asProvider] = await Promise.all([
      es().findMany('api::exchange.exchange', { filters: { requester_email: user.email }, sort: { createdAt: 'desc' } }),
      es().findMany('api::exchange.exchange', { filters: { provider_email:  user.email }, sort: { createdAt: 'desc' } }),
    ]);
    const seen = new Set<number>();
    const all  = [...asRequester, ...asProvider].filter((e: any) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id); return true;
    });
    return ctx.send({ data: all });
  },

  // PATCH /api/exchanges/:id/confirm
  //
  // Each user has TWO possible actions depending on context:
  //   action=deliver  → mark MY skill as delivered to the other person
  //   action=receive  → confirm I received the other person's skill
  //
  // skill_a = requester's skill (User A delivers to User B)
  // skill_b = provider's skill  (User B delivers to User A)
  //
  //   Requester (User A):
  //     deliver → sets skill_a_delivered = true
  //     receive → sets skill_b_received  = true  (only after skill_b_delivered)
  //
  //   Provider (User B):
  //     deliver → sets skill_b_delivered = true
  //     receive → sets skill_a_received  = true  (only after skill_a_delivered)
  //
  // Completed when: skill_a_delivered + skill_a_received + skill_b_delivered + skill_b_received
  //
  async confirm(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const { id }    = ctx.params;
    const body      = ctx.request.body?.data ?? ctx.request.body ?? {};
    const action    = body.action as 'deliver' | 'receive';

    if (!action) return ctx.badRequest('action is required: deliver or receive');

    const ex = await es().findOne('api::exchange.exchange', id);
    if (!ex)                    return ctx.notFound('Exchange not found.');
    if (ex.status !== 'active') return ctx.badRequest('Exchange is not active.');

    const isRequester = ex.requester_email === user.email;
    const isProvider  = ex.provider_email  === user.email;
    if (!isRequester && !isProvider) return ctx.forbidden('Not your exchange.');

    const update: any = {};

    if (action === 'deliver') {
      if (isRequester) {
        if (ex.skill_a_delivered) return ctx.badRequest('Already marked as delivered.');
        update.skill_a_delivered = true;
      } else {
        if (ex.skill_b_delivered) return ctx.badRequest('Already marked as delivered.');
        update.skill_b_delivered = true;
      }
    }

    if (action === 'receive') {
      if (isRequester) {
        // User A receives skill_b from User B — only after skill_b_delivered
        if (!ex.skill_b_delivered) return ctx.badRequest('Provider has not delivered yet.');
        if (ex.skill_b_received)   return ctx.badRequest('Already confirmed.');
        update.skill_b_received = true;
      } else {
        // User B receives skill_a from User A — only after skill_a_delivered
        if (!ex.skill_a_delivered) return ctx.badRequest('Requester has not delivered yet.');
        if (ex.skill_a_received)   return ctx.badRequest('Already confirmed.');
        update.skill_a_received = true;
      }
    }

    // Check completion — all 4 flags must be true
    const aDelivered = update.skill_a_delivered || ex.skill_a_delivered;
    const aReceived  = update.skill_a_received  || ex.skill_a_received;
    const bDelivered = update.skill_b_delivered || ex.skill_b_delivered;
    const bReceived  = update.skill_b_received  || ex.skill_b_received;

    if (aDelivered && aReceived && bDelivered && bReceived) {
      update.status = 'completed';
    }

    const updated = await es().update('api::exchange.exchange', id, { data: update });

    // Email both on completion
    if (update.status === 'completed') {
      let html = '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">';
      html += '<h2 style="color:#14532d;margin-bottom:8px">Exchange Completed!</h2>';
      html += '<p>Your skill exchange has been completed successfully.</p>';
      html += '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">';
      html += '<tr><td style="padding:6px 0;color:#6b7280;width:140px">Exchange ID:</td><td style="font-weight:600">' + ex.exchange_id + '</td></tr>';
      html += '<tr><td style="padding:6px 0;color:#6b7280">Skills exchanged:</td><td style="font-weight:600">' + ex.skill_a_title + ' &harr; ' + ex.skill_b_title + '</td></tr>';
      html += '</table>';
      html += '<p style="color:#6b7280;font-size:13px">You can now leave a review from your Exchanges page.</p>';
      html += '</div>';
      await Promise.all([
        sendEmail(ex.requester_email, 'Exchange Completed — CSEP', html),
        sendEmail(ex.provider_email,  'Exchange Completed — CSEP', html),
      ]);
    }

    return ctx.send({ data: updated });
  },

  // PATCH /api/exchanges/:id/cancel
  async cancel(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const { id }  = ctx.params;
    const ex       = await es().findOne('api::exchange.exchange', id);
    if (!ex)                    return ctx.notFound('Exchange not found.');
    if (ex.status !== 'active') return ctx.badRequest('Exchange is not active.');
    const isRequester = ex.requester_email === user.email;
    const isProvider  = ex.provider_email  === user.email;
    if (!isRequester && !isProvider) return ctx.forbidden('Not your exchange.');

    const updated      = await es().update('api::exchange.exchange', id, { data: { status: 'cancelled' } });
    const cancellerName = isRequester ? ex.requester_name : ex.provider_name;
    const otherEmail    = isRequester ? ex.provider_email : ex.requester_email;
    const otherName     = isRequester ? ex.provider_name  : ex.requester_name;

    let html = '<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">';
    html += '<h2 style="color:#991b1b;margin-bottom:8px">Exchange Cancelled</h2>';
    html += '<p>Hi <strong>' + otherName + '</strong>, <strong>' + cancellerName + '</strong> has cancelled the exchange.</p>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">';
    html += '<tr><td style="padding:6px 0;color:#6b7280;width:140px">Exchange ID:</td><td style="font-weight:600">' + ex.exchange_id + '</td></tr>';
    html += '</table>';
    html += '</div>';
    await sendEmail(otherEmail, 'Exchange Cancelled — CSEP', html);

    return ctx.send({ data: updated });
  },

}));
