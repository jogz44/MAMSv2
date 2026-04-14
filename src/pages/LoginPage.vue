<template>
  <div class="login-page">
    <div class="login-shell">
      <div class="visual-panel">
        <img class="visual-image" :src="cityHallImage" alt="City Hall of Agum" />
        <div class="visual-overlay">
          <img class="visual-logo" :src="logoImage" alt="MAMS Logo" />
        </div>
      </div>
      <LoginForm
        @submit="handleLogin"
        @dev-team-click="handleDevTeamClick"
        :loading="loading"
        :errors="errors"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import LoginForm from "components/LoginForm.vue";
import { useRouter } from "vue-router";
import cityHallImage from "src/assets/CityHallofagum.jpg";
import logoImage from "src/assets/logo12.png";

const router = useRouter();
const $q = useQuasar();
const loading = ref(false);
const errors = ref({});

const handleLogin = async (credentials) => {
  loading.value = true;
  errors.value = {};

  try {
    await api.get('/sanctum/csrf-cookie');

    const response = await api.post('/api/login', credentials);

    sessionStorage.setItem('user', JSON.stringify(response.data.user));

    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      position: 'top',
      timeout: 1000
    });

    // Small delay for notification, then force full page reload
    await new Promise(resolve => setTimeout(resolve, 500));

    // Force full page reload - this ensures session cookie is properly set
    // window.location.href = '/';
    router.push('/');
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    } else {
      errors.value.general = 'Invalid credentials';
    }

    $q.notify({
      type: 'negative',
      message: 'Invalid username or password',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

const handleDevTeamClick = () => {
  $q.notify({
    type: 'info',
    message: 'Dev Team details coming soon.',
    position: 'top',
    timeout: 1200
  });
};
</script>

<style scoped>
.login-page {
  min-height: 85vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  box-sizing: border-box;
  background: #ffffff;
}

.login-shell {
  width: min(860px, 100%);
  min-height: 430px;
  display: flex;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e1e7ee;
  box-shadow: 0 12px 24px rgba(21, 45, 75, 0.08);
}

.visual-panel {
  position: relative;
  flex: 0 0 48%;
  min-height: 430px;
}

.visual-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.visual-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(4, 33, 76, 0.14) 0%, rgba(0, 0, 0, 0.10) 100%);
}

.visual-logo {
  width: min(68%, 320px);
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.34));
}

@media (max-width: 1100px) {
  .login-shell {
    min-height: 410px;
  }

  .visual-panel {
    min-height: 410px;
  }
}

@media (max-width: 900px) {
  .login-page {
    padding: 18px;
  }

  .login-shell {
    flex-direction: column;
    min-height: initial;
  }

  .visual-panel {
    width: 100%;
    min-height: 290px;
  }

  .visual-logo {
    width: min(72%, 360px);
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 14px;
  }
}
</style>
