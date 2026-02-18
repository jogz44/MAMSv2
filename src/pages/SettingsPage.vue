<template>
  <div class="settings-container">
    <ActivityLog />
    <EligibilitySettings />
    <AccountManagement />
    <DropdownOptions />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import ActivityLog from 'src/components/ActivityLog.vue'
import EligibilitySettings from 'src/components/EligibilitySettings.vue'
import AccountManagement from 'src/components/AccountManagement.vue'
import DropdownOptions from 'src/components/DropdownOptions.vue'

const router = useRouter()

const data = JSON.parse(localStorage.getItem('user') || '{}')
const role = data?.ROLE || ''

onMounted(() => {
  if (role !== 'ADMIN') {
    router.push('/error')
  }
})
</script>