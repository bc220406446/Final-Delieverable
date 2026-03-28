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

      // Disable built-in email confirmation - OTP lifecycle handles it.
      emailConfirmation: false,

      register: {
        allowedFields: ['fullName', 'location'],
      },
    },
  },

});
