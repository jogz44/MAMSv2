<template>
  <div class="page-wrapper">
    <div class="card">
      <div class="intro">
        <img class="logo" src="../assets/logo.png" alt="Logo" />
        <img class="logo2" src="../assets/logo12.png" alt="Logo2" />
      </div>

      <LoginForm
        @submit="handleLogin"
        :loading="loading"
        :errors="errors"
      />

      <div class="copyright">© 2026 MAMs</div>
      <div class="version">V 1.2.2</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import LoginForm from "components/LoginForm.vue";

const $q = useQuasar();
const loading = ref(false);
const errors = ref({});

const handleLogin = async (credentials) => {
  loading.value = true;
  errors.value = {};

  try {
    await api.get('/sanctum/csrf-cookie');

    const response = await api.post('/api/login', credentials);

    localStorage.setItem('user', JSON.stringify(response.data.user));

    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      position: 'top',
      timeout: 1000
    });

    // Small delay for notification, then force full page reload
    await new Promise(resolve => setTimeout(resolve, 500));

    // Force full page reload - this ensures session cookie is properly set
    window.location.href = '/';
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
</script>

<style scoped>
.page-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
}

.copyright {
  position: absolute;
  bottom: 45px;
  right: 470px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
  user-select: none;
}
.version {
  position: absolute;
  bottom: 45px;
  right: 400px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
  user-select: none;
}

.card {
  width: 1000px;
  height: 500px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.intro {
  height: 100%;
  width: 500px;
  background: linear-gradient(to bottom right, #23b967 30%, #37b148 70%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  align-items: center;
  justify-content: center;
  margin-top: 200px;
  margin-bottom: -150px;
  display: block;
  width: 180px;
  height: auto;
  margin-left: 1px;
}

.logo2 {
  margin-left: -30px;
  display: block;
  width: 510px;
  height: auto;
}
</style>
