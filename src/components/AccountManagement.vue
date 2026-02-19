<template>
  <div class="page-bg">
    <!-- PARENT CONTAINER HEADER -->
    <div class="parent-header">
      <div class="parent-title">Account Options</div>
    </div>

    <div class="parent-container">
      <div class="form-container">
        <q-form ref="accountForm">
          <!-- HEADER ROW -->
          <div class="fieldset-header">
            <div class="fieldset-title">Create Account</div>
          </div>

          <!-- ================= ACCOUNT CREATION FORM ================= -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-4">
              <label class="form-label">Name / Username <span class="required">*</span></label>
              <q-input v-model="name" type="text" dense outlined class="flat-input" placeholder="Enter username"
                :rules="[val => !!val || 'This field is required']" />
            </div>

            <div class="col-4">
              <label class="form-label">Password <span class="required">*</span></label>
              <q-input v-model="password" type="password" dense outlined class="flat-input" placeholder="Enter password"
                :rules="[val => !!val || 'This field is required']" />
            </div>

            <div class="col-4">
              <label class="form-label">Role <span class="required">*</span></label>
              <q-select v-model="role" :options="roles" dense outlined class="flat-input" placeholder="Select role"
                :rules="[val => !!val || 'This field is required']" />
            </div>
          </div>

          <div class="row">
            <div class="col-12" style="text-align: right;">
              <q-btn label="CREATE ACCOUNT" icon="save" class="action-btn save-btn" dense @click="showCreateDialog" />
            </div>
          </div>
        </q-form>
      </div>

      <!-- ACCOUNTS TABLE -->
      <div class="form-container q-mt-lg">
        <div class="fieldset-header">
          <div class="fieldset-title">Accounts</div>
        </div>

        <div class="table-wrapper">
          <q-table :rows="accountRows" :columns="accountColumns" row-key="id" :rows-per-page-options="[0]"
            hide-pagination flat>
            <template #body-cell-action="props">
              <q-td :props="props">
                <div class="action-buttons">
                  <q-btn icon="edit" label="EDIT" color="orange" size="sm" unelevated
                    @click="showEditDialog(props.row)" />
                  <q-btn icon="delete" label="DELETE" color="red" size="sm" unelevated
                    @click="showDeleteDialog(props.row)" />
                </div>
              </q-td>
            </template>
          </q-table>
        </div>
      </div>

      <!-- CREATE ACCOUNT CONFIRMATION DIALOG -->
      <q-dialog v-model="createDialogVisible">
        <q-card style="min-width: 350px">
          <q-card-section class="bg-blue-6 text-white">
            <div class="text-h6">
              <q-icon name="info" size="sm" class="q-mr-sm" />
              Create Account?
            </div>
          </q-card-section>

          <q-card-section class="q-pt-md">
            <div class="text-subtitle1 q-mb-md">
              Are you sure you want to create an account with these details?
            </div>

            <div class="account-info-box">
              <div class="info-item">
                <strong>Username:</strong> {{ name }}
              </div>
              <div class="info-item">
                <strong>Role:</strong> {{ role }}
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
            <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="createAccount"
              :loading="createLoading" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- EDIT ACCOUNT DIALOG -->
      <q-dialog v-model="editDialogVisible" persistent>
        <q-card style="min-width: 500px; max-height: 90vh; display: flex; flex-direction: column;">
          <!-- Sticky header -->
          <q-card-section class="bg-orange-6 text-white" style="flex-shrink: 0;">
            <div class="text-h6">
              <q-icon name="edit" size="sm" class="q-mr-sm" />
              Edit Account
            </div>
          </q-card-section>

          <!-- Scrollable body -->
          <q-card-section style="flex: 1; overflow-y: auto;">
            <q-form ref="editForm">
              <div class="edit-field">
                <label>Name / Username <span class="required">*</span></label>
                <q-input v-model="editData.username" outlined dense
                  :rules="[val => !!val || 'This field is required']" />
              </div>

              <div class="edit-field">
                <label>Role <span class="required">*</span></label>
                <q-select v-model="editData.role" :options="roles" outlined dense
                  :rules="[val => !!val || 'This field is required']" />
              </div>

              <q-separator class="q-my-md" />

              <div class="text-subtitle2 text-weight-bold q-mb-sm">Change Password (Optional)</div>
              <div class="text-caption text-grey-7 q-mb-md">Leave blank to keep current password</div>

              <div class="edit-field">
                <label>New Password</label>
                <q-input v-model="editData.password" :type="showPassword ? 'text' : 'password'" outlined dense
                  :rules="passwordRules">
                  <template v-slot:append>
                    <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      @click="showPassword = !showPassword" />
                  </template>
                </q-input>
              </div>

              <div class="edit-field">
                <label>Confirm New Password</label>
                <q-input v-model="editData.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" outlined
                  dense :rules="confirmPasswordRules">
                  <template v-slot:append>
                    <q-icon :name="showConfirmPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      @click="showConfirmPassword = !showConfirmPassword" />
                  </template>
                </q-input>
              </div>
            </q-form>

            <q-banner v-if="isEditingOwnAccount" class="bg-orange-1 text-orange-9 q-mt-md">
              <template v-slot:avatar>
                <q-icon name="warning" color="orange" />
              </template>
              You are editing your own account. You will be logged out after saving changes.
            </q-banner>
          </q-card-section>

          <!-- Sticky footer -->
          <q-separator style="flex-shrink: 0;" />
          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md" style="flex-shrink: 0;">
            <q-btn unelevated icon="close" label="CANCEL" class="dialog-goback-btn" @click="closeEditDialog" />
            <q-btn unelevated icon="check" label="SAVE CHANGES" class="dialog-cancel-btn" @click="confirmEdit"
              :loading="editLoading" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- DELETE ACCOUNT CONFIRMATION DIALOG -->
      <q-dialog v-model="deleteDialogVisible">
        <q-card style="min-width: 350px">
          <q-card-section class="bg-red-6 text-white">
            <div class="text-h6">
              <q-icon name="warning" size="sm" class="q-mr-sm" />
              Delete Account?
            </div>
          </q-card-section>

          <q-card-section class="q-pt-md">
            <div class="text-subtitle1 q-mb-md">
              Are you sure you want to delete this account?
            </div>

            <div class="account-info-box" v-if="accountToDelete">
              <div class="info-item">
                <strong>ID:</strong> {{ accountToDelete.ID }}
              </div>
              <div class="info-item">
                <strong>Username:</strong> {{ accountToDelete.USERNAME }}
              </div>
              <div class="info-item">
                <strong>Role:</strong> {{ accountToDelete.ROLE }}
              </div>
            </div>

            <q-banner class="bg-red-1 text-red-9 q-mt-md">
              <template v-slot:avatar>
                <q-icon name="warning" color="red" />
              </template>
              This action cannot be undone.
            </q-banner>

            <q-banner v-if="isDeletingOwnAccount" class="bg-orange-1 text-orange-9 q-mt-md">
              <template v-slot:avatar>
                <q-icon name="warning" color="orange" />
              </template>
              You are deleting your own account. You will be logged out immediately.
            </q-banner>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
            <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="deleteAccount"
              :loading="deleteLoading" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const axios = api
const $q = useQuasar()
const router = useRouter()

const accountForm = ref(null)
const editForm = ref(null)

const name = ref('')
const password = ref('')
const role = ref(null)
const roles = ['ADMIN', 'EMPLOYEE']

const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const createLoading = ref(false)
const editLoading = ref(false)
const deleteLoading = ref(false)
const accountToDelete = ref(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const currentUserId = ref(null)
const currentUserData = ref({})

const editData = ref({
  id: null,
  username: '',
  role: null,
  password: '',
  confirmPassword: ''
})

const accountRows = ref([])
const accountColumns = [
  { name: 'id', label: 'ID', field: 'ID', align: 'center', sortable: true },
  { name: 'username', label: 'Username', field: 'USERNAME', align: 'center', sortable: true },
  { name: 'role', label: 'Role', field: 'ROLE', align: 'center', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

const isEditingOwnAccount = computed(() => {
  return currentUserId.value && editData.value.id === currentUserId.value
})

const isDeletingOwnAccount = computed(() => {
  return currentUserId.value && accountToDelete.value && accountToDelete.value.ID === currentUserId.value
})

const passwordRules = computed(() => {
  return [val => true]
})

const confirmPasswordRules = computed(() => {
  return [
    val => {
      if (!editData.value.password && !val) return true
      if (val !== editData.value.password) return 'Passwords do not match'
      return true
    }
  ]
})

// ── FIX 3: Poll every 10s to detect if current user's account was deleted ──
let sessionCheckInterval = null

const startSessionCheck = () => {
  sessionCheckInterval = setInterval(async () => {
    try {
      const res = await axios.get('/api/accounts')
      const accounts = res.data[0]
      const stillExists = accounts.some(a => a.ID === currentUserId.value)
      if (!stillExists) {
        clearInterval(sessionCheckInterval)
        $q.notify({
          type: 'negative',
          message: 'Your account has been deleted. You will be logged out.',
          position: 'top',
          timeout: 2000
        })
        setTimeout(() => logout(false), 2000)
      }
    } catch {
      // Silently ignore polling errors
    }
  }, 10000)
}

const showCreateDialog = async () => {
  const isValid = await accountForm.value.validate()

  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }

  createDialogVisible.value = true
}

const showEditDialog = (account) => {
  editData.value = {
    id: account.ID,
    username: account.USERNAME,
    role: account.ROLE,
    password: '',
    confirmPassword: ''
  }
  showPassword.value = false
  showConfirmPassword.value = false
  editDialogVisible.value = true
}

const closeEditDialog = () => {
  editDialogVisible.value = false
  editData.value = {
    id: null,
    username: '',
    role: null,
    password: '',
    confirmPassword: ''
  }
  showPassword.value = false
  showConfirmPassword.value = false
}

const confirmEdit = async () => {
  const isValid = await editForm.value.validate()

  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Please fix validation errors',
      position: 'top'
    })
    return
  }

  const editingOwnAccount = isEditingOwnAccount.value
  editLoading.value = true

  try {
    const payload = {
      id: editData.value.id,
      username: editData.value.username,
      role: editData.value.role,
      performed_by: currentUserData.value.USERNAME
    }

    if (editData.value.password && editData.value.password.trim() !== '') {
      payload.password = editData.value.password
    }

    await axios.post('/api/update-account', payload)

    closeEditDialog()

    $q.notify({
      type: 'positive',
      message: 'Account Updated Successfully',
      position: 'top'
    })

    if (editingOwnAccount) {
      setTimeout(() => logout(), 1000)
    } else {
      await fetchAccounts()
    }
  } catch (error) {
    console.error('Error updating account:', error)
    $q.notify({
      type: 'negative',
      message: 'Error updating account',
      position: 'top'
    })
  } finally {
    // FIX 2: always reset editLoading so buttons don't stay stuck
    editLoading.value = false
  }
}

const showDeleteDialog = (account) => {
  accountToDelete.value = account
  deleteDialogVisible.value = true
}

const createAccount = async () => {
  createLoading.value = true

  try {
    await axios.post('/api/new-account', {
      username: name.value,
      password: password.value,
      role: role.value,
      performed_by: currentUserData.value.USERNAME
    })

    $q.notify({
      type: 'positive',
      message: 'Account Created Successfully',
      position: 'top'
    })

    name.value = ''
    password.value = ''
    role.value = null
    createDialogVisible.value = false

    await fetchAccounts()
  } catch (error) {
    console.error('Error creating account:', error)
    $q.notify({
      type: 'negative',
      message: 'Error creating account',
      position: 'top'
    })
  } finally {
    createLoading.value = false
  }
}

const deleteAccount = async () => {
  if (!accountToDelete.value) return

  const deletingOwnAccount = isDeletingOwnAccount.value
  deleteLoading.value = true

  try {
    await axios.post('/api/delete-account', {
      id: accountToDelete.value.ID,
      performed_by: currentUserData.value.USERNAME
    })

    deleteDialogVisible.value = false

    $q.notify({
      type: 'positive',
      message: 'Account Deleted Successfully',
      position: 'top'
    })

    if (deletingOwnAccount) {
      setTimeout(() => logout(), 1000)
    } else {
      // FIX 1: reset state BEFORE fetching so next delete works cleanly
      accountToDelete.value = null
      await fetchAccounts()
    }
  } catch (error) {
    console.error('Error deleting account:', error)
    $q.notify({
      type: 'negative',
      message: 'Error deleting account',
      position: 'top'
    })
  } finally {
    // FIX 1: always reset deleteLoading so the button never stays stuck
    deleteLoading.value = false
  }
}

// FIX 2: logout now calls the backend so the session log is written
const logout = async (callBackend = true) => {
  if (callBackend) {
    try {
      await axios.post('/api/logout', { username: currentUserData.value.USERNAME ?? 'Unknown' })
    } catch (err) {
      console.error('Logout request failed:', err)
    }
  }

  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.clear()

  $q.notify({
    type: 'info',
    message: 'You have been logged out',
    position: 'top'
  })

  router.push('/login')
}

const fetchAccounts = async () => {
  try {
    const res = await axios.get('/api/accounts')
    accountRows.value = res.data[0]
  } catch (error) {
    console.error('Failed to fetch accounts:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load accounts',
      position: 'top'
    })
  }
}

const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  currentUserId.value = user.id || user.ID || null
  currentUserData.value = user
}

onMounted(() => {
  getCurrentUser()
  fetchAccounts()
  startSessionCheck()
})

onUnmounted(() => {
  clearInterval(sessionCheckInterval)
})
</script>

<style scoped>
/* =========================
   PAGE & CARD
========================= */
.page-bg {
  background: #ffffff;
  padding: 30px;
}

/* PARENT CONTAINER */
.parent-header {
  display: flex;
  align-items: center;
  background-color: #1f8f2e;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  margin-bottom: 0;
}

.parent-title {
  font-size: 35px;
  font-weight: 700;
  color: #ffffff;
  padding: 8px 16px;
  line-height: 1.2;
}

.parent-container {
  background: #ffffff;
  padding: 30px;
  border: 1px solid #989b98;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

.form-container {
  background: #ffffff;
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 25px 30px 35px;
}

/* TITLE */
.fieldset-title {
  font-size: 35px;
  font-weight: 700;
  color: #ffffff;
  background-color: #1f8f2e;
  padding: 8px 16px;
  margin: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  box-sizing: border-box;
  line-height: 1.2;
}

.fieldset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -25px -30px 20px -30px;
  background-color: #1f8f2e;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  padding-right: 16px;
}

/* =========================
   FORM LAYOUT
========================= */
.form-label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.required {
  color: red;
}

/* =========================
   INPUTS & SELECTS
========================= */
.flat-input :deep(.q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

.flat-input :deep(.q-field__control:before),
.flat-input :deep(.q-field__control:after) {
  display: none !important;
}

.flat-input :deep(.q-field__native),
.flat-input :deep(.q-field__input),
.flat-input :deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

.flat-input :deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

/* BUTTON COLORS */
.save-btn {
  background: #0aa64f;
  color: white;
  font-weight: bold;
  border-radius: 5%;
}

.dialog-cancel-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-goback-btn {
  background: #ff3b3b !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-cancel-btn .q-icon,
.dialog-goback-btn .q-icon {
  margin-right: 6px;
}

/* =========================
   TABLE
========================= */
.table-wrapper {
  margin-top: 0;
}

.table-wrapper :deep(.q-table) {
  box-shadow: none;
}

.table-wrapper :deep(thead tr) {
  background: #1f8f2e;
}

.table-wrapper :deep(thead th) {
  font-weight: 600;
  text-align: center !important;
  color: #ffffff;
  font-size: 14px;
}

.table-wrapper :deep(td) {
  text-align: center;
  vertical-align: middle;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

/* Account Info Box */
.account-info-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.info-item {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item strong {
  color: #1f8f2e;
  margin-right: 8px;
}

/* Edit Field Styles */
.edit-field {
  margin-bottom: 16px;
}

.edit-field label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #333;
}

.edit-field :deep(.q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

.edit-field :deep(.q-field__control:before),
.edit-field :deep(.q-field__control:after) {
  display: none !important;
}

.q-mt-lg {
  margin-top: 24px;
}
</style>