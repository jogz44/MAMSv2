<template>
  <div class="page-bg">
    <div class="form-container">
      <q-form ref="eligibilityForm">
        <!-- HEADER ROW -->
        <div class="fieldset-header">
          <div class="fieldset-title">Eligibility Cooldown</div>

          <div class="actions">
            <!-- View Mode Buttons -->
            <template v-if="!edit">
              <q-btn label="EDIT" icon="edit" class="action-btn edit-btn" dense @click="edit = true" />
            </template>

            <!-- Edit Mode Buttons -->
            <template v-if="edit">
              <q-btn label="Cancel" icon="close" class="action-btn cancel-btn" @click="showCancelDialog = true" dense />
              <q-btn label="Save" icon="save" class="action-btn save-btn" @click="handleSaveClick" dense />
            </template>
          </div>
        </div>

        <!-- ================= COOLDOWN SETTINGS ================= -->
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <label class="form-label">Current Eligibility Cooldown (Days) <span class="required">*</span></label>
            <q-input 
              v-model="daysValue" 
              type="text" 
              dense 
              outlined 
              class="flat-input"
              placeholder="Enter number of days"
              :rules="[val => !!val || 'This field is required', val => val > 0 || 'Must be greater than 0']"
              :readonly="!edit"
              @input="daysValue = daysValue.replace(/[^0-9]/g, '')"
              hint="Note: This will affect ALL eligibility cooldowns for each category"
              :persistent-hint="true"
            />
          </div>
        </div>
      </q-form>
    </div>

    <!-- CANCEL CONFIRMATION DIALOG -->
    <q-dialog v-model="showCancelDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Cancel Editing?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to cancel? All unsaved changes will be lost.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="handleCancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- SAVE CONFIRMATION DIALOG -->
    <q-dialog v-model="showSaveDialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px;">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-h6">
            <q-icon name="warning" size="sm" class="q-mr-sm" />
            Update Eligibility Cooldown?
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            You are about to change the eligibility cooldown period.
          </div>

          <q-banner class="bg-orange-1 text-orange-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="schedule" color="orange" />
            </template>
            <div>
              <div class="text-weight-bold">This will affect ALL patients system-wide</div>
              <div class="q-mt-sm">
                <strong>Current:</strong> {{ originalDays }} days
                <q-icon name="arrow_forward" size="xs" class="q-mx-sm" />
                <strong>New:</strong> {{ daysValue }} days
              </div>
            </div>
          </q-banner>

          <div class="text-body2 text-grey-8">
            All patients will need to wait {{ daysValue }} days between guarantee letters after this change.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="showSaveDialog = false" />
          <q-btn label="UPDATE" icon="check" unelevated class="dialog-cancel-btn" @click="confirmSave"
            :loading="saveLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

const axios = api
import { useQuasar } from 'quasar'

const $q = useQuasar()

const eligibilityForm = ref(null)
const edit = ref(false)
const daysValue = ref('')
const originalDays = ref(0)
const showCancelDialog = ref(false)
const showSaveDialog = ref(false)
const saveLoading = ref(false)

const handleCancel = () => {
  showCancelDialog.value = false
  edit.value = false
  daysValue.value = originalDays.value.toString()
}

const handleSaveClick = async () => {
  const isValid = await eligibilityForm.value.validate()

  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }

  if (parseInt(daysValue.value) === originalDays.value) {
    $q.notify({
      type: 'info',
      message: 'No changes detected',
      position: 'top'
    })
    edit.value = false
    return
  }

  showSaveDialog.value = true
}

const confirmSave = async () => {
  saveLoading.value = true

  try {
    await axios.post('/api/update-eligibility-cooldown', {
      days: parseInt(daysValue.value)
    })

    originalDays.value = parseInt(daysValue.value)
    edit.value = false
    showSaveDialog.value = false

    $q.notify({
      type: 'positive',
      message: 'Eligibility cooldown updated successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Failed to update eligibility:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update eligibility cooldown',
      position: 'top'
    })
  } finally {
    saveLoading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/get-eligibility-cooldown')
    originalDays.value = res.data.days
    daysValue.value = res.data.days.toString()
  } catch (error) {
    console.error('Failed to load eligibility settings:', error)
    originalDays.value = 0
    daysValue.value = '0'
  }
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
  margin: -25px -30px 20px -30px; /* ← pull it to the edges of the padded card */
  background-color: #1f8f2e;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  padding-right: 16px; /* give the buttons some breathing room */
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* BUTTON BASE */
.action-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
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
   INPUTS & SELECTS (FIXED)
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

.flat-input :deep(input[readonly]),
.flat-input :deep(input:read-only) {
  color: #757575 !important;
}

.flat-input :deep(.q-field--readonly .q-field__control) {
  background-color: #ededed;
  border-color: #cfcfcf;
}

.flat-input :deep(.q-field--readonly .q-field__native),
.flat-input :deep(.q-field--readonly .q-field__input) {
  color: #757575 !important;
}

/* BUTTON COLORS */
.cancel-btn {
  background: #ff3b3b;
  color: white;
  font-weight: bold;
  border-radius: 5%;
}

.edit-btn {
  background: #0aa64f;
  color: white;
  font-weight: bold;
  border-radius: 5%;
}

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
</style>