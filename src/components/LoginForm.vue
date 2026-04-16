<template>
  <div class="form-card">
    <p class="secure-tag">SECURE ACCESS</p>
    <h1 class="welcome-title">Welcome Back!</h1>
    <p class="welcome-subtitle">Use your account credentials to continue.</p>

    <q-form class="login-form" @submit.prevent="onSubmit">
      <div class="field">
        <label>USERNAME</label>
        <q-input
          v-model="username"
          name="username"
          autocomplete="username"
          borderless
          placeholder="Username"
          class="line-input"
          :error="!!errors.username"
          :error-message="errors.username"
          hide-bottom-space
        >
          <template #prepend>
            <q-icon name="person_outline" size="24px" />
          </template>
        </q-input>
      </div>

      <div class="field">
        <label>PASSWORD</label>
        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          name="password"
          autocomplete="current-password"
          borderless
          placeholder="Password"
          class="line-input"
          hide-bottom-space
        >
          <template #prepend>
            <q-icon name="lock_outline" size="24px" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              size="24px"
              class="cursor-pointer"
              @mousedown.prevent
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </div>

      <div v-if="errors.general" class="text-negative q-mt-sm q-mb-sm">
        {{ errors.general }}
      </div>

      <q-checkbox v-model="remember" class="remember-check" label="Remember Me" />

      <div class="actions">
        <q-btn class="btn-login" label="Login" no-caps type="submit" :loading="loading" />
      </div>

      <div class="footer">
        <span class="copyright">&copy; 2026 MAMs V 1.4.2 |</span>
        <button type="button" class="dev-team-link" @click="onDevTeamClick">Dev Team 2.0</button>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['submit', 'dev-team-click']);

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const remember = ref(false);

const onSubmit = () => {
  emit('submit', {
    username: username.value,
    password: password.value,
    remember: remember.value
  });
};

const onDevTeamClick = () => {
  emit('dev-team-click');
};
</script>

<style scoped>
@font-face {
  font-family: "Gilroy-Medium";
  src: url("../assets/fonts/Gilroy-Medium.ttf") format("truetype");
  font-display: swap;
}

@font-face {
  font-family: "Gilroy-ExtraBold";
  src: url("../assets/fonts/Gilroy-ExtraBold.ttf") format("truetype");
  font-display: swap;
}

.form-card {
  flex: 0 0 52%;
  min-height: 430px;
  background: #ffffff;
  padding: 21px 22px 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: "Gilroy-Medium", "Segoe UI", sans-serif;
}

.secure-tag {
  margin: 0;
  color: #5f7896;
  letter-spacing: 0.08em;
  font-size: 15px;
  font-family: "Gilroy-ExtraBold", "Segoe UI", sans-serif;
}

.welcome-title {
  margin: 6px 0 6px;
  font-size: 46px;
  line-height: 1;
  color: #0ea340;
  font-family: "Gilroy-ExtraBold", "Segoe UI", sans-serif;
}

.welcome-subtitle {
  margin: 0 0 12px;
  color: #4b6483;
  font-size: 14px;
  line-height: 1.12;
}

.login-form {
  margin-top: 4px;
}

label {
  font-family: "Gilroy-ExtraBold", "Segoe UI", sans-serif;
  font-size: 15px;
  color: #24466c;
  margin-bottom: 2px;
  display: block;
  letter-spacing: 0.02em;
}

.field {
  margin-bottom: 10px;
}

.line-input {
  border-bottom: 1px solid #c3ceda;
  padding-bottom: 1px;
}


.line-input :deep(.q-field__control) {
  min-height: 40px;
  padding: 0;
}

.line-input :deep(.q-field__native),
.line-input :deep(input) {
  color: #536c89;
  font-size: 16px;
}

.line-input :deep(.q-field__native::placeholder),
.line-input :deep(input::placeholder) {
  color: #7d93ab;
  opacity: 1;
}

.line-input :deep(.q-field__prepend),
.line-input :deep(.q-field__append) {
  color: #7d93ab;
}

.actions {
  margin-top: 6px;
}

.remember-check {
  margin-bottom: 8px;
}

.remember-check :deep(.q-checkbox__inner) {
  font-size: 28px;
}

.remember-check :deep(.q-checkbox__bg) {
  border-width: 1.5px;
  border-color: #748aa4;
  border-radius: 3px;
}

.remember-check :deep(.q-checkbox__label) {
  font-size: 14px;
  color: #2a4d73;
}

.btn-login {
  width: 100%;
  min-height: 48px;
  background: #09ad3f;
  color: white;
  border-radius: 11px;
  font-size: 16px;
  font-family: "Gilroy-ExtraBold", "Segoe UI", sans-serif;
}

.btn-login :deep(.q-btn__content) {
  letter-spacing: 0;
  font-weight: 800;
}

.footer {
  margin-top: 12px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: baseline;
}

.copyright {
  color: #6f84a1;
  font-size: 13px;
}

.dev-team-link {
  background: transparent;
  border: none;
  padding: 0;
  color: #0e5ec3;
  font-size: 13px;
  font-family: "Gilroy-ExtraBold", "Segoe UI", sans-serif;
  cursor: pointer;
}

.dev-team-link:hover {
  text-decoration: underline;
}

@media (max-width: 1100px) {
  .form-card {
    min-height: 410px;
    padding: 18px 18px 14px;
  }

  .welcome-title {
    font-size: 40px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .line-input :deep(.q-field__native),
  .line-input :deep(input) {
    font-size: 15px;
  }

  .btn-login {
    font-size: 16px;
  }
}

@media (max-width: 900px) {
  .form-card {
    min-height: initial;
    padding: 22px 20px 20px;
  }

  .secure-tag {
    font-size: 14px;
  }

  .welcome-title {
    margin-top: 4px;
    font-size: 36px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  label {
    font-size: 16px;
  }

  .line-input :deep(.q-field__native),
  .line-input :deep(input) {
    font-size: 15px;
  }

  .btn-login {
    font-size: 16px;
  }
}

@media (max-width: 500px) {
  .form-card {
    padding: 20px 14px 18px;
  }

  .welcome-title {
    font-size: 30px;
  }

  .welcome-subtitle {
    font-size: 15px;
  }

  .line-input :deep(.q-field__native),
  .line-input :deep(input) {
    font-size: 14px;
  }

  .btn-login {
    font-size: 15px;
  }

  .line-input :deep(.q-field__control) {
    min-height: 44px;
  }

  .btn-login {
    min-height: 46px;
  }
}
</style>
