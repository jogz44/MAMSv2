import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

export const CATEGORY_BALANCES_REFRESH_EVENT = 'mams:category-balances-refresh'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/'

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

const writeMethods = new Set(['post', 'put', 'patch', 'delete'])
const ignoredRefreshUrls = [
  '/api/validate-transfer',
  '/api/logout'
]

const shouldTriggerBalancesRefresh = (config = {}) => {
  const method = String(config.method ?? '').toLowerCase()
  if (!writeMethods.has(method)) return false

  const requestUrl = String(config.url ?? '')
  if (!requestUrl.startsWith('/api/')) return false

  return !ignoredRefreshUrls.some((ignored) => requestUrl.startsWith(ignored))
}

api.interceptors.response.use(
  (response) => {
    if (typeof window !== 'undefined' && shouldTriggerBalancesRefresh(response.config)) {
      window.dispatchEvent(new Event(CATEGORY_BALANCES_REFRESH_EVENT))
    }
    return response
  },
  (error) => Promise.reject(error)
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
