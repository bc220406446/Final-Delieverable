export default {
  routes: [
    {
      method: 'POST',
      path: '/otp/send',
      handler: 'otp.send',
      config: {
        auth: false,   // called right after register, before user is confirmed
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/otp/verify',
      handler: 'otp.verify',
      config: {
        auth: false,   // user is not yet confirmed when they submit the code
        policies: [],
        middlewares: [],
      },
    },
  ],
};
