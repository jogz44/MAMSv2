import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

    // No auth requirements - allow immediately
    if (!requiresAuth && !requiresGuest) {
      return next()
    }

    // Check sessionStorage for auth state
    const hasUser = sessionStorage.getItem('user') !== null

    if (requiresAuth && !hasUser) {
      // Protected route but no user - redirect to login
      return next('/login')
    }

    if (requiresGuest && hasUser) {
      // Guest route (login) but user exists - redirect to dashboard
      return next('/')
    }

    // Allow navigation
    next()
  })

  return Router
})
