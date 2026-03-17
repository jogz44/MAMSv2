<template>
  <div>
    <!-- TOP HEADER -->
    <q-header elevated class="bg-green-7 text-white">
      <q-toolbar class="toolbar-responsive">
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />

        <q-toolbar-title class="row items-center q-gutter-sm toolbar-title-responsive">
          <div class="row items-center cursor-pointer logo-wrapper" @click="$router.push('/')">
            <q-img src="~assets/logo.png" class="logo-main" fit="contain" />
            <q-img src="~assets/loi.png" class="logo-text" />
          </div>
        </q-toolbar-title>

        <!-- USER ICON WITH DROPDOWN MENU -->
        <q-btn flat round icon="account_circle" size="sm">
          <q-menu>
            <q-list style="min-width: 180px">
              <!-- User Info Section -->
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-caption">
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
                  <q-icon name="logout" size="sm" />
                </q-item-section>
                <q-item-section class="text-caption">Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- OVERLAY DRAWER -->
    <q-drawer v-model="drawer" overlay modal side="left" :width="drawerWidth" class="drawer-bg">
      <div class="drawer-content column q-gutter-sm items-center">

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

// const data = JSON.parse(sessionStorage.getItem('user') || '{}')
let raw = sessionStorage.getItem('user') || '{}'

if (raw.startsWith('__q_objt|')) {
  raw = raw.replace('__q_objt|', '')
}

const data = JSON.parse(raw)
const role = data?.ROLE || ''

const drawer = ref(false);
const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// Responsive drawer width
const drawerWidth = computed(() => {
  return window.innerWidth <= 480 ? 180 : 200
})

const user = computed(() => {
  const userData = sessionStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
});

const logout = async () => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}')
    await axios.post('/api/logout', { username: userData?.USERNAME ?? 'Unknown' })
  } catch (err) {
    console.error('Logout request failed:', err)
  }

  sessionStorage.removeItem('user')

  $q.notify({
    type: 'positive',
    message: 'Logged out successfully',
    position: 'top'
  })

  router.push('/login')
}
</script>

<style scoped>
/* ── Toolbar ── */
.toolbar-responsive {
  min-height: 48px;
  padding: 0 8px;
}

.toolbar-title-responsive {
  padding: 0;
  min-width: 0;
  /* prevents overflow pushing other elements */
}

/* ── Logo wrapper ── */
.logo-wrapper {
  gap: 0;
  flex-wrap: nowrap;
  overflow: hidden;
}

.logo-main {
  width: 30px;
  height: 44px;
  flex-shrink: 0;
}

.logo-text {
  width: 80px;
  height: 36px;
  margin-left: -4px;
  flex-shrink: 0;
}

/* ── Drawer ── */
.drawer-bg {
  background-color: #19ad19;
}

.drawer-content {
  background-color: #60ba60;
  height: 100%;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

/* ── Nav buttons ── */
.nav-btn {
  margin-top: 6px;
  min-width: 140px;
  width: 100%;
  max-width: 160px;
  height: 38px;
  padding: 4px 0;
  font-weight: 600;
  font-size: 12px;
  border-radius: 20px;
  color: white;
  border: 2px solid #ffffe0;
}

.nav-btn.active-btn {
  background-color: #ffffe0;
  color: #59b259;
}

.nav-btn .q-icon {
  font-size: 20px;
}

/* ── 480px and below ── */
@media (max-width: 480px) {
  .toolbar-responsive {
    min-height: 44px;
    padding: 0 6px;
  }

  .logo-main {
    width: 26px;
    height: 38px;
  }

  .logo-text {
    width: 70px;
    height: 30px;
  }

  .drawer-content {
    padding: 12px 8px;
    gap: 6px;
  }

  .nav-btn {
    min-width: 130px;
    max-width: 150px;
    height: 36px;
    font-size: 11px;
    margin-top: 4px;
  }

  .nav-btn .q-icon {
    font-size: 18px;
  }
}

/* ── Very small screens (360px) ── */
@media (max-width: 360px) {
  .logo-text {
    width: 60px;
    height: 26px;
  }

  .logo-main {
    width: 22px;
    height: 32px;
  }
}
</style>
