const OTP_TTL_MS = 10 * 60 * 1000;
const es = () => strapi.entityService as any;

// Finds user by ID first (preferred — no race condition), falls back to
// email lookup with retries (used for resend flow).
async function findUser(userId?: number, email?: string): Promise<any | null> {
  if (userId) {
    try {
      const user = await es().findOne('plugin::users-permissions.user', userId);
      if (user) return user;
    } catch { /* fall through to email lookup */ }
  }

  if (email) {
    for (let i = 0; i < 5; i++) {
      const users = (await es().findMany(
        'plugin::users-permissions.user',
        { filters: { email: email.toLowerCase() } }
      )) as any[];
      if (users && users.length > 0) return users[0];
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return null;
}

export default {

  // POST /api/otp/send
  async send(ctx: any) {
    const { email, userId } = ctx.request.body as { email?: string; userId?: number };

    if (!email) return ctx.badRequest('Email is required.');

    const user = await findUser(userId, email);
    if (!user) return ctx.send({ ok: true }); // avoid email enumeration

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS).toISOString();

    await es().update(
      'plugin::users-permissions.user',
      user.id,
      { data: { otpCode: otp, otpExpiry } as any }
    );

    const frontendUrl  = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const encodedEmail = encodeURIComponent(user.email);
    const confirmLink  = `${frontendUrl}/confirm-email?email=${encodedEmail}&code=${otp}`;

    await (strapi.plugin('email').service('email') as any).send({
      to:      user.email,
      subject: 'Verify your CSEP account',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#14532d;margin-bottom:8px">Verify your account</h2>
          <p style="color:#6b7280;margin-bottom:24px">
            Thanks for registering on <strong>Community Skills Exchange Platform</strong>.
            Use the 6-digit code below <em>or</em> click the button to verify instantly.
          </p>
          <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Your verification code</p>
            <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:12px;color:#15803d">${otp}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#9ca3af">Valid for 10 minutes</p>
          </div>
          <p style="color:#374151;margin-bottom:12px">Or click the button below to verify instantly:</p>
          <a href="${confirmLink}"
            style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:15px">
            Verify My Email
          </a>
          <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb" />
          <p style="font-size:12px;color:#9ca3af">
            This code expires in 10 minutes. If you did not create an account, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `Your CSEP verification code is: ${otp}\n\nOr verify instantly: ${confirmLink}\n\nThis code expires in 10 minutes.`,
    });

    strapi.log.info(`[CSEP] OTP email sent to ${user.email}`);
    return ctx.send({ ok: true });
  },

  // POST /api/otp/verify
  async verify(ctx: any) {
    const { email, code } = ctx.request.body as { email?: string; code?: string };

    if (!email || !code) return ctx.badRequest('Email and code are required.');

    const users = (await es().findMany(
      'plugin::users-permissions.user',
      { filters: { email: email.toLowerCase() } }
    )) as any[];

    if (!users || users.length === 0) return ctx.badRequest('Invalid verification code.');

    const user = users[0];

    if (user.otpCode !== code)
      return ctx.badRequest('Invalid verification code.');

    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry))
      return ctx.badRequest('Code expired. Please request a new one.');

    await es().update(
      'plugin::users-permissions.user',
      user.id,
      { data: { confirmed: true, otpCode: null, otpExpiry: null } as any }
    );

    const jwt = (strapi.plugin('users-permissions').service('jwt') as any)
      .issue({ id: user.id });

    const fullUser = await es().findOne(
      'plugin::users-permissions.user',
      user.id,
      { populate: ['role'] }
    );

    return ctx.send({ jwt, user: fullUser });
  },
};
