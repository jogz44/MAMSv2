<template>
  <div class="form-card">
    <div class="patient-info-pill">Login</div>

    <q-form @submit.prevent="onSubmit">
      <div class="field">
        <label>Username</label>
        <q-input dense outlined v-model="username" placeholder="Username" :error="!!errors.username"
          :error-message="errors.username" />
      </div>

      <div class="field">
        <label>Password</label>
        <q-input dense outlined v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password">
          <template #append v-if="password">
            <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @mousedown.prevent
              @click="showPassword = !showPassword" />
          </template>
        </q-input>
      </div>

      <div v-if="errors.general" class="text-negative q-mb-sm">
        {{ errors.general }}
      </div>

      <q-checkbox v-model="remember" class="checkbox" label="Remember Me" />

      <div class="actions">
        <q-btn class="btn-save" label="LOGIN" type="submit" :loading="loading" />
      </div>
      <div class="footer">
  <span class="copyright">© 2026 MAMs</span>
  <span class="version">V 1.3.2</span>
</div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit']);

const username = ref("");
const password = ref("");
const showPassword = ref(false)
const remember = ref(false);

const onSubmit = () => {
  emit('submit', {
    username: username.value,
    password: password.value,
    remember: remember.value
  });
};
</script>

<style scoped>
.form-card {
  height: 100%;
  width: 500px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
}

.patient-info-pill {
  font-size: 30px;
  font-weight: 700;
  color: #1f8f2e;
  margin-bottom: 20px;
}

label {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  display: block;
}

.field {
  margin-bottom: 12px;
}

.actions {
  margin-top: 15px;
}

.btn-save {
  width: 100%;
  background: #0aa64f;
  color: white;
  font-weight: 600;
}
.footer {
  display: none; /* hidden by default, only show on mobile */
}
@media screen and (min-width: 1048px) {
  .footer {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    justify-content: center;
  }

  .copyright,
  .version {
    font-size: 12px;
    color: #666;
    font-weight: 500;
    user-select: none;
  }
}
@media screen and (max-width: 1048px) {
  .form-card {
    width: 100%;
    height: auto;
    padding: 30px 20px;
    padding-top: 30px;
  }

  .patient-info-pill {
    font-size: 30px;
  }
  .footer {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    justify-content: center;
  }

  .copyright,
  .version {
    font-size: 12px;
    color: #666;
    font-weight: 500;
    user-select: none;
  }
}
@media screen and (max-width: 768px) {
  .form-card {
    width: 100%;
    height: auto;
    padding: 30px 20px;
    padding-top: 30px;
  }

  .patient-info-pill {
    font-size: 30px;
  }
  .footer {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    justify-content: center;
  }

  .copyright,
  .version {
    font-size: 12px;
    color: #666;
    font-weight: 500;
    user-select: none;
  }
}
@media screen and (max-width: 480px) {
  .form-card {
    width: 100%;
    height: auto;
    padding: 20px 16px;
    padding-top: 20px;
  }

  .patient-info-pill {
    font-size: 22px;
  }
  .footer {
    display: flex;
    gap: 12px;
    margin-top: 12px;
    justify-content: center;
  }

  .copyright,
  .version {
    font-size: 12px;
    color: #666;
    font-weight: 500;
    user-select: none;
  }
}

</style>