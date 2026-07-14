import type { Core } from '@strapi/strapi';

const OTP_TTL_MS = 10 * 60 * 1000;

async function sendRegistrationOtp(strapi: Core.Strapi, userId: number, email: string) {
  const otp       = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + OTP_TTL_MS).toISOString();

  await (strapi.entityService as any).update(
    'plugin::users-permissions.user',
    userId,
    { data: { otpCode: otp, otpExpiry } as any }
  );

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const confirmLink = `${frontendUrl}/confirm-email?email=${encodeURIComponent(email)}&code=${otp}`;
  const subject = 'Verify your CSEP account';

  await (strapi.plugin('email').service('email') as any).send({
    to: email,
    subject,
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
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Log every email sent through Strapi's email service, including emails triggered internally by plugins (such as forgot-password emails).
    const emailService = strapi.plugin('email').service('email') as any;
    const originalSend = emailService.send.bind(emailService);

    emailService.send = async (options: any) => {
      const recipient = Array.isArray(options?.to) ? options.to.join(', ') : options?.to ?? 'unknown recipient';
      const subject = options?.subject ?? 'No subject';

      try {
        const result = await originalSend(options);
        strapi.log.info(`[CSEP] Email sent successfully to ${recipient} | Subject: ${subject}`);
        return result;
      } catch (err: any) {
        strapi.log.warn(`[CSEP] Email failed to send to ${recipient} | Subject: ${subject} | Error: ${err?.message ?? err}`);
        throw err;
      }
    };

    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],
      async afterCreate(event: any) {
        const { result } = event;
        strapi.log.info(`[CSEP] User afterCreate lifecycle fired for ${result?.email ?? 'unknown email'}`);

        if (!result?.email || !result?.id) return;

        try {
          await sendRegistrationOtp(strapi, result.id, result.email);
        } catch { /* Central email logger records the delivery failure. */ }
      },
    });

    strapi.log.info('[CSEP] Bootstrap complete.');
  },
};
