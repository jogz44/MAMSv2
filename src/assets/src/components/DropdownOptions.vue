<template>
  <div class="page-bg">
    <!-- PARENT CONTAINER HEADER -->
    <div class="parent-header">
      <div class="parent-title">Dropdown Options</div>
    </div>

    <div class="parent-container">
      <!-- ===================== TABLES IN ROW LAYOUT ===================== -->
      <div class="tables-row">
        <!-- PREFERENCE TABLE -->
        <div class="form-container">
          <div class="fieldset-header">
            <div class="fieldset-title">Preference Options</div>
            <div class="actions">
              <q-btn label="ADD OPTION" icon="add" class="action-btn add-btn" dense
                @click="openAddDialog('preference')" />
            </div>
          </div>

          <div class="table-wrapper">
            <q-table :rows="preferenceRows" :columns="optionColumns" row-key="id" :rows-per-page-options="[0]"
              :loading="loadingPreferences" hide-pagination flat>
              <template #body-cell-is_active="props">
                <q-td :props="props" class="text-center">
                  <q-toggle :model-value="!!props.row.is_active" color="green"
                    @update:model-value="openToggleDialog('preference', props.row)" />
                  <span :class="props.row.is_active ? 'status-active' : 'status-inactive'">
                    {{ props.row.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>

        <!-- PARTNER TABLE -->
        <div class="form-container">
          <div class="fieldset-header">
            <div class="fieldset-title">Partner Options</div>
            <div class="actions">
              <q-btn label="ADD OPTION" icon="add" class="action-btn add-btn" dense @click="openAddDialog('partner')" />
            </div>
          </div>

          <!-- Category Filter -->
          <div class="category-filter">
            <label class="filter-label">Filter by Category:</label>
            <q-select v-model="selectedPartnerCategory" :options="categoryOptions" dense outlined class="filter-select"
              placeholder="Select category" />
          </div>

          <div class="table-wrapper">
            <q-table :rows="filteredPartnerRows" :columns="partnerColumnsSimplified" row-key="id"
              :rows-per-page-options="[0]" :loading="loadingPartners" hide-pagination flat>
              <template #body-cell-is_active="props">
                <q-td :props="props" class="text-center">
                  <q-toggle :model-value="!!props.row.is_active" color="green"
                    @update:model-value="openToggleDialog('partner', props.row)" />
                  <span :class="props.row.is_active ? 'status-active' : 'status-inactive'">
                    {{ props.row.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>

        <!-- SECTOR TABLE -->
        <div class="form-container">
          <div class="fieldset-header">
            <div class="fieldset-title">Sector Options</div>
            <div class="actions">
              <q-btn label="ADD OPTION" icon="add" class="action-btn add-btn" dense @click="openAddDialog('sector')" />
            </div>
          </div>

          <div class="table-wrapper">
            <q-table :rows="sectorRows" :columns="optionColumns" row-key="id" :rows-per-page-options="[0]"
              :loading="loadingSectors" hide-pagination flat>
              <template #body-cell-is_active="props">
                <q-td :props="props" class="text-center">
                  <q-toggle :model-value="!!props.row.is_active" color="green"
                    @update:model-value="openToggleDialog('sector', props.row)" />
                  <span :class="props.row.is_active ? 'status-active' : 'status-inactive'">
                    {{ props.row.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
      </div>

      <!-- ===================== ADD DIALOG ===================== -->
      <q-dialog v-model="addDialogVisible" persistent>
        <q-card style="min-width: 420px;">
          <q-card-section class="bg-green-7 text-white">
            <div class="text-h6">
              <q-icon name="add_circle" size="sm" class="q-mr-sm" />
              Add {{ dialogLabel }} Option
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle1 q-mb-md">
              Enter the new option you want to add to the <strong>{{ dialogLabel }}</strong> dropdown.
            </div>

            <q-form ref="addForm">
              <!-- Partner has category sub-select -->
              <div v-if="activeTable === 'partner'" class="field q-mb-md">
                <label>Category <span class="required">*</span></label>
                <q-select v-model="newOptionCategory" :options="categoryOptions" outlined dense
                  :rules="[val => !!val || 'This field is required']" />
              </div>

              <div class="field">
                <label>Option Name <span class="required">*</span></label>
                <q-input v-model="newOptionValue" outlined dense placeholder="Enter option name"
                  :rules="[val => !!val || 'This field is required', val => val.trim().length > 0 || 'Cannot be blank']"
                  @keyup.enter="confirmAdd" />
              </div>
            </q-form>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="closeAddDialog" />
            <q-btn label="ADD" icon="check" unelevated class="dialog-cancel-btn" @click="confirmAdd" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- ===================== CONFIRM ADD DIALOG ===================== -->
      <q-dialog v-model="confirmAddDialogVisible" persistent>
        <q-card style="min-width: 380px;">
          <q-card-section class="bg-blue-6 text-white">
            <div class="text-h6">
              <q-icon name="info" size="sm" class="q-mr-sm" />
              Confirm Add Option
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle1 q-mb-md">
              Are you sure you want to add this option?
            </div>
            <div class="info-box">
              <div class="info-item">
                <strong>Table:</strong> {{ dialogLabel }}
              </div>
              <div v-if="activeTable === 'partner'" class="info-item">
                <strong>Category:</strong> {{ newOptionCategory }}
              </div>
              <div class="info-item">
                <strong>Option:</strong> {{ newOptionValue }}
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn label="NO" icon="close" unelevated class="dialog-goback-btn"
              @click="confirmAddDialogVisible = false" />
            <q-btn label="YES" icon="check" unelevated class="dialog-cancel-btn" @click="doAdd" :loading="addLoading" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- ===================== TOGGLE CONFIRM DIALOG ===================== -->
      <q-dialog v-model="toggleDialogVisible" persistent>
        <q-card style="min-width: 380px;">
          <q-card-section :class="optionToToggle && optionToToggle.is_active ? 'bg-orange-7' : 'bg-green-7'"
            class="text-white">
            <div class="text-h6">
              <q-icon :name="optionToToggle && optionToToggle.is_active ? 'block' : 'check_circle'" size="sm"
                class="q-mr-sm" />
              {{ optionToToggle && optionToToggle.is_active ? 'Deactivate' : 'Activate' }} Option?
            </div>
          </q-card-section>

          <q-card-section class="q-pt-md">
            <div class="text-subtitle1 q-mb-md">
              Are you sure you want to <strong>{{ optionToToggle && optionToToggle.is_active ? 'deactivate' : 'activate'
              }}</strong> this option?
            </div>

            <div class="info-box" v-if="optionToToggle">
              <div class="info-item">
                <strong>Table:</strong> {{ dialogLabel }}
              </div>
              <div v-if="activeTable === 'partner'" class="info-item">
                <strong>Category:</strong> {{ optionToToggle.category }}
              </div>
              <div class="info-item">
                <strong>Option:</strong> {{ optionToToggle.preference || optionToToggle.partner || optionToToggle.sector
                }}
              </div>
              <div class="info-item">
                <strong>Current Status:</strong>
                <span :class="optionToToggle.is_active ? 'status-active' : 'status-inactive'">
                  {{ optionToToggle.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" @click="toggleDialogVisible = false" />
            <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="doToggle"
              :loading="toggleLoading" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const axios = api
const $q = useQuasar()
const userData = JSON.parse(localStorage.getItem('user') || '{}')

// ===================== DATA =====================

const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const selectedPartnerCategory = ref('MEDICINE')

const preferenceRows = ref([])
const partnerRows = ref([])
const sectorRows = ref([])

const loadingPreferences = ref(false)
const loadingPartners = ref(false)
const loadingSectors = ref(false)

// ===================== COLUMNS =====================

const optionColumns = [
  { name: 'value', label: 'Option', field: row => row.preference || row.sector, align: 'left', sortable: true },
  { name: 'is_active', label: 'Status', field: 'is_active', align: 'center' },
]

const partnerColumnsSimplified = [
  { name: 'value', label: 'Partner Name', field: 'partner', align: 'left', sortable: true },
  { name: 'is_active', label: 'Status', field: 'is_active', align: 'center' },
]

// ===================== COMPUTED =====================

const filteredPartnerRows = computed(() => {
  if (!selectedPartnerCategory.value) return partnerRows.value
  return partnerRows.value.filter(row => row.category === selectedPartnerCategory.value)
})

// ===================== STATE =====================

const activeTable = ref(null)
const addForm = ref(null)
const newOptionValue = ref('')
const newOptionCategory = ref(null)

const addDialogVisible = ref(false)
const confirmAddDialogVisible = ref(false)
const toggleDialogVisible = ref(false)
const addLoading = ref(false)
const toggleLoading = ref(false)

const optionToToggle = ref(null)

const tableLabels = {
  preference: 'Preference',
  partner: 'Partner',
  sector: 'Sector',
}

const dialogLabel = ref('')

// ===================== API FUNCTIONS =====================

const fetchPreferences = async () => {
  try {
    loadingPreferences.value = true
    const response = await axios.get('/api/preferences/all')
    preferenceRows.value = response.data || []
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to load preferences', position: 'top' })
  } finally {
    loadingPreferences.value = false
  }
}

const fetchPartners = async () => {
  try {
    loadingPartners.value = true
    const response = await axios.get('/api/partners/all')
    partnerRows.value = response.data || []
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to load partners', position: 'top' })
  } finally {
    loadingPartners.value = false
  }
}

const fetchSectors = async () => {
  try {
    loadingSectors.value = true
    const response = await axios.get('/api/sectors/all')
    sectorRows.value = response.data || []
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to load sectors', position: 'top' })
  } finally {
    loadingSectors.value = false
  }
}

// ===================== ADD =====================

const openAddDialog = (table) => {
  activeTable.value = table
  dialogLabel.value = tableLabels[table]
  newOptionValue.value = ''
  newOptionCategory.value = table === 'partner' ? selectedPartnerCategory.value : null
  addDialogVisible.value = true
}

const closeAddDialog = () => {
  addDialogVisible.value = false
  newOptionValue.value = ''
  newOptionCategory.value = null
}

const confirmAdd = async () => {
  const isValid = await addForm.value.validate()
  if (!isValid) return
  addDialogVisible.value = false
  confirmAddDialogVisible.value = true
}

const doAdd = async () => {
  addLoading.value = true
  try {
    let endpoint = ''
    let payload = {}

    if (activeTable.value === 'preference') {
      endpoint = '/api/preferences'
      payload = { value: newOptionValue.value.trim(), performed_by: userData.USERNAME }
    } else if (activeTable.value === 'partner') {
      endpoint = '/api/partners'
      payload = { category: newOptionCategory.value, value: newOptionValue.value.trim(), performed_by: userData.USERNAME }
    } else if (activeTable.value === 'sector') {
      endpoint = '/api/sectors'
      payload = { value: newOptionValue.value.trim(), performed_by: userData.USERNAME }
    }

    const response = await axios.post(endpoint, payload)

    if (activeTable.value === 'preference') await fetchPreferences()
    else if (activeTable.value === 'partner') await fetchPartners()
    else if (activeTable.value === 'sector') await fetchSectors()

    confirmAddDialogVisible.value = false
    newOptionValue.value = ''
    newOptionCategory.value = null

    $q.notify({ type: 'positive', message: response.data.message || 'Option added successfully', position: 'top' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.error || 'Failed to add option', position: 'top' })
  } finally {
    addLoading.value = false
  }
}

// ===================== TOGGLE =====================

const openToggleDialog = (table, row) => {
  activeTable.value = table
  dialogLabel.value = tableLabels[table]
  optionToToggle.value = row
  toggleDialogVisible.value = true
}

const doToggle = async () => {
  toggleLoading.value = true
  try {
    let endpoint = ''

    if (activeTable.value === 'preference') {
      endpoint = `/api/preferences/${optionToToggle.value.id}/toggle`
    } else if (activeTable.value === 'partner') {
      endpoint = `/api/partners/${optionToToggle.value.id}/toggle`
    } else if (activeTable.value === 'sector') {
      endpoint = `/api/sectors/${optionToToggle.value.id}/toggle`
    }

    const response = await axios.post(endpoint, { performed_by: userData.USERNAME })

    if (activeTable.value === 'preference') await fetchPreferences()
    else if (activeTable.value === 'partner') await fetchPartners()
    else if (activeTable.value === 'sector') await fetchSectors()

    toggleDialogVisible.value = false
    optionToToggle.value = null

    $q.notify({ type: 'positive', message: response.data.message || 'Status updated successfully', position: 'top' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.error || 'Failed to update status', position: 'top' })
  } finally {
    toggleLoading.value = false
  }
}

// ===================== LIFECYCLE =====================

onMounted(() => {
  fetchPreferences()
  fetchPartners()
  fetchSectors()
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

.tables-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.form-container {
  background: #ffffff;
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 25px 30px 35px;
}

.fieldset-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  background-color: #1f8f2e;
  padding: 8px 16px;
  margin: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  box-sizing: border-box;
  line-height: 1.2;
  white-space: nowrap;
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

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  font-weight: 600;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  color: white;
}

.add-btn {
  background: #0aa64f;
  color: white;
  font-weight: bold;
  border-radius: 5%;
}

/* =========================
   STATUS LABELS
========================= */
.status-active {
  color: #1f8f2e;
  font-weight: 600;
  font-size: 13px;
  margin-left: 4px;
}

.status-inactive {
  color: #b0b0b0;
  font-weight: 600;
  font-size: 13px;
  margin-left: 4px;
}

/* =========================
   TABLE
========================= */
.category-filter {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.filter-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  margin: 0;
}

.filter-select {
  flex: 1;
  max-width: 250px;
}

.filter-select :deep(.q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

.filter-select :deep(.q-field__control:before),
.filter-select :deep(.q-field__control:after) {
  display: none !important;
}

.filter-select :deep(.q-field__native),
.filter-select :deep(.q-field__input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

.filter-select :deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

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

/* =========================
   DIALOG BUTTONS
========================= */
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

/* =========================
   INFO BOX
========================= */
.info-box {
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

/* =========================
   FORM FIELDS
========================= */
.field label {
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  font-size: 14px;
}

.required {
  color: red;
}

.field :deep(.q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

.field :deep(.q-field__control:before),
.field :deep(.q-field__control:after) {
  display: none !important;
}

.field :deep(.q-field__native),
.field :deep(.q-field__input),
.field :deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

.field :deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

.q-mb-md {
  margin-bottom: 16px;
}
</style>