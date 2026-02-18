<template>
  <div class="budget-card">
    <q-table title="Supplemental Budget" flat bordered :rows="rows" :columns="columns" row-key="id" class="budget-table"
      :rows-per-page-options="[5, 10, 15, 20, 0]">
      <template #top-right>
        <div class="header-buttons">
          <!-- TRANSFER BUDGET BUTTON - Now opens popup -->
          <q-btn icon="swap_horiz" label="TRANSFER BUDGET" class="transfer-btn" @click="openTransferDialog" />

          <!-- ADD BUDGET BUTTON -->
          <q-btn icon="add" label="ADD SUPPLEMENTAL BUDGET" class="add-btn" @click="openAddBudgetDialog" />
        </div>
      </template>

      <template v-slot:body-cell-medicine="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.medicine_supplementary_bonus) }}
        </q-td>
      </template>
      <template v-slot:body-cell-lab="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.laboratory_supplementary_bonus) }}
        </q-td>
      </template>
      <template v-slot:body-cell-hospital="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.hospital_supplementary_bonus) }}
        </q-td>
      </template>
    </q-table>

    <!-- TRANSFER BUDGET DIALOG -->
    <q-dialog v-model="showTransferBudgetDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="dialog-header-transfer">
          <h4>TRANSFER SUPPLEMENTAL BUDGET</h4>
        </q-card-section>

        <q-card-section class="transfer-content">
          <!-- FROM -->
          <div class="budget-block">
            <h3>FROM</h3>
            <label>SELECT SOURCE: <span>*</span></label>
            <q-select v-model="transferData.from" dense outlined :options="filteredFromCategories"
              placeholder="SELECT SOURCE" class="amount-input" @update:model-value="onSourceChange" />
          </div>

          <!-- TO -->
          <div class="budget-block">
            <h3>TO</h3>
            <label>SELECT DESTINATION: <span>*</span></label>
            <q-select v-model="transferData.to" dense outlined :options="filteredToCategories"
              placeholder="SELECT DESTINATION" class="amount-input" @update:model-value="onDestinationChange" />
          </div>

          <!-- AMOUNT -->

          <label>TRANSFER AMOUNT: <span>*</span></label>
          <div class="budget-block">

            <!-- Remaining Budget Display -->
            <div v-if="budgetBreakdown" class="budget-breakdown">
              <div class="breakdown-row total">
                <span>Available Balance:</span>
                <span :class="budgetBreakdown.availableBalance >= 0 ? 'positive' : 'negative'">
                  ₱{{ formatCurrency(budgetBreakdown.availableBalance) }}
                </span>
              </div>
              <div v-if="amountValue && parseFloat(amountValue) > 0" class="breakdown-row remaining">
                <span>Remaining After Transfer:</span>
                <span :class="remainingAfterTransfer >= 0 ? 'positive' : 'negative'">
                  ₱{{ formatCurrency(remainingAfterTransfer) }}
                </span>
              </div>
            </div>
            <q-input v-model="amountDisplay" dense outlined type="text" placeholder="0.00" class="amount-input"
              @update:model-value="onAmountInput" @blur="finalizeAmount" />
          </div>

          <!-- VALIDATION MESSAGE -->
          <div v-if="validationMessage" class="validation-message" :class="validationClass">
            <q-icon :name="validationIcon" size="20px" class="q-mr-sm" />
            {{ validationMessage }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="CANCEL" class="dialog-goback-btn" @click="closeTransferDialog" />
          <q-btn unelevated icon="swap_horiz" label="TRANSFER" class="dialog-cancel-btn" @click="handleTransferClick"
            :disable="!isValid" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- TRANSFER CONFIRMATION DIALOG -->
    <q-dialog v-model="showTransferConfirmDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Confirm Budget Transfer</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p>Are you sure you want to transfer <strong>₱{{ formatCurrency(amountValue) }}</strong> from
            <strong>{{ transferData.from }}</strong> to <strong>{{ transferData.to }}</strong>?
          </p>
          <p class="text-caption text-grey-7">This action will create a supplemental budget entry.</p>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="swap_horiz" label="YES, TRANSFER" class="dialog-cancel-btn" @click="confirmTransfer"
            :loading="transferLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ADD SUPPLEMENTAL BUDGET DIALOG -->
    <q-dialog v-model="showAddBudgetDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="dialog-header-transfer">
          <h4>ADD SUPPLEMENTAL BUDGET</h4>
        </q-card-section>

        <q-card-section class="transfer-content">
          <div class="budget-block">
            <h3>YEAR</h3>
            <q-input v-model="yearValue" dense outlined type="number" placeholder="YEAR" disable />
          </div>

          <div class="budget-block">
            <h3>MEDICINE</h3>
            <label>SUPPLEMENTAL BUDGET: <span>*</span></label>
            <q-input v-model="medicineDisplay" dense outlined type="text" placeholder="0.00" class="amount-input"
              @update:model-value="onMedicineInput" @blur="finalizeMedicine" />
          </div>

          <div class="budget-block">
            <h3>LABORATORY</h3>
            <label>SUPPLEMENTAL BUDGET: <span>*</span></label>
            <q-input v-model="laboratoryDisplay" dense outlined type="text" placeholder="0.00" class="amount-input"
              @update:model-value="onLaboratoryInput" @blur="finalizeLaboratory" />
          </div>

          <div class="budget-block">
            <h3>HOSPITAL</h3>
            <label>SUPPLEMENTAL BUDGET: <span>*</span></label>
            <q-input v-model="hospitalDisplay" dense outlined type="text" placeholder="0.00" class="amount-input"
              @update:model-value="onHospitalInput" @blur="finalizeHospital" />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="CANCEL" class="dialog-goback-btn" @click="closeAddBudgetDialog" />
          <q-btn unelevated icon="save" label="SAVE" class="dialog-cancel-btn" @click="handleAddBudgetSave"
            :disable="!isAddFormValid" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ADD BUDGET CONFIRMATION DIALOG -->
    <q-dialog v-model="showAddConfirmDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save Supplemental Budget?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to save this supplemental budget?
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="confirmAddBudget"
            :loading="addBudgetLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const userData = JSON.parse(localStorage.getItem('user') || '{}')

const axios = api

const $q = useQuasar()
const rows = ref([])

// Transfer Budget Dialog States
const showTransferBudgetDialog = ref(false)
const showTransferConfirmDialog = ref(false)
const transferLoading = ref(false)
const validationMessage = ref('')
const isValid = ref(false)
const budgetBreakdown = ref(null)

const transferData = ref({
  year: new Date().getFullYear(),
  from: null,
  to: null
})

// Amount handling
const amountValue = ref(null)
const amountDisplay = ref('')

// Add Budget Dialog States
const showAddBudgetDialog = ref(false)
const showAddConfirmDialog = ref(false)
const addBudgetLoading = ref(false)
const yearValue = ref(new Date().getFullYear())
const dateValue = ref(new Date().toISOString().slice(0, 10))

const medicineSupplementaryBudget = ref(null)
const laboratorySupplementaryBudget = ref(null)
const hospitalSupplementaryBudget = ref(null)

const medicineDisplay = ref('')
const laboratoryDisplay = ref('')
const hospitalDisplay = ref('')

const categories = ['MEDICINE', 'LABORATORY', 'HOSPITAL']

// Filtered FROM options, excluding the TO selection
const filteredFromCategories = computed(() => {
  return categories.filter(cat => cat !== transferData.value.to)
})

// Filtered TO options, excluding the FROM selection
const filteredToCategories = computed(() => {
  return categories.filter(cat => cat !== transferData.value.from)
})

// Calculate remaining balance after transfer
const remainingAfterTransfer = computed(() => {
  if (!budgetBreakdown.value || !amountValue.value) return 0
  const amount = parseFloat(amountValue.value) || 0
  return budgetBreakdown.value.availableBalance - amount
})

// Validation class for styling
const validationClass = computed(() => {
  return isValid.value ? 'success' : 'error'
})

// Validation icon
const validationIcon = computed(() => {
  return isValid.value ? 'check_circle' : 'error'
})

// Add form validation
const isAddFormValid = computed(() => {
  return medicineSupplementaryBudget.value !== null &&
    laboratorySupplementaryBudget.value !== null &&
    hospitalSupplementaryBudget.value !== null &&
    medicineDisplay.value !== '' &&
    laboratoryDisplay.value !== '' &&
    hospitalDisplay.value !== ''
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true },
  { name: 'year', label: 'Year', field: 'year', align: 'center', sortable: true },
  { name: 'addedOn', label: 'Added on', field: 'date_added', align: 'center', sortable: true },
  { name: 'medicine', label: 'Supplemental Medicine Bonus', field: 'medicine_supplementary_bonus', align: 'center', sortable: true },
  { name: 'lab', label: 'Supplemental Laboratory Bonus', field: 'laboratory_supplementary_bonus', align: 'center', sortable: true },
  { name: 'hospital', label: 'Supplemental Hospital Bonus', field: 'hospital_supplementary_bonus', align: 'center', sortable: true }
]

// Format currency helper
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0.00'
  const num = parseFloat(value)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Fetch supplementary budget
const getSupplementaryBudget = async () => {
  try {
    const res = await axios.get('/api/supplementary-bonus')
    rows.value = res.data
  } catch (err) {
    console.log(err)
  }
}

onMounted(() => {
  getSupplementaryBudget()
})

// Transfer Budget Functions
const openTransferDialog = () => {
  // Reset form
  transferData.value = {
    year: new Date().getFullYear(),
    from: null,
    to: null
  }
  amountValue.value = null
  amountDisplay.value = ''
  validationMessage.value = ''
  isValid.value = false
  budgetBreakdown.value = null

  showTransferBudgetDialog.value = true
}

const closeTransferDialog = () => {
  showTransferBudgetDialog.value = false
}

// Amount Input Handler
const onAmountInput = (value) => {
  let cleaned = value.replace(/,/g, '')
  cleaned = cleaned.replace(/[^\d.]/g, '')

  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }

  let integer = parts[0] || ''
  let decimal = parts[1] ?? null

  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  amountDisplay.value = decimal !== null ? `${integer}.${decimal.slice(0, 2)}` : integer
  amountValue.value = parseFloat(cleaned)

  // Trigger validation after input
  validateTransfer()
}

const finalizeAmount = () => {
  if (!amountDisplay.value) return
  const num = parseFloat(amountDisplay.value.replace(/,/g, ''))
  if (isNaN(num)) return
  amountDisplay.value = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  amountValue.value = num
}

// Fetch available balance when source is selected
const onSourceChange = async () => {
  // Reset validation only
  validationMessage.value = ''
  isValid.value = false
  budgetBreakdown.value = null

  if (!transferData.value.from) return

  try {
    const response = await axios.post('/api/validate-transfer', {
      year: transferData.value.year,
      category: transferData.value.from,
      amount: 0
    })

    if (response.data.breakdown) {
      const breakdown = response.data.breakdown
      const availableBalance = (parseFloat(breakdown.annual) || 0) +
        (parseFloat(breakdown.supplemental) || 0) -
        (parseFloat(breakdown.given) || 0)

      budgetBreakdown.value = {
        availableBalance: availableBalance
      }
      if (amountValue.value) {
        await validateTransfer()
      }
    }
  } catch (err) {
    console.error('Error fetching budget:', err)
  }
}

// Handle destination change - validate without resetting amount
const onDestinationChange = () => {
  if (amountValue.value) {
    validateTransfer()
  }
}

// Validate transfer
const validateTransfer = async () => {
  // Reset validation
  validationMessage.value = ''
  isValid.value = false

  // Check if all fields are filled
  if (!transferData.value.from || !transferData.value.to || !amountValue.value) {
    validationMessage.value = 'Please complete all required fields'
    return
  }

  const amount = parseFloat(amountValue.value)
  if (amount <= 0) {
    validationMessage.value = 'Transfer amount must be greater than zero'
    return
  }

  try {
    // Fetch budget data for validation
    const response = await axios.post('/api/validate-transfer', {
      year: transferData.value.year,
      category: transferData.value.from,
      amount: amount
    })

    const data = response.data

    if (data.success) {
      isValid.value = true
      validationMessage.value = 'Transfer is valid. Available balance is sufficient.'
    } else {
      isValid.value = false
      validationMessage.value = data.message
    }
  } catch (err) {
    console.error('Validation error:', err)
    validationMessage.value = 'Error validating transfer. Please try again.'
    isValid.value = false
  }
}

const handleTransferClick = () => {
  if (!isValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Cannot transfer. Budget validation failed.',
      position: 'top'
    })
    return
  }
  showTransferConfirmDialog.value = true
}

// Confirm transfer
const confirmTransfer = async () => {
  transferLoading.value = true

  try {
    const amount = parseFloat(amountValue.value)

    // Create supplemental budget entry for transfer
    const fromAmount = transferData.value.from === 'MEDICINE' ? -amount :
      transferData.value.from === 'LABORATORY' ? 0 : 0
    const toAmount = transferData.value.to === 'MEDICINE' ? amount : 0

    const labFrom = transferData.value.from === 'LABORATORY' ? -amount : 0
    const labTo = transferData.value.to === 'LABORATORY' ? amount : 0

    const hospFrom = transferData.value.from === 'HOSPITAL' ? -amount : 0
    const hospTo = transferData.value.to === 'HOSPITAL' ? amount : 0

    await axios.post('/api/add-supplementary-bonus', {
      year: transferData.value.year,
      date_added: new Date().toISOString().split('T')[0],
      medicine_supplementary_bonus: fromAmount + toAmount,
      laboratory_supplementary_bonus: labFrom + labTo,
      hospital_supplementary_bonus: hospFrom + hospTo,
      performed_by: userData.USERNAME
    })

    $q.notify({
      type: 'positive',
      message: `Successfully transferred ₱${formatCurrency(amount)} from ${transferData.value.from} to ${transferData.value.to}`,
      position: 'top'
    })

    showTransferConfirmDialog.value = false
    showTransferBudgetDialog.value = false

    // Refresh supplementary budget table
    await getSupplementaryBudget()
  } catch (err) {
    console.error('Transfer error:', err)
    $q.notify({
      type: 'negative',
      message: 'Error transferring budget. Please try again.',
      position: 'top'
    })
  } finally {
    transferLoading.value = false
  }
}

// Add Budget Functions
const openAddBudgetDialog = () => {
  // Reset form
  yearValue.value = new Date().getFullYear()
  dateValue.value = new Date().toISOString().slice(0, 10)
  medicineSupplementaryBudget.value = null
  laboratorySupplementaryBudget.value = null
  hospitalSupplementaryBudget.value = null
  medicineDisplay.value = ''
  laboratoryDisplay.value = ''
  hospitalDisplay.value = ''

  showAddBudgetDialog.value = true
}

const closeAddBudgetDialog = () => {
  showAddBudgetDialog.value = false
}

// Medicine Input Handler
const onMedicineInput = (value) => {
  let cleaned = value.replace(/,/g, '')
  cleaned = cleaned.replace(/[^\d.]/g, '')

  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }

  let integer = parts[0] || ''
  let decimal = parts[1] ?? null

  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  medicineDisplay.value = decimal !== null ? `${integer}.${decimal.slice(0, 2)}` : integer
  medicineSupplementaryBudget.value = parseFloat(cleaned)
}

const finalizeMedicine = () => {
  if (!medicineDisplay.value) return
  const num = parseFloat(medicineDisplay.value.replace(/,/g, ''))
  if (isNaN(num)) return
  medicineDisplay.value = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  medicineSupplementaryBudget.value = num
}

// Laboratory Input Handler
const onLaboratoryInput = (value) => {
  let cleaned = value.replace(/,/g, '')
  cleaned = cleaned.replace(/[^\d.]/g, '')

  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }

  let integer = parts[0] || ''
  let decimal = parts[1] ?? null

  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  laboratoryDisplay.value = decimal !== null ? `${integer}.${decimal.slice(0, 2)}` : integer
  laboratorySupplementaryBudget.value = parseFloat(cleaned)
}

const finalizeLaboratory = () => {
  if (!laboratoryDisplay.value) return
  const num = parseFloat(laboratoryDisplay.value.replace(/,/g, ''))
  if (isNaN(num)) return
  laboratoryDisplay.value = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  laboratorySupplementaryBudget.value = num
}

// Hospital Input Handler
const onHospitalInput = (value) => {
  let cleaned = value.replace(/,/g, '')
  cleaned = cleaned.replace(/[^\d.]/g, '')

  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }

  let integer = parts[0] || ''
  let decimal = parts[1] ?? null

  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  hospitalDisplay.value = decimal !== null ? `${integer}.${decimal.slice(0, 2)}` : integer
  hospitalSupplementaryBudget.value = parseFloat(cleaned)
}

const finalizeHospital = () => {
  if (!hospitalDisplay.value) return
  const num = parseFloat(hospitalDisplay.value.replace(/,/g, ''))
  if (isNaN(num)) return
  hospitalDisplay.value = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  hospitalSupplementaryBudget.value = num
}

const handleAddBudgetSave = () => {
  if (!isAddFormValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }
  showAddConfirmDialog.value = true
}

const confirmAddBudget = async () => {
  addBudgetLoading.value = true

  try {
    const formData = new FormData()
    formData.append('year', yearValue.value)
    formData.append('date_added', dateValue.value)
    formData.append('medicine_supplementary_bonus', medicineSupplementaryBudget.value)
    formData.append('laboratory_supplementary_bonus', laboratorySupplementaryBudget.value)
    formData.append('hospital_supplementary_bonus', hospitalSupplementaryBudget.value)
    formData.append('performed_by', userData.USERNAME)

    await axios.post('/api/add-supplementary-bonus', formData)

    $q.notify({
      type: 'positive',
      message: 'Supplementary bonus added successfully',
      position: 'top'
    })

    showAddConfirmDialog.value = false
    showAddBudgetDialog.value = false

    // Refresh supplementary budget table
    await getSupplementaryBudget()
  } catch (err) {
    console.error('Error adding supplementary bonus:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to add supplementary bonus',
      position: 'top'
    })
  } finally {
    addBudgetLoading.value = false
  }
}
</script>

<style scoped>
.budget-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.transfer-btn {
  background: #ff9800;
  color: #ffffff;
  font-weight: 600;
}

.add-btn {
  background: #0aa64f;
  color: #ffffff;
  font-weight: 600;
}

.budget-table :deep(.q-table__card) {
  border-radius: 4px;
  overflow: hidden;
}

.budget-table :deep(.q-table__top) {
  padding: 0 16px 0 0 !important;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1f8f2e;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.budget-table :deep(.q-table__title) {
  font-size: 30px;
  font-weight: 700;
  color: #ffffff;
  padding: 12px 16px;
  margin: 0;
  flex: 1;
}

.budget-table :deep(thead tr) {
  background: #1f8f2e;
}

.budget-table :deep(thead th) {
  color: #ffffff;
  font-weight: 600;
  text-align: center;
}

.budget-table :deep(td) {
  text-align: center;
}

/* Transfer Budget Dialog Styles */
.dialog-header-transfer {
  background: #1f8f2e;
  color: white;
  padding: 16px 24px;
}

.dialog-header-transfer h4 {
  font-weight: 700;
  margin: 0;
  color: white;
  font-size: 20px;
}

.transfer-content {
  padding: 20px;
}

.budget-block h3 {
  font-size: 19px;
  font-weight: bold;
  margin-bottom: -5px;
  margin-top: -15px;
}

.budget-block label {
  display: block;
  font-weight: bold;
  margin-bottom: 6px;
  margin-left: 0px;
  margin-top: -1px;
}

.budget-block label span {
  color: red;
}

.amount-input {
  margin: 0;
}

.amount-input :deep(.q-field__control) {
  background: #f0f0f0;
}

/* Budget Breakdown */
.budget-breakdown {
  background: #f5f5f5;
  border: 2px solid #1f8f2e;
  border-radius: 6px;
  padding: 8px 16px;
  margin: 8px 0 16px 0;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

.breakdown-row.total {
  font-weight: 700;
  font-size: 16px;
}

.breakdown-row.remaining {
  font-weight: 600;
  font-size: 15px;
  border-top: 1px solid #ddd;
  margin-top: 4px;
  padding-top: 4px;
}

.breakdown-row .negative {
  color: #c62828;
  font-weight: 600;
}

.breakdown-row .positive {
  color: #2e7d32;
  font-weight: 600;
}

.validation-message {
  padding: 12px;
  border-radius: 4px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.validation-message.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.validation-message.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* Dialog Button Styling */
.dialog-cancel-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-cancel-btn:disabled {
  background: #ccc !important;
  cursor: not-allowed;
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
</style>
