// Blocks Strapi's default sendConfirmationEmail as a second safety net.
// Primary OTP sending is done via strapi.db.lifecycles.subscribe in src/index.ts

export default (plugin: any) => {
  const originalUserService = plugin.services.user;

  plugin.services.user = ({ strapi: strapiInstance }: any) => {
    const userService = originalUserService({ strapi: strapiInstance });

    userService.sendConfirmationEmail = async (user: any) => {
      strapiInstance.log.info(
        `[CSEP] sendConfirmationEmail blocked for ${user?.email} — OTP lifecycle handles this.`
      );
    };

    return userService;
  };

  return plugin;
};
