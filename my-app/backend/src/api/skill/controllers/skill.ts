/**
 * skill controller - full override of update and delete so they work on
 * drafts (pending/rejected skills that have publishedAt = null).
 */

import { factories } from '@strapi/strapi';

const es = () => strapi.entityService as any;

export default factories.createCoreController('api::skill.skill', ({ strapi }) => ({

  // GET /api/skills/my-skills
  async mySkills(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const skills = await es().findMany('api::skill.skill', {
      filters:          { provider_email: user.email },
      populate:         { image: true, category: true },
      publicationState: 'preview',
      pagination:       { limit: 200 },
    });

    const data = skills.map((s: any) => {
      const { id, ...rest } = s;
      const image = rest.image
        ? { data: { id: rest.image.id, attributes: rest.image } }
        : null;
      return { id, attributes: { ...rest, image } };
    });

    return ctx.send({ data });
  },

  // PUT /api/skills/:id - works on both drafts and published entries
  async update(ctx: any) {
    const { id } = ctx.params;
    const user    = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    const body = ctx.request.body?.data ?? ctx.request.body ?? {};

    // Verify the skill belongs to this user before allowing update.
    const existing = await es().findOne('api::skill.skill', id);
    if (!existing) return ctx.notFound('Skill not found.');
    if (existing.provider_email !== user.email) return ctx.forbidden('You can only edit your own skills.');

    // Always reset to pending + unpublish when user edits a skill.
    const updated = await es().update('api::skill.skill', id, {
      data: { ...body, state: 'pending', publishedAt: null },
    });

    return ctx.send({ data: { id: updated.id, attributes: updated } });
  },

  // DELETE /api/skills/:id - works on both drafts and published entries
  async delete(ctx: any) {
    const { id } = ctx.params;
    const user    = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');

    // Verify ownership before deleting.
    const existing = await es().findOne('api::skill.skill', id);
    if (!existing) return ctx.notFound('Skill not found.');
    if (existing.provider_email !== user.email) return ctx.forbidden('You can only delete your own skills.');

    await es().delete('api::skill.skill', id);

    // Return 200 with empty data (not 204) so strapiRequest can parse it.
    return ctx.send({ data: null });
  },

  // PATCH /api/skills/:id/approve - admin only
  async approve(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    if (user.role?.type !== 'admin') return ctx.forbidden('Admin access required.');

    const { id } = ctx.params;
    const existing = await es().findOne('api::skill.skill', id);
    if (!existing) return ctx.notFound('Skill not found.');

    const updated = await es().update('api::skill.skill', id, {
      data: { state: 'approved', publishedAt: new Date().toISOString() },
    });

    strapi.log.info(`[CSEP] Skill ${id} approved.`);
    return ctx.send({ data: updated });
  },

  // PATCH /api/skills/:id/reject - admin only
  async reject(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in.');
    if (user.role?.type !== 'admin') return ctx.forbidden('Admin access required.');

    const { id } = ctx.params;
    const existing = await es().findOne('api::skill.skill', id);
    if (!existing) return ctx.notFound('Skill not found.');

    const updated = await es().update('api::skill.skill', id, {
      data: { state: 'rejected', publishedAt: null },
    });

    strapi.log.info(`[CSEP] Skill ${id} rejected.`);
    return ctx.send({ data: updated });
  },

}));