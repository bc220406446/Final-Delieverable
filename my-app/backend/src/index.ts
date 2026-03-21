import type { Core } from '@strapi/strapi';

const OTP_TTL_MS = 10 * 60 * 1000;

async function sendOtpEmail(strapiInstance: Core.Strapi, userId: number, email: string) {
  const otp       = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await (strapiInstance.entityService as any).update(
    'plugin::users-permissions.user',
    userId,
    { data: { otpCode: otp, otpExpiry } as any }
  );

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const confirmLink = `${frontendUrl}/confirm-email?email=${encodeURIComponent(email)}&code=${otp}`;

  await (strapiInstance.plugin('email').service('email') as any).send({
    to: email, subject: 'Verify your CSEP account',
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#14532d;margin-bottom:8px">Verify your account</h2>
        <p style="color:#6b7280;margin-bottom:24px">Thanks for registering on <strong>Community Skills Exchange Platform</strong>. Use the 6-digit code below or click the button to verify instantly.</p>
        <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px">Your verification code</p>
          <p style="margin:0;font-size:40px;font-weight:900;letter-spacing:12px;color:#15803d">${otp}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#9ca3af">Valid for 10 minutes</p>
        </div>
        <a href="${confirmLink}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:15px">Verify My Email</a>
        <hr style="margin:28px 0;border:none;border-top:1px solid #e5e7eb" />
        <p style="font-size:12px;color:#9ca3af">This code expires in 10 minutes. If you did not create an account, ignore this email.</p>
      </div>`,
    text: `Your CSEP verification code is: ${otp}\n\nOr verify instantly: ${confirmLink}\n\nThis code expires in 10 minutes.`,
  });
  strapiInstance.log.info(`[CSEP] ✅ OTP email sent to ${email} (userId=${userId})`);
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {

    // ── DB lifecycle: send OTP after user registration ────────────────────────
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],
      async afterCreate(event: any) {
        const { result } = event;
        strapi.log.info(`[CSEP] afterCreate — email=${result?.email}, id=${result?.id}`);
        if (!result?.email || !result?.id) return;
        try {
          await sendOtpEmail(strapi, result.id, result.email);
        } catch (err: any) {
          strapi.log.error(`[CSEP] OTP send failed: ${err?.message}`);
        }
      },
    });

    strapi.log.info('[CSEP] ✅ Bootstrap complete.');
  },
};
