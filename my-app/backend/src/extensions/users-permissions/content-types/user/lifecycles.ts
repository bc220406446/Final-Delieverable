// Database lifecycle hook for the User model.
// afterCreate fires AFTER the user row is fully committed to the database.
// This is the most reliable place to send the OTP - no race condition,
// no controller override needed, works in Strapi v5 guaranteed.

const OTP_TTL_MS = 10 * 60 * 1000;

export default {

  // Fires after every new user is created - including registration.
  async afterCreate(event: any) {
    const { result } = event;

    // Only send OTP for users created via registration (not admin-created users).
    // confirmed=false means they just registered and need to verify.
    if (!result?.email || result?.confirmed === true) return;

    strapi.log.info(`[CSEP] afterCreate lifecycle triggered for ${result.email}`);

    try {
      const otp       = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + OTP_TTL_MS).toISOString();

      // Save OTP - user is fully in DB now so this update is safe.
      await (strapi.entityService as any).update(
        'plugin::users-permissions.user',
        result.id,
        { data: { otpCode: otp, otpExpiry } as any }
      );

      const frontendUrl  = process.env.FRONTEND_URL ?? 'http://localhost:3000';
      const encodedEmail = encodeURIComponent(result.email);
      const confirmLink  = `${frontendUrl}/confirm-email?email=${encodedEmail}&code=${otp}`;

      await (strapi.plugin('email').service('email') as any).send({
        to:      result.email,
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

      strapi.log.info(`[CSEP] OTP email sent to ${result.email} (userId=${result.id})`);

    } catch (err: any) {
      strapi.log.error(`[CSEP] afterCreate OTP error for ${result.email}: ${err?.message ?? err}`);
    }
  },
};
