<template>
  <div class="page-wrapper">
    <div class="card">
      <div class="intro">
        <img class="logo" src="../assets/logo.png" alt="Logo" />
        <img class="logo2" src="../assets/logo12.png" alt="Logo2" />
      </div>

      <LoginForm @submit="handleLogin" :loading="loading" :errors="errors" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import LoginForm from "components/LoginForm.vue";
import { useRouter } from "vue-router";

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

.card {
  position: relative;
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

@media screen and (max-width: 1048px) {
  .page-wrapper {
    height: auto;
    min-height: 80vh;
    justify-content: center;
    padding: 20px;
  }

  .card {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .intro {
    width: 100%;
    height: auto;
    padding: 30px 20px;
    border-radius: 8px 8px 0 0;
  }

  .logo {
    width: 150px;
    margin-top: 15%;
    margin-bottom: -13%;
  }

  .logo2 {
    width: 340px;
    margin-left: 0;
  }
}

@media screen and (max-width: 768px) {
  .page-wrapper {
    height: auto;
    min-height: 80vh;
    justify-content: center;
    padding: 20px;
  }

  .card {
    flex-direction: column;
    width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .intro {
    width: 100%;
    height: auto;
    padding: 30px 20px;
    border-radius: 8px 8px 0 0;
  }

  .logo {
    width: 150px;
    margin-top: 15%;
    margin-bottom: -13%;
  }

  .logo2 {
    width: 340px;
    margin-left: 0;
  }
}

@media screen and (max-width: 480px) {
  .page-wrapper {
    height: auto;
    min-height: 100vh;
    justify-content: center;
    padding: 16px;
  }

  .card {
    flex-direction: column;
    width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .intro {
    width: 100%;
    height: auto;
    padding: 20px 16px;
    border-radius: 8px 8px 0 0;
  }

  .logo {
    width: 100px;
    margin-top: 40px;
    margin-bottom: -50px;
  }

  .logo2 {
    width: 200px;
    margin-left: 0;
  }
}
</style>
