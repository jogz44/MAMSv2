import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://tagumcity.gov.ph/mams_backend/public/',
  // baseURL: 'http://localhost:8000/',
  withCredentials: true,
  withXSRFToken: true, // Add this
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
