import { factories } from '@strapi/strapi';

const es = () => strapi.entityService as any;

export default factories.createCoreController('api::skill-category.skill-category', () => ({

  // GET /api/skill-categories - public read for authenticated users
  async find(ctx: any) {
    const categories = await es().findMany('api::skill-category.skill-category', {
      populate: { image: true },
      sort:     { name: 'asc' },
    });
    return ctx.send({ data: categories });
  },

  // POST /api/skill-categories - admin only
  async create(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const isAdmin = user.role?.type === 'admin' || user.role?.name?.toLowerCase() === 'admin';
    if (!isAdmin) return ctx.forbidden('Only admins can create categories.');

    const body = ctx.request.body?.data ?? ctx.request.body;
    const created = await es().create('api::skill-category.skill-category', { data: body });
    return ctx.send({ data: created });
  },

  // PUT /api/skill-categories/:id - admin only
  async update(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const isAdmin = user.role?.type === 'admin' || user.role?.name?.toLowerCase() === 'admin';
    if (!isAdmin) return ctx.forbidden('Only admins can update categories.');

    const { id } = ctx.params;
    const body = ctx.request.body?.data ?? ctx.request.body;
    const updated = await es().update('api::skill-category.skill-category', id, { data: body });
    return ctx.send({ data: updated });
  },

  // DELETE /api/skill-categories/:id - admin only
  async delete(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();
    const isAdmin = user.role?.type === 'admin' || user.role?.name?.toLowerCase() === 'admin';
    if (!isAdmin) return ctx.forbidden('Only admins can delete categories.');

    const { id } = ctx.params;
    await es().delete('api::skill-category.skill-category', id);
    return ctx.send({ data: null });
  },

}));
