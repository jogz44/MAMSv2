<template>
  <div class="page-bg">
    <q-form ref="budgetForm" @submit.prevent="addSupplementaryBonus" class="form-container">
      <h4>ADD SUPPLEMENTAL BUDGET</h4>

      <div class="content">
        <div class="budget-block">
          <h3>YEAR</h3>
          <q-input v-model="yearValue" dense outlined type="number" placeholder="AMOUNT" disable />
        </div>
        <div class="budget-block">
          <h3>MEDICINE</h3>
          <label>SUPPLEMENTAL BUDGET: <span>*</span></label>
          <q-input 
            v-model="medicineDisplay" 
            dense 
            outlined 
            type="text" 
            placeholder="0.00"
            :rules="[val => !!val || 'Required']" 
            class="amount-input"
            @update:model-value="onMedicineInput"
            @blur="finalizeMedicine"
          />
        </div>

        <div class="budget-block">
          <h3>LABORATORY</h3>
          <label>SUPPLEMENTAL BUDGET: <span>*</span></label>
          <q-input 
            v-model="laboratoryDisplay" 
            dense 
            outlined 
            type="text" 
            placeholder="0.00"
            :rules="[val => !!val || 'Required']" 
            class="amount-input"
            @update:model-value="onLaboratoryInput"
            @blur="finalizeLaboratory"
          />
        </div>

        <div class="budget-block">
          <h3>HOSPITAL</h3>
          <label>SUPPLEMENTAL BUDGET: <span>*</span></label>
          <q-input 
            v-model="hospitalDisplay" 
            dense 
            outlined 
            type="text" 
            placeholder="0.00"
            :rules="[val => !!val || 'Required']" 
            class="amount-input"
            @update:model-value="onHospitalInput"
            @blur="finalizeHospital"
          />
        </div>

        <div class="divider"></div>

        <div class="actions">
          <q-btn class="btn-cancel" icon="close" label="CANCEL" @click="showCancelDialog = true" dense />
          <q-btn class="btn-save" icon="save" label="SAVE" @click="handleSaveClick" dense />
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

        <!-- SAVE CONFIRMATION DIALOG -->
        <q-dialog v-model="showSaveDialog">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Save Form?</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              Are you sure you want to save?
            </q-card-section>

            <q-card-actions align="right" class="q-px-md q-pb-md">
              <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
              <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="confirmSave"
                :loading="saveLoading" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router';
import { api } from 'src/boot/axios'

const axios = api
import { useQuasar } from 'quasar';
import { ref } from 'vue';

const router = useRouter()
const $q = useQuasar()
const budgetForm = ref(null)

const currentYear = new Date().getFullYear()
const yearValue = ref(currentYear)

const showCancelDialog = ref(false)
const showSaveDialog = ref(false)
const saveLoading = ref(false)

const currentDate = new Date()
const dateValue = ref(currentDate.toISOString().slice(0, 10))

const medicineSupplementaryBudget = ref(null)
const laboratorySupplementaryBudget = ref(null)
const hospitalSupplementaryBudget = ref(null)

// Display values for formatting
const medicineDisplay = ref('');
const laboratoryDisplay = ref('');
const hospitalDisplay = ref('');

// Medicine Input Handler
const onMedicineInput = (value) => {
  let cleaned = value.replace(/,/g, '');
  cleaned = cleaned.replace(/[^\d.]/g, '');

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  let integer = parts[0] || '';
  let decimal = parts[1] ?? null;

  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  medicineDisplay.value = decimal !== null ? `${integer}.${decimal.slice(0, 2)}` : integer;
  medicineSupplementaryBudget.value = parseFloat(cleaned);
};

const finalizeMedicine = () => {
  if (!medicineDisplay.value) return;
  const num = parseFloat(medicineDisplay.value.replace(/,/g, ''));
  if (isNaN(num)) return;
  medicineDisplay.value = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  medicineSupplementaryBudget.value = num;
};

// Laboratory Input Handler
const onLaboratoryInput = (value) => {
  let cleaned = value.replace(/,/g, '');
  cleaned = cleaned.replace(/[^\d.]/g, '');

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  let integer = parts[0] || '';
  let decimal = parts[1] ?? null;

  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  laboratoryDisplay.value = decimal !== null ? `${integer}.${decimal.slice(0, 2)}` : integer;
  laboratorySupplementaryBudget.value = parseFloat(cleaned);
};

const finalizeLaboratory = () => {
  if (!laboratoryDisplay.value) return;
  const num = parseFloat(laboratoryDisplay.value.replace(/,/g, ''));
  if (isNaN(num)) return;
  laboratoryDisplay.value = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  laboratorySupplementaryBudget.value = num;
};

// Hospital Input Handler
const onHospitalInput = (value) => {
  let cleaned = value.replace(/,/g, '');
  cleaned = cleaned.replace(/[^\d.]/g, '');

  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  let integer = parts[0] || '';
  let decimal = parts[1] ?? null;

  integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  hospitalDisplay.value = decimal !== null ? `${integer}.${decimal.slice(0, 2)}` : integer;
  hospitalSupplementaryBudget.value = parseFloat(cleaned);
};

const finalizeHospital = () => {
  if (!hospitalDisplay.value) return;
  const num = parseFloat(hospitalDisplay.value.replace(/,/g, ''));
  if (isNaN(num)) return;
  hospitalDisplay.value = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  hospitalSupplementaryBudget.value = num;
};

const handleSaveClick = () => {
  if (budgetForm.value.validate()) {
    showSaveDialog.value = true
  } else {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
  }
}

const confirmSave = async () => {
  showSaveDialog.value = false
  saveLoading.value = true
  try {
    await addSupplementaryBonus()
  } finally {
    saveLoading.value = false
  }
}

const handleCancel = () => {
  showCancelDialog.value = false
  router.push('/budget-table')
}

const addSupplementaryBonus = async () => {
  try {
    const formData = new FormData()
    formData.append('year', yearValue.value)
    formData.append('date_added', dateValue.value)
    formData.append('medicine_supplementary_bonus', medicineSupplementaryBudget.value)
    formData.append('laboratory_supplementary_bonus', laboratorySupplementaryBudget.value)
    formData.append('hospital_supplementary_bonus', hospitalSupplementaryBudget.value)

    const res = await axios.post('/api/add-supplementary-bonus', formData)

    $q.notify({
      type: 'positive',
      message: 'Supplementary bonus added successfully',
      position: 'top'
    })

    router.push('/budget-table')
  } catch (err) {
    console.error('Error adding supplementary bonus:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to add supplementary bonus',
      position: 'top'
    })
  }
}
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

.section-header {
  font-size: 25px;
  font-weight: 700;
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

.amount-input :deep(.q-field__control) {
  background: #f0f0f0;
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