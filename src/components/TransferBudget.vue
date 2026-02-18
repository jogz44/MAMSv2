<template>
  <div class="page-bg">
    <q-form ref="transferForm" class="form-container">
      <h4>TRANSFER SUPPLEMENTAL BUDGET</h4>

      <div class="content">

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
        <div class="budget-block">
          <h3>AMOUNT</h3>

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

          <label>TRANSFER AMOUNT: <span>*</span></label>
          <q-input 
            v-model="amountDisplay" 
            dense 
            outlined 
            type="text" 
            placeholder="0.00" 
            class="amount-input"
            @update:model-value="onAmountInput"
            @blur="finalizeAmount"
          />
        </div>

        <!-- VALIDATION MESSAGE -->
        <div v-if="validationMessage" class="validation-message" :class="validationClass">
          <q-icon :name="validationIcon" size="20px" class="q-mr-sm" />
          {{ validationMessage }}
        </div>

        <div class="divider"></div>

        <div class="actions">
          <q-btn class="btn-cancel" icon="close" label="CANCEL" @click="showCancelDialog = true" dense />
          <q-btn class="btn-save" icon="swap_horiz" label="TRANSFER" @click="handleTransferClick" :disable="!isValid"
            dense />
        </div>

        <!-- CANCEL CONFIRMATION DIALOG -->
        <q-dialog v-model="showCancelDialog">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Close Form?</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              Are you sure you want to close? All unsaved changes will be lost.
            </q-card-section>

            <q-card-actions align="right" class="q-px-md q-pb-md">
              <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
              <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="handleCancel" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- TRANSFER CONFIRMATION DIALOG -->
        <q-dialog v-model="showTransferDialog">
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
              <q-btn unelevated icon="swap_horiz" label="YES, TRANSFER" class="dialog-cancel-btn"
                @click="confirmTransfer" :loading="transferLoading" />
            </q-card-actions>
          </q-card>
        </q-dialog>

      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const axios = api

const router = useRouter()
const $q = useQuasar()

const transferForm = ref(null)
const showCancelDialog = ref(false)
const showTransferDialog = ref(false)
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

// Format currency helper
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0.00'
  return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
      validationMessage.value = 'Transfer is valid. Budget will remain positive.'
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
  showTransferDialog.value = true
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
      hospital_supplementary_bonus: hospFrom + hospTo
    })

    $q.notify({
      type: 'positive',
      message: `Successfully transferred ₱${formatCurrency(amount)} from ${transferData.value.from} to ${transferData.value.to}`,
      position: 'top'
    })

    showTransferDialog.value = false

    // Redirect to budget table
    router.push('/budget-table')
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

const handleCancel = () => {
  showCancelDialog.value = false
  router.push('/budget-table')
}
</script>

<style scoped>
.page-bg {
  background: #ffffff;
  padding: 30px;
}

.form-container {
  border: 2px solid #b5b5b5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: #ffffff;
  padding: 25px 30px 35px;
}

.page-bg h4 {
  font-weight: 700;
  margin: 5px;
  color: #1f8f2e;
}

.content {
  padding: 0px 20px;
}

.budget-block h3 {
  font-size: 19px;
  font-weight: bold;
  margin-bottom: 0px;
  margin-top: 0px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 6px;
  margin-left: 30px;
}

label span {
  color: red;
}

.amount-input {
  margin: 0 30px;
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
  margin: 0 30px 16px 30px;
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
  margin: 20px 30px;
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

.divider {
  height: 2px;
  background: #dcdcdc;
  margin: 15px 0 8px;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 24px;
}

.actions .q-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  color: white;
}

.btn-cancel {
  background: #ff3b3b;
}

.btn-save {
  background: #0aa64f;
}

.btn-save:disabled {
  background: #ccc !important;
  cursor: not-allowed;
}

/* Dialog Button Styling */
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
</style>