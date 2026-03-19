/**
 * skill router — custom routes + core CRUD.
 */

export default {
  routes: [
    // ── Custom routes ────────────────────────────────────────────────────────
    {
      method:  'GET',
      path:    '/skills/my-skills',
      handler: 'skill.mySkills',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'PATCH',
      path:    '/skills/:id/approve',
      handler: 'skill.approve',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'PATCH',
      path:    '/skills/:id/reject',
      handler: 'skill.reject',
      config:  { policies: [], middlewares: [] },
    },

    // ── Core CRUD routes (replaces createCoreRouter) ─────────────────────────
    {
      method:  'GET',
      path:    '/skills',
      handler: 'skill.find',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'GET',
      path:    '/skills/:id',
      handler: 'skill.findOne',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'POST',
      path:    '/skills',
      handler: 'skill.create',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'PUT',
      path:    '/skills/:id',
      handler: 'skill.update',
      config:  { policies: [], middlewares: [] },
    },
    {
      method:  'DELETE',
      path:    '/skills/:id',
      handler: 'skill.delete',
      config:  { policies: [], middlewares: [] },
    },
  ],
};