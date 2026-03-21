// Extends users-permissions plugin:
// 1. Blocks Strapi's default confirmation email (OTP lifecycle handles it)
// 2. Overrides sendResetPasswordEmail to send a proper email with a real link

export default (plugin: any) => {
  const originalUserService = plugin.services.user;

  plugin.services.user = ({ strapi: strapiInstance }: any) => {
    const userService = originalUserService({ strapi: strapiInstance });

    // ── Block default confirmation email ──────────────────────────────────────
    userService.sendConfirmationEmail = async (user: any) => {
      strapiInstance.log.info(`[CSEP] Blocked default confirmation email for ${user?.email}`);
    };

    // ── Override reset password email ─────────────────────────────────────────
    // Strapi calls this method internally when /auth/forgot-password is hit.
    // We override it to send our own email with a proper frontend URL.
    // The resetToken parameter is the raw code Strapi generates — we embed it
    // directly in the link so /reset-password?code=... works correctly.
    userService.sendResetPasswordEmail = async (user: any, resetToken: string) => {
      strapiInstance.log.info(`[CSEP] sendResetPasswordEmail called for ${user?.email}`);

      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
      const resetLink   = `${frontendUrl}/reset-password?code=${resetToken}`;

      await (strapiInstance.plugin('email').service('email') as any).send({
        to:      user.email,
        subject: 'Reset your CSEP password',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
            <h2 style="color:#14532d;margin-bottom:8px">Reset your password</h2>
            <p style="color:#6b7280;margin-bottom:24px">
              We received a request to reset the password for your
              <strong>Community Skills Exchange Platform</strong> account.
              Click the button below to set a new password.
            </p>
            <div style="text-align:center;margin-bottom:24px">
              <a href="${resetLink}"
                style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px">
                Reset My Password
              </a>
            </div>
            <p style="color:#6b7280;font-size:13px;margin-bottom:8px">
              Or copy and paste this link into your browser:
            </p>
            <p style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 14px;font-size:12px;color:#374151;word-break:break-all;margin-bottom:24px">
              ${resetLink}
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:20px" />
            <p style="font-size:12px;color:#9ca3af">
              This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        `,
        text: `Reset your CSEP password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
      });

      strapiInstance.log.info(`[CSEP] ✅ Reset password email sent to ${user?.email}`);
    };

    return userService;
  };

  return plugin;
};
