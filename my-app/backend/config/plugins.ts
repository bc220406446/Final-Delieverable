export default ({ env }: { env: (key: string, fallback?: string) => string }) => ({

  // ─── Email via Gmail SMTP ──────────────────────────────────────────────────
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host:   'smtp.gmail.com',
        port:   587,
        secure: false,
        auth: {
          user: env('GMAIL_USER'),
          pass: env('GMAIL_APP_PASSWORD'),
        },
        tls: { rejectUnauthorized: false },
      },
      settings: {
        defaultFrom:    env('GMAIL_USER'),
        defaultReplyTo: env('GMAIL_USER'),
      },
    },
  },

  // ─── Users & Permissions ───────────────────────────────────────────────────
  'users-permissions': {
    config: {
      jwt: { expiresIn: '7d' },

      // Disable built-in email confirmation — OTP lifecycle handles it.
      emailConfirmation: false,

      register: {
        allowedFields: ['fullName', 'location'],
      },

      // Tell Strapi where to point password-reset links.
      // Without this the link renders as just "?code=..." with no domain.
      resetPasswordUrl: `${env('FRONTEND_URL', 'http://localhost:3000')}/reset-password`,
    },
  },

});
