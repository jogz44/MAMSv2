<template>
  <div>
    <!-- TOP HEADER -->
    <q-header elevated class="bg-green-7 text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title class="row items-center q-gutter-sm">
          <div class="row items-center q-gutter-sm cursor-pointer" @click="$router.push('/')">
            <q-img src="~assets/logo.png" width="35px" height="50px" fit="contain" style="margin-left: -2%; margin-top: 2px;"/>
            <q-img src="~assets/loi.png" width="90px" height="40px" style="margin-left: -5%;"/>
          </div>
        </q-toolbar-title>

        <!-- USER ICON WITH DROPDOWN MENU -->
        <q-btn flat round icon="account_circle">
          <q-menu>
            <q-list style="min-width: 200px">
              <!-- User Info Section -->
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ user?.USERNAME || 'User' }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ user?.ROLE || 'Role' }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <!-- Logout Button -->
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- OVERLAY DRAWER -->
    <q-drawer v-model="drawer" overlay modal side="left" :width="200" class="drawer-bg">
      <div class="drawer-content q-pa-sm column q-gutter-sm items-center">

        <!-- Dashboard -->
        <q-btn to="/" exact left rounded unelevated no-caps icon="dashboard" label="Dashboard" class="nav-btn"
          :class="{ 'active-btn': route.path === '/' }" />

        <!-- Patients -->
        <q-btn to="/patient-records" exact left rounded unelevated no-caps icon="description" label="Patients"
          class="nav-btn" :class="{ 'active-btn': route.path === '/patient-records' }" />

        <!-- Reports -->
        <q-btn to="/reports" exact left rounded unelevated no-caps icon="assessment" label="Reports" class="nav-btn"
          :class="{ 'active-btn': route.path === '/reports' }" />

        <!-- Budget (HEAD & ADMIN only) -->
        <q-btn v-if="role === 'HEAD' || role === 'ADMIN'" to="/budget-table" exact left rounded unelevated no-caps
          icon="add_circle" label="Budget" class="nav-btn" :class="{ 'active-btn': route.path === '/budget-table' }" />

        <div class="q-mt-auto" />

        <!-- Settings (ADMIN only) -->
        <q-btn v-if="role === 'ADMIN'" to="/settings" exact left rounded unelevated no-caps icon="settings"
          label="Settings" class="nav-btn" :class="{ 'active-btn': route.path === '/settings' }" />

        <q-btn to="/about" exact left rounded unelevated no-caps icon="groups" label="About Us" class="nav-btn"
          :class="{ 'active-btn': route.path === '/about' }" />
      </div>
    </q-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "src/boot/axios";

const axios = api

const data = JSON.parse(localStorage.getItem('user') || '{}')
const role = data?.ROLE || ''

const drawer = ref(false);
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const user = computed(() => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
});

const logout = async () => {
  try {
    // Call backend FIRST so the session is still active when the log is written
    // Send username explicitly since cross-origin sessions may not resolve Auth::user()
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    await axios.post('/api/logout', { username: userData?.USERNAME ?? 'Unknown' })
  } catch (err) {
    // Proceed with local logout even if the request fails
    console.error('Logout request failed:', err)
  }

  localStorage.removeItem('user')

  $q.notify({
    type: 'positive',
    message: 'Logged out successfully',
    position: 'top'
  })

  router.push('/login')
}
</script>

<style scoped>
.drawer-bg {
  background-color: #19ad19;
}

.drawer-content {
  background-color: #60ba60;
  height: 100%;
  padding: 20px;
}

.nav-btn,
.test-btn {
  margin-top: 10px;
  min-width: 150px;
  height: 40px;
  padding: 6px 0;
  font-weight: 600;
  font-size: 13px;
  border-radius: 20px;
  color: white;
  border: 2px solid #ffffe0;
}

.nav-btn.active-btn {
  background-color: #ffffe0;
  color: #59b259;
}

.nav-btn .q-icon {
  font-size: 22px;
}
.about-btn {
  border-radius: 8px;
  padding: 4px 12px;
  background-color: rgb(255, 255, 255);
  color: #19ad19;
}

.about-btn:hover {
  background-color: rgb(151, 252, 164);
}
</style>
