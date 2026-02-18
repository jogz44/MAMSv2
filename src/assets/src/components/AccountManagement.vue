<template>
  <div class="page-bg">
    <div class="form-container settings-block">
      <h4>Create Account</h4>

      <div class="content">
        <q-form ref="accountForm">
          <div class="grid-3">
            <div class="field">
              <label>Name / Username <span>*</span></label>
              <q-input v-model="name" outlined dense :rules="[val => !!val || 'This field is required']" />
            </div>

            <div class="field">
              <label>Password <span>*</span></label>
              <q-input v-model="password" type="password" outlined dense
                :rules="[val => !!val || 'This field is required']" />
            </div>

            <div class="field">
              <label>Role <span>*</span></label>
              <q-select v-model="role" :options="roles" outlined dense
                :rules="[val => !!val || 'This field is required']" />
            </div>
          </div>

          <div class="actions">
            <q-btn label="CREATE ACCOUNT" icon="save" unelevated class="btn-save" @click="showCreateDialog" />
          </div>
        </q-form>
      </div>
    </div>

    <!-- Accounts Table -->
    <div class="budget-table table-scroll q-mt-lg">
      <q-table title="Accounts" :rows="accountRows" :columns="accountColumns" row-key="id">
        <template #body-cell-action="props">
          <q-td :props="props">
            <div class="action-buttons">
              <q-btn icon="edit" label="EDIT" color="orange" size="sm" unelevated @click="showEditDialog(props.row)" />
              <q-btn icon="delete" label="DELETE" color="red" size="sm" unelevated
                @click="showDeleteDialog(props.row)" />
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- CREATE ACCOUNT CONFIRMATION DIALOG -->
    <q-dialog v-model="createDialogVisible">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Create Account?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
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

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="createAccount"
            :loading="createLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- EDIT ACCOUNT DIALOG -->
    <q-dialog v-model="editDialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-h6">
            <q-icon name="edit" size="sm" class="q-mr-sm" />
            Edit Account
          </div>
        </q-card-section>

        <q-card-section>
          <q-form ref="editForm">
            <div class="edit-field">
              <label>Name / Username <span class="required">*</span></label>
              <q-input v-model="editData.username" outlined dense :rules="[val => !!val || 'This field is required']" />
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
          
          <!-- Warning if editing own account -->
          <q-banner v-if="isEditingOwnAccount" class="bg-orange-1 text-orange-9 q-mt-md">
            <template v-slot:avatar>
              <q-icon name="warning" color="orange" />
            </template>
            You are editing your own account. You will be logged out after saving changes.
          </q-banner>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn unelevated icon="close" label="CANCEL" class="dialog-goback-btn" @click="closeEditDialog" />
          <q-btn unelevated icon="check" label="SAVE CHANGES" class="dialog-cancel-btn" @click="confirmEdit"
            :loading="editLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DELETE ACCOUNT CONFIRMATION DIALOG -->
    <q-dialog v-model="deleteDialogVisible">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Delete Account?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
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
          
          <!-- Warning if deleting own account -->
          <q-banner v-if="isDeletingOwnAccount" class="bg-orange-1 text-orange-9 q-mt-md">
            <template v-slot:avatar>
              <q-icon name="warning" color="orange" />
            </template>
            You are deleting your own account. You will be logged out immediately.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="deleteAccount"
            :loading="deleteLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'src/boot/axios'

const axios = api
import { useQuasar } from 'quasar'

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

// Get current user ID from localStorage or session
const currentUserId = ref(null)

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

// Check if editing own account
const isEditingOwnAccount = computed(() => {
  return currentUserId.value && editData.value.id === currentUserId.value
})

// Check if deleting own account
const isDeletingOwnAccount = computed(() => {
  return currentUserId.value && accountToDelete.value && accountToDelete.value.ID === currentUserId.value
})

// Password validation rules
const passwordRules = computed(() => {
  return [
    // No validation - allow any password
    val => true
  ]
})

const confirmPasswordRules = computed(() => {
  return [
    // Only check if passwords match when both are provided
    val => {
      if (!editData.value.password && !val) return true // Both empty is ok
      if (val !== editData.value.password) return 'Passwords do not match'
      return true
    }
  ]
})

const showCreateDialog = async () => {
  // Use Quasar's built-in form validation
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
  // Validate form
  const isValid = await editForm.value.validate()

  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Please fix validation errors',
      position: 'top'
    })
    return
  }

  // Store if editing own account before making the API call
  const editingOwnAccount = isEditingOwnAccount.value

  editLoading.value = true

  try {
    const payload = {
      id: editData.value.id,
      username: editData.value.username,
      role: editData.value.role
    }

    // Only include password if it's been filled in
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
    
    // If editing own account, logout immediately
    if (editingOwnAccount) {
      // Small delay to show the success message
      setTimeout(() => {
        logout()
      }, 1000)
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
      role: role.value
    })

    $q.notify({
      type: 'positive',
      message: 'Account Created Successfully',
      position: 'top'
    })

    // reset form
    name.value = ''
    password.value = ''
    role.value = null
    createDialogVisible.value = false

    // refresh accounts list
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

  // Store if deleting own account before making the API call
  const deletingOwnAccount = isDeletingOwnAccount.value

  deleteLoading.value = true

  try {
    await axios.post('/api/delete-account', {
      id: accountToDelete.value.ID
    })

    deleteDialogVisible.value = false

    $q.notify({
      type: 'positive',
      message: 'Account Deleted Successfully',
      position: 'top'
    })
    
    // If deleting own account, logout immediately
    if (deletingOwnAccount) {
      // Small delay to show the success message
      setTimeout(() => {
        logout()
      }, 1000)
    } else {
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
    deleteLoading.value = false
  }
}

const logout = () => {
  // Clear all session/token data
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.clear()
  
  $q.notify({
    type: 'info',
    message: 'You have been logged out',
    position: 'top'
  })
  
  // Redirect to login page
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
  // Get current user ID from localStorage, sessionStorage, or Vuex store
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  currentUserId.value = user.id || user.ID || null
}

onMounted(() => {
  getCurrentUser()
  fetchAccounts()
})
</script>

<style scoped>
.page-bg {
  background: #ffffff;
  padding: 30px;
}

.form-container {
  background: #ffffff;
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 25px 30px 35px;
}

.form-container h4 {
  font-weight: 700;
  margin: 5px 0 20px 0;
  color: #1f8f2e;
}

.content {
  padding: 0 10px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.field label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.field label span {
  color: red;
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

.required {
  color: red;
}

/* =========================
   INPUTS & SELECTS
========================= */
:deep(.q-field--outlined .q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

:deep(.q-field__control:before),
:deep(.q-field__control:after) {
  display: none !important;
}

:deep(.q-field__native),
:deep(.q-field__input),
:deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

:deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

:deep(.q-field--readonly .q-field__control) {
  background-color: #ededed;
  border-color: #cfcfcf;
}

:deep(.q-field--disabled .q-field__control) {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
  color: #9e9e9e;
}

.q-mt-sm {
  margin-top: 12px;
}

.q-mt-lg {
  margin-top: 24px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.actions .q-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  color: white;
}

.actions .q-btn:hover {
  filter: brightness(110%);
}

.btn-save {
  background: #0aa64f;
}

/* Action Buttons in Table */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

/* Table Styles */
.budget-table {
  width: 100%;
}

.budget-table :deep(thead tr) {
  background: #1f8f2e;
}

.budget-table :deep(thead th) {
  color: #ffffff;
  font-weight: 600;
  text-align: center !important;
  padding-left: 16px !important;
  padding-right: 16px !important;
  font-size: 12px;
}

.budget-table :deep(thead th .q-table__sort-icon) {
  margin-left: 4px;
}

.budget-table :deep(td) {
  text-align: center;
  vertical-align: middle;
}

.budget-table :deep(.q-table__title) {
  font-size: 24px;
  font-weight: 700;
  color: #1f8f2e;
}

/* Dialog Styles */
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
</style>