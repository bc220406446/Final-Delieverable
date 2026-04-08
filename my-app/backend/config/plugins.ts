export default ({ env }: { env: (key: string, fallback?: string) => string }) => ({

  // ─── Email via Gmail SMTP ──────────────────────────────────────────────────
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: env('GMAIL_USER'),
          pass: env('GMAIL_APP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('GMAIL_USER'),
        defaultReplyTo: env('GMAIL_USER'),
      },
    },
  },

  // ─── Cloudinary Upload ────────────────────────────────────────────────────
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },

  // ─── Users & Permissions ───────────────────────────────────────────────────
  'users-permissions': {
    config: {
      jwt: {
        // ✅ Updated (optional but safer format)
        expiresIn: '7d',
      },
      emailConfirmation: false,
      register: {
        allowedFields: ['fullName', 'location'],
      },
    },
  },

});