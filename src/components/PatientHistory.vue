<template>
  <div class="budget-table">
    <q-table :rows="rows" :columns="columns" row-key="uuid">
      <!-- TOP BAR -->
      <template #top>
        <div class="row items-center full-width">
          <div class="text-h4 text-weight-bold text-green">
            Patient's Assistance History
          </div>
          <q-space />
        </div>
      </template>

      <!-- ELIGIBILITY DATE -->
      <template #body-cell-eligibilityDate="props">
        <q-td :class="props.row.eligibilityClass">
          <span>
            {{ props.row.eligibilityDate }}
            <q-tooltip anchor="top middle" self="bottom middle" class="text-subtitle2 q-pa-xs">
              <template v-if="props.row.daysRemaining > 0">
                Eligible in {{ props.row.daysRemaining }} day<span v-if="props.row.daysRemaining > 1">s</span>
              </template>
              <template v-else>
                Eligible
              </template>
            </q-tooltip>
          </span>
        </q-td>
      </template>

      <!-- ACTION COLUMN -->
      <template #body-cell-action="props">
        <q-td class="action-cell">
          <q-btn icon="visibility" color="primary" flat round dense @click="viewDetails(props.row.uuid)">
            <q-tooltip>View Details</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- DETAILS DIALOG -->
    <q-dialog v-model="showDetailsDialog" persistent>
      <q-card
        style="min-width: 650px; max-width: 750px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;">

        <!-- HEADER - stays at top -->
        <q-card-section class="bg-orange-6 text-white q-pa-md" style="flex-shrink: 0;">
          <div class="text-h6">
            <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
            Record Details - UUID: {{ selectedRecord?.uuid }}
          </div>
        </q-card-section>

        <!-- BODY - scrollable -->
        <q-card-section style="flex: 1; overflow-y: auto;">
          <div class="info-section q-mb-md">
            <div class="section-title">Transaction Details</div>

            <!-- VIEW MODE -->
            <div v-if="!editMode">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">UUID:</span>
                  <span class="info-value">{{ selectedRecord?.uuid }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">GL Number:</span>
                  <span class="info-value">{{ selectedRecord?.glNum }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Category:</span>
                  <span class="info-value">{{ selectedRecord?.category }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Partner:</span>
                  <span class="info-value">{{ selectedRecord?.partner }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Issued Date:</span>
                  <span class="info-value">{{ formatDisplayDate(selectedRecord?.issuedDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Issued By:</span>
                  <span class="info-value">{{ selectedRecord?.issuedBy }}</span>
                </div>

                <!-- MEDICINE & LABORATORY: Only show Issued Amount -->
                <div v-if="selectedRecord?.category === 'MEDICINE' || selectedRecord?.category === 'LABORATORY'"
                  class="info-item">
                  <span class="info-label">Issued Amount:</span>
                  <span class="info-value">₱{{ formatCurrency(selectedRecord?.issuedAmount) }}</span>
                </div>

                <!-- HOSPITAL: Show both Hospital Bill and Issued Amount -->
                <template v-if="selectedRecord?.category === 'HOSPITAL'">
                  <div class="info-item">
                    <span class="info-label">Hospital Bill:</span>
                    <span class="info-value">{{ selectedRecord?.hospitalBill ? '₱' +
                      formatCurrency(selectedRecord.hospitalBill) : 'N/A' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Issued Amount:</span>
                    <span class="info-value">₱{{ formatCurrency(selectedRecord?.issuedAmount) }}</span>
                  </div>
                </template>

                <!-- Patient is same as client checkbox (view mode - disabled) -->
                <div class="info-item info-item-full">
                  <q-checkbox :model-value="!selectedRecord?.clientName" label="Patient is same as client?"
                    class="form-checkbox" disable />
                </div>
              </div>

              <!-- Client Information Section - Only show if client exists -->
              <template v-if="selectedRecord?.clientName">
                <div class="section-title q-mt-md q-mb-sm">Client Information</div>
                <div class="info-grid">
                  <div class="info-item info-item-full">
                    <span class="info-label">Client Name:</span>
                    <span class="info-value">{{ selectedRecord?.clientName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Relationship:</span>
                    <span class="info-value">{{ selectedRecord?.relationship }}</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- EDIT MODE -->
            <div v-else>
              <div class="edit-grid">
                <div class="edit-item">
                  <label class="edit-label">UUID:</label>
                  <q-input v-model="editData.uuid" dense outlined readonly class="edit-input" />
                </div>
                <div class="edit-item">
                  <label class="edit-label">GL Number: <span v-if="isAdmin" class="required">*</span></label>
                  <q-input v-model.number="editData.glNum" dense outlined class="edit-input" type="number"
                    :disable="!isAdmin" :error="validationErrors.glNum"
                    error-message="GL Number is required and must be greater than 0"
                    :hint="!isAdmin ? 'Cannot be edited!' : ''" :persistent-hint="!isAdmin" />
                </div>
                <div class="edit-item">
                  <label class="edit-label">Category: <span class="required">*</span></label>
                  <q-select v-model="editData.category" :options="categoryOptions" dense outlined class="edit-input"
                    :error="validationErrors.category" error-message="Category is required"
                    @update:model-value="onCategoryChange" />
                </div>
                <div class="edit-item">
                  <label class="edit-label">Partner: <span class="required">*</span></label>
                  <q-select v-model="editData.partner" :options="partnerOptions" dense outlined class="edit-input"
                    :error="validationErrors.partner" error-message="Partner is required" />
                </div>

                <!-- ADMIN-ONLY FIELDS -->
                <div class="edit-item">
                  <label class="edit-label">Issued Date: <span v-if="isAdmin" class="required">*</span></label>
                  <q-input v-model="editData.issuedDate" dense outlined placeholder="YYYY-MM-DD" class="edit-input"
                    :disable="!isAdmin" :error="validationErrors.issuedDate" error-message="Issued Date is required"
                    :hint="!isAdmin ? 'Cannot be edited!' : ''" :persistent-hint="!isAdmin" mask="####-##-##">
                    <template #append>
                      <q-icon name="event" class="cursor-pointer" :class="{ 'disabled-icon': !isAdmin }">
                        <q-popup-proxy v-if="isAdmin" cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="editData.issuedDate" mask="YYYY-MM-DD" emit-immediately>
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="edit-item">
                  <label class="edit-label">Issued By:</label>
                  <q-input v-model="editData.issuedBy" dense outlined class="edit-input" :disable="true"
                    hint="Cannot be edited!" :persistent-hint="true" />
                </div>

                <!-- MEDICINE & LABORATORY: Only show Issued Amount -->
                <div v-if="editData.category === 'MEDICINE' || editData.category === 'LABORATORY'" class="edit-item">
                  <label class="edit-label">Issued Amount: <span class="required">*</span></label>
                  <q-input :model-value="formatInputCurrency(editData.issuedAmount)"
                    @update:model-value="updateIssuedAmount" dense outlined class="edit-input" prefix="₱"
                    :error="validationErrors.issuedAmount"
                    error-message="Issued Amount is required and must be greater than 0" />
                </div>

                <!-- HOSPITAL: Show both Hospital Bill and Issued Amount -->
                <template v-if="editData.category === 'HOSPITAL'">
                  <div class="edit-item">
                    <label class="edit-label">Hospital Bill:<span class="required">*</span></label>
                    <q-input :model-value="formatInputCurrency(editData.hospitalBill)"
                      @update:model-value="updateHospitalBill" dense outlined class="edit-input" prefix="₱"
                      :error="validationErrors.hospitalBill"
                      error-message="Hospital Bill is required and must be greater than 0" />
                  </div>
                  <div class="edit-item">
                    <label class="edit-label">Issued Amount: <span class="required">*</span></label>
                    <q-input :model-value="formatInputCurrency(editData.issuedAmount)"
                      @update:model-value="updateIssuedAmount" dense outlined class="edit-input" prefix="₱"
                      :error="validationErrors.issuedAmount"
                      error-message="Issued Amount is required and must be greater than 0" />
                  </div>
                </template>

                <!-- Patient is same as client checkbox -->
                <div class="edit-item edit-item-full">
                  <q-checkbox v-model="editData.isChecked" label="Patient is same as client?" class="form-checkbox"
                    @update:model-value="onCheckboxChange" />
                </div>
              </div>

              <!-- Client Information Section - Only show if patient is NOT same as client -->
              <template v-if="!editData.isChecked">
                <div class="section-title q-mt-md q-mb-sm">Client Information</div>
                <div class="edit-grid">
                  <div class="edit-item">
                    <label class="edit-label">Last Name: <span class="required">*</span></label>
                    <q-input v-model="editData.clientLastName" dense outlined class="edit-input"
                      :error="validationErrors.clientLastName" error-message="Last Name is required" />
                  </div>
                  <div class="edit-item">
                    <label class="edit-label">First Name: <span class="required">*</span></label>
                    <q-input v-model="editData.clientFirstName" dense outlined class="edit-input"
                      :error="validationErrors.clientFirstName" error-message="First Name is required" />
                  </div>
                  <div class="edit-item">
                    <label class="edit-label">Middle Name:</label>
                    <q-input v-model="editData.clientMiddleName" dense outlined class="edit-input" />
                  </div>
                  <div class="edit-item">
                    <label class="edit-label">Suffix:</label>
                    <q-input v-model="editData.clientSuffix" dense outlined class="edit-input" />
                  </div>
                  <div class="edit-item edit-item-full">
                    <label class="edit-label">Relationship: <span class="required">*</span></label>
                    <q-input v-model="editData.relationship" dense outlined class="edit-input"
                      :error="validationErrors.relationship" error-message="Relationship is required" />
                  </div>
                </div>
              </template>
            </div>
          </div>
        </q-card-section>

        <!-- SEPARATOR - pinned -->
        <q-separator style="flex-shrink: 0;" />

        <!-- FOOTER - pinned at bottom -->
        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md" style="flex-shrink: 0;">
          <!-- VIEW MODE BUTTONS -->
          <template v-if="!editMode">
            <q-btn label="CLOSE" icon="close" unelevated class="dialog-goback-btn" @click="closeDialog" />
            <q-btn label="DELETE" icon="delete" unelevated class="dialog-delete-btn" @click="showDeleteDialog = true" />
            <q-btn label="EDIT" icon="edit" unelevated class="dialog-edit-btn" @click="enterEditMode" />
            <q-btn label="PRINT PDF" icon="print" unelevated class="dialog-print-btn" @click="generatePDF"
              :loading="pdfLoading" />
          </template>

          <!-- EDIT MODE BUTTONS -->
          <template v-else>
            <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelEdit" />
            <q-btn label="SAVE" icon="save" unelevated class="dialog-cancel-btn" @click="handleSaveClick" />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- INSUFFICIENT FUNDS DIALOG -->
    <q-dialog v-model="showInsufficientFundsDialog" persistent>
      <q-card style="min-width: 500px;">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-h6">
            <q-icon name="warning" size="sm" class="q-mr-sm" />
            Insufficient Funds Warning
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            The updated issued amount will result in a negative or insufficient budget balance.
          </div>

          <q-banner class="bg-orange-1 text-orange-9 q-mb-md">
            <template v-slot:avatar>
              <q-icon name="account_balance_wallet" color="orange" />
            </template>
            <div>
              <div class="text-weight-bold text-red">Projected Balance: ₱{{ formatCurrency(budgetData.projectedBalance)
                }}
              </div>
            </div>
          </q-banner>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelInsufficientFunds" />
          <q-btn label="PROCEED ANYWAY" icon="check" unelevated class="dialog-cancel-btn"
            @click="proceedWithInsufficientFunds" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DELETE CONFIRMATION DIALOG -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Delete Patient Record?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete this patient record? This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-delete-confirm-btn" @click="handleDelete"
            :loading="deleteLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- CLOSE CONFIRM DIALOG -->
    <q-dialog v-model="showCloseConfirmDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Close Form?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to close?
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="confirmClose" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- PRINT CONFIRM DIALOG -->
    <q-dialog v-model="showPrintConfirmDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Print PDF?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Do you want to generate and print this PDF?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="print" label="YES" class="dialog-cancel-btn" @click="confirmPrint"
            :loading="pdfLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- SAVE CONFIRMATION DIALOG -->
    <q-dialog v-model="showSaveConfirmDialog" persistent>
      <q-card
        style="min-width: 600px; max-width: 700px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;">

        <!-- HEADER - pinned -->
        <q-card-section class="bg-orange-6 text-white q-pa-md" style="flex-shrink: 0;">
          <div class="text-h6">
            <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
            Transaction Details Changed
          </div>
        </q-card-section>

        <!-- BODY - scrollable -->
        <q-card-section style="flex: 1; overflow-y: auto;">
          <div class="text-subtitle1 q-mb-md">
            You have modified the transaction details. Are you sure you want to update?
          </div>

          <!-- Show original record info -->
          <div class="patient-info-box q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Original Transaction Information:</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>UUID:</strong> {{ selectedRecord?.uuid }}
              </div>
              <div class="info-item">
                <strong>GL Number:</strong> {{ selectedRecord?.glNum }}
              </div>
              <div class="info-item">
                <strong>Category:</strong> {{ selectedRecord?.category }}
              </div>
              <div class="info-item">
                <strong>Partner:</strong> {{ selectedRecord?.partner }}
              </div>
              <div class="info-item" v-if="isAdmin">
                <strong>Issued Date:</strong> {{ formatDisplayDate(selectedRecord?.issuedDate) }}
              </div>
              <div class="info-item" v-if="isAdmin">
                <strong>Issued By:</strong> {{ selectedRecord?.issuedBy }}
              </div>
              <div class="info-item" v-if="selectedRecord?.category === 'HOSPITAL'">
                <strong>Hospital Bill:</strong> {{ selectedRecord?.hospitalBill ? '₱' +
                  formatCurrency(selectedRecord.hospitalBill) : 'N/A' }}
              </div>
              <div class="info-item" :class="{ 'info-item-full': selectedRecord?.category !== 'HOSPITAL' }">
                <strong>Issued Amount:</strong> ₱{{ formatCurrency(selectedRecord?.issuedAmount) }}
              </div>
              <div class="info-item info-item-full">
                <strong>Client Name:</strong>
                <span v-if="selectedRecord?.rawData?.client_lastname">
                  {{ selectedRecord.rawData.client_lastname }}, {{ selectedRecord.rawData.client_firstname }}
                  <span v-if="selectedRecord.rawData.client_middlename"> {{ selectedRecord.rawData.client_middlename
                    }}</span>
                  <span v-if="selectedRecord.rawData.client_suffix"> {{ selectedRecord.rawData.client_suffix }}</span>
                </span>
                <span v-else>N/A</span>
              </div>
              <div class="info-item" v-if="selectedRecord?.rawData?.client_lastname">
                <strong>Relationship:</strong> {{ selectedRecord?.rawData?.relationship || 'N/A' }}
              </div>
            </div>
          </div>

          <!-- Show current form values -->
          <div class="patient-info-box">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Current Form Values:</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>UUID:</strong> {{ editData.uuid }}
              </div>
              <div class="info-item">
                <strong>GL Number:</strong> {{ editData.glNum }}
              </div>
              <div class="info-item">
                <strong>Category:</strong> {{ editData.category }}
              </div>
              <div class="info-item">
                <strong>Partner:</strong> {{ editData.partner }}
              </div>
              <div class="info-item" v-if="isAdmin">
                <strong>Issued Date:</strong> {{ formatDisplayDate(editData.issuedDate) }}
              </div>
              <div class="info-item" v-if="isAdmin">
                <strong>Issued By:</strong> {{ editData.issuedBy }}
              </div>
              <div class="info-item" v-if="editData.category === 'HOSPITAL'">
                <strong>Hospital Bill:</strong> {{ editData.hospitalBill ? '₱' + formatCurrency(editData.hospitalBill) :
                'N/A' }}
              </div>
              <div class="info-item" :class="{ 'info-item-full': editData.category !== 'HOSPITAL' }">
                <strong>Issued Amount:</strong> ₱{{ formatCurrency(editData.issuedAmount) }}
              </div>
              <div class="info-item info-item-full">
                <strong>Client Name:</strong>
                <span v-if="editData.clientLastName">
                  {{ editData.clientLastName }}, {{ editData.clientFirstName }}
                  <span v-if="editData.clientMiddleName"> {{ editData.clientMiddleName }}</span>
                  <span v-if="editData.clientSuffix"> {{ editData.clientSuffix }}</span>
                </span>
                <span v-else>N/A</span>
              </div>
              <div class="info-item" v-if="editData.clientLastName">
                <strong>Relationship:</strong> {{ editData.relationship || 'N/A' }}
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- SEPARATOR - pinned -->
        <q-separator style="flex-shrink: 0;" />

        <!-- FOOTER - pinned at bottom -->
        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md" style="flex-shrink: 0;">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" v-close-popup />
          <q-btn label="UPDATE" icon="check" unelevated class="dialog-cancel-btn" @click="confirmSave"
            :loading="saveLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- CANCEL EDIT CONFIRMATION DIALOG -->
    <q-dialog v-model="showCancelConfirmDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Cancel Editing?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to cancel? All unsaved changes will be lost.
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="confirmCancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'src/boot/axios'

const axios = api
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { toWords } from 'number-to-words'
import { useQuasar } from 'quasar'

const router = useRouter()
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)

dayjs.extend(isSameOrAfter)

const route = useRoute()
const $q = useQuasar()
const identifier = computed(() => route.params.glNum)

const userData = JSON.parse(localStorage.getItem('user') || '{}')
const isAdmin = computed(() => userData?.ROLE === 'ADMIN')

const formatDisplayDate = (date) => {
  if (!date) return 'N/A'
  return dayjs(date).format('YYYY-MM-DD')
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  const num = parseFloat(amount)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatInputCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return ''
  const num = parseFloat(amount)
  if (isNaN(num)) return ''
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const parseCurrency = (formattedValue) => {
  if (!formattedValue) return null
  const cleaned = formattedValue.replace(/,/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

const updateIssuedAmount = (value) => {
  editData.value.issuedAmount = parseCurrency(value)
}

const updateHospitalBill = (value) => {
  editData.value.hospitalBill = parseCurrency(value)
}

const handleDelete = async () => {
  deleteLoading.value = true
  try {
    await axios.post(`/api/patient-details/delete/${selectedRecord.value.uuid}`, {
      performed_by: userData.USERNAME 
    })
    $q.notify({
      type: 'positive',
      message: 'Patient record deleted successfully',
      position: 'top'
    })
    showDeleteDialog.value = false
    showDetailsDialog.value = false
    router.push('/patient-records')
  } catch (error) {
    console.error("Failed to delete patient:", error)
    $q.notify({
      type: 'negative',
      message: 'Failed to delete patient record',
      position: 'top'
    })
  } finally {
    deleteLoading.value = false
  }
}

const rows = ref([])
const showDetailsDialog = ref(false)
const selectedRecord = ref(null)
const pdfLoading = ref(false)
const editMode = ref(false)
const saveLoading = ref(false)
const showSaveConfirmDialog = ref(false)
const showCancelConfirmDialog = ref(false)
const showCloseConfirmDialog = ref(false)
const showPrintConfirmDialog = ref(false)
const showInsufficientFundsDialog = ref(false)
const eligibilityCooldownDays = ref(90)
const dynamicPartners = ref([])

const budgetData = ref({
  currentBudget: 0,
  originalAmount: 0,
  newAmount: 0,
  difference: 0,
  projectedBalance: 0
})

const editData = ref({
  uuid: null,
  glNum: null,
  category: null,
  partner: null,
  issuedBy: null,
  issuedDate: null,
  issuedAmount: null,
  hospitalBill: null,
  clientLastName: null,
  clientFirstName: null,
  clientMiddleName: null,
  clientSuffix: null,
  relationship: null,
  isChecked: false
})

const validationErrors = ref({
  glNum: false,
  category: false,
  partner: false,
  issuedBy: false,
  issuedDate: false,
  issuedAmount: false,
  hospitalBill: false,
  clientLastName: false,
  clientFirstName: false,
  relationship: false
})

const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']

const partnerOptions = computed(() => {
  if (!editData.value.category) return []
  return dynamicPartners.value
    .filter(p => p.category === editData.value.category)
    .map(p => p.partner)
})

const hasChanges = computed(() => {
  if (!selectedRecord.value) return false
  return selectedRecord.value.glNum !== editData.value.glNum ||
    selectedRecord.value.category !== editData.value.category ||
    selectedRecord.value.partner !== editData.value.partner ||
    (isAdmin.value && selectedRecord.value.issuedDate !== editData.value.issuedDate) ||
    selectedRecord.value.issuedAmount !== editData.value.issuedAmount ||
    (editData.value.category === 'HOSPITAL' && selectedRecord.value.hospitalBill !== editData.value.hospitalBill) ||
    clientInfoChanged.value
})

const clientInfoChanged = computed(() => {
  if (!selectedRecord.value) return false
  const originalData = selectedRecord.value.rawData
  const originalHasClient = !!originalData.client_lastname
  const currentHasClient = !editData.value.isChecked
  if (originalHasClient !== currentHasClient) return true
  if (currentHasClient) {
    return (originalData.client_lastname || '') !== (editData.value.clientLastName || '') ||
      (originalData.client_firstname || '') !== (editData.value.clientFirstName || '') ||
      (originalData.client_middlename || '') !== (editData.value.clientMiddleName || '') ||
      (originalData.client_suffix || '') !== (editData.value.clientSuffix || '') ||
      (originalData.relationship || '') !== (editData.value.relationship || '')
  }
  return false
})

const fetchDropdownOptions = async () => {
  try {
    const res = await axios.get('/api/all')
    dynamicPartners.value = res.data.partners
  } catch (err) {
    console.error('Failed to fetch dropdown options', err)
    $q.notify({ type: 'negative', message: 'Failed to load dropdown options', position: 'top' })
  }
}

const columns = [
  { name: 'UUID', label: 'UUID', field: 'uuid', align: 'center' },
  { name: 'GL No.', label: 'GL No.', field: 'glNum', align: 'center' },
  { name: 'Category', label: 'Category', field: 'category', align: 'center' },
  { name: 'Issued At', label: 'Date Issued', field: 'issuedAt', align: 'center' },
  { name: 'eligibilityDate', label: 'Eligibility Date', field: 'eligibilityDate', align: 'center' },
  { name: 'Issued By', label: 'Issued By', field: 'issuedBy', align: 'center' },
  {
    name: 'Issued Amount',
    label: 'Issued Amount',
    field: 'issuedAmount',
    align: 'center',
    format: val => `₱${formatCurrency(val)}`
  },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

const calculateAge = (birthdate) => {
  if (!birthdate) return null
  const birth = dayjs(birthdate)
  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null
  return dayjs().diff(birth, 'year')
}

const resetValidationErrors = () => {
  validationErrors.value = {
    glNum: false,
    category: false,
    partner: false,
    issuedBy: false,
    issuedDate: false,
    issuedAmount: false,
    hospitalBill: false,
    clientLastName: false,
    clientFirstName: false,
    relationship: false
  }
}

const validateForm = () => {
  resetValidationErrors()
  let isValid = true

  if (isAdmin.value && (!editData.value.glNum || editData.value.glNum <= 0)) {
    validationErrors.value.glNum = true
    isValid = false
  }
  if (!editData.value.category) {
    validationErrors.value.category = true
    isValid = false
  }
  if (!editData.value.partner) {
    validationErrors.value.partner = true
    isValid = false
  }
  if (isAdmin.value && !editData.value.issuedDate) {
    validationErrors.value.issuedDate = true
    isValid = false
  }
  if (!editData.value.issuedAmount || editData.value.issuedAmount <= 0) {
    validationErrors.value.issuedAmount = true
    isValid = false
  }
  if (editData.value.category === 'HOSPITAL') {
    if (!editData.value.hospitalBill || editData.value.hospitalBill <= 0) {
      validationErrors.value.hospitalBill = true
      isValid = false
    }
  }
  if (!editData.value.isChecked) {
    if (!editData.value.clientLastName || editData.value.clientLastName.trim() === '') {
      validationErrors.value.clientLastName = true
      isValid = false
    }
    if (!editData.value.clientFirstName || editData.value.clientFirstName.trim() === '') {
      validationErrors.value.clientFirstName = true
      isValid = false
    }
    if (!editData.value.relationship || editData.value.relationship.trim() === '') {
      validationErrors.value.relationship = true
      isValid = false
    }
  }

  return isValid
}

const fetchEligibilityCooldown = async () => {
  try {
    const res = await axios.get('/api/get-eligibility-cooldown')
    eligibilityCooldownDays.value = res.data.days
  } catch (err) {
    console.error('Error fetching eligibility cooldown:', err)
  }
}

const calculateEligibility = (dateIssued) => {
  const today = dayjs().startOf('day')
  const eligibilityDate = dayjs(dateIssued).add(eligibilityCooldownDays.value, 'day')
  const diff = eligibilityDate.diff(today, 'day')
  const isEligible = diff <= 0
  return {
    eligibilityDate: eligibilityDate.format('YYYY-MM-DD'),
    eligibilityClass: isEligible ? 'text-positive' : 'text-negative',
    daysRemaining: diff > 0 ? diff : 0
  }
}

const checkBudget = async (originalAmount, newAmount) => {
  try {
    const res = await axios.get('/api/budget/current')
    const currentBudget = parseFloat(res.data.amount || 0)
    const difference = newAmount - originalAmount
    const projectedBalance = currentBudget - difference
    budgetData.value = { currentBudget, originalAmount, newAmount, difference, projectedBalance }
    return projectedBalance >= 0
  } catch (error) {
    console.error('Failed to fetch budget:', error)
    $q.notify({ type: 'negative', message: 'Failed to check budget', position: 'top' })
    return true
  }
}

const cancelInsufficientFunds = () => {
  showInsufficientFundsDialog.value = false
}

const proceedWithInsufficientFunds = () => {
  showInsufficientFundsDialog.value = false
  showSaveConfirmDialog.value = true
}

const viewDetails = async (uuidOrGlNo) => {
  try {
    const res = await axios.get(`/api/patient-details/${uuidOrGlNo}`)
    const data = res.data

    let clientName = null
    if (data.client_lastname) {
      clientName = `${data.client_lastname}, ${data.client_firstname}` +
        (data.client_middlename ? ` ${data.client_middlename}` : '') +
        (data.client_suffix ? ` ${data.client_suffix}` : '')
    }

    selectedRecord.value = {
      uuid: data.uuid,
      glNum: data.gl_no,
      category: data.category,
      partner: data.partner,
      issuedBy: data.issued_by,
      issuedDate: data.date_issued,
      issuedAmount: data.issued_amount,
      hospitalBill: data.hospital_bill,
      clientName: clientName,
      relationship: data.relationship,
      rawData: data
    }

    editMode.value = false
    showDetailsDialog.value = true
  } catch (err) {
    console.error('Error fetching details:', err)
    $q.notify({ type: 'negative', message: 'Failed to load record details', position: 'top' })
  }
}

const enterEditMode = () => {
  const data = selectedRecord.value.rawData
  editData.value = {
    uuid: selectedRecord.value.uuid,
    glNum: selectedRecord.value.glNum,
    category: selectedRecord.value.category,
    partner: selectedRecord.value.partner,
    issuedBy: selectedRecord.value.issuedBy,
    issuedDate: selectedRecord.value.issuedDate,
    issuedAmount: selectedRecord.value.issuedAmount,
    hospitalBill: selectedRecord.value.hospitalBill,
    clientLastName: data.client_lastname || null,
    clientFirstName: data.client_firstname || null,
    clientMiddleName: data.client_middlename || null,
    clientSuffix: data.client_suffix || null,
    relationship: selectedRecord.value.relationship,
    isChecked: !data.client_lastname
  }
  resetValidationErrors()
  editMode.value = true
}

const confirmPrint = async () => {
  showPrintConfirmDialog.value = false
  await generatePDF()
}

const cancelEdit = () => {
  showCancelConfirmDialog.value = true
}

const confirmCancel = () => {
  showCancelConfirmDialog.value = false
  editMode.value = false
  resetValidationErrors()
  editData.value = {
    uuid: null, glNum: null, category: null, partner: null, issuedBy: null,
    issuedDate: null, issuedAmount: null, hospitalBill: null, clientLastName: null,
    clientFirstName: null, clientMiddleName: null, clientSuffix: null, relationship: null, isChecked: false
  }
}

const closeDialog = () => {
  showDetailsDialog.value = false
  editMode.value = false
  selectedRecord.value = null
}

const onCategoryChange = () => {
  editData.value.partner = null
  validationErrors.value.partner = false
  if (editData.value.category !== 'HOSPITAL') {
    validationErrors.value.hospitalBill = false
  }
}

const onCheckboxChange = () => {
  if (editData.value.isChecked) {
    editData.value.clientLastName = null
    editData.value.clientFirstName = null
    editData.value.clientMiddleName = null
    editData.value.clientSuffix = null
    editData.value.relationship = null
    validationErrors.value.clientLastName = false
    validationErrors.value.clientFirstName = false
    validationErrors.value.relationship = false
  }
}

const confirmClose = () => {
  showCloseConfirmDialog.value = false
  showDetailsDialog.value = false
  editMode.value = false
  selectedRecord.value = null
  resetValidationErrors()
}

const handleSaveClick = async () => {
  if (!validateForm()) return

  const originalAmount = parseFloat(selectedRecord.value.issuedAmount)
  const newAmount = parseFloat(editData.value.issuedAmount)

  if (originalAmount !== newAmount) {
    const hasSufficientBudget = await checkBudget(originalAmount, newAmount)
    if (!hasSufficientBudget) {
      showInsufficientFundsDialog.value = true
      return
    }
  }

  showSaveConfirmDialog.value = true
}

const loadPatientHistory = async () => {
  try {
    const res = await axios.get(`/api/patient-history/${identifier.value}`)
    rows.value = res.data.history.map(item => {
      const eligibility = calculateEligibility(item.date_issued)
      return {
        uuid: item.uuid,
        glNum: item.gl_no,
        category: item.category,
        issuedAt: item.date_issued,
        issuedAmount: item.issued_amount,
        eligibilityDate: eligibility.eligibilityDate,
        eligibilityClass: eligibility.eligibilityClass,
        daysRemaining: eligibility.daysRemaining,
        issuedBy: item.issued_by
      }
    })
  } catch (err) {
    console.error('Error loading patient history:', err)
    $q.notify({ type: 'negative', message: 'Failed to load patient history', position: 'top' })
  }
}

const confirmSave = async () => {
  saveLoading.value = true
  try {
    const formData = new FormData()
    formData.append('identifier', editData.value.uuid)
    formData.append('update_transaction_only', '1')
    formData.append('category', editData.value.category)
    formData.append('partner', editData.value.partner)
    formData.append('hospital_bill', editData.value.hospitalBill || 0)
    formData.append('issued_amount', editData.value.issuedAmount)
    formData.append('is_checked', editData.value.isChecked ? 1 : 0)

    if (isAdmin.value) {
      formData.append('gl_no', editData.value.glNum)
      formData.append('issued_by', editData.value.issuedBy)
      formData.append('date_issued', editData.value.issuedDate)
    }

    formData.append('client_lastname', editData.value.clientLastName || '')
    formData.append('client_firstname', editData.value.clientFirstName || '')
    formData.append('client_middlename', editData.value.clientMiddleName || '')
    formData.append('client_suffix', editData.value.clientSuffix || '')
    formData.append('relationship', editData.value.relationship || '')
    formData.append('performed_by', userData.USERNAME)


    await axios.post('/api/patient-details/update', formData)

    $q.notify({ type: 'positive', message: 'Record updated successfully', position: 'top' })

    showSaveConfirmDialog.value = false
    await viewDetails(editData.value.uuid)
    await loadPatientHistory()

    editMode.value = false
    resetValidationErrors()
  } catch (error) {
    console.error('Save error:', error)
    $q.notify({ type: 'negative', message: 'Failed to update record', position: 'top' })
  } finally {
    saveLoading.value = false
  }
}

const generatePDF = async () => {
  if (!selectedRecord.value) return
  pdfLoading.value = true

  try {
    const data = selectedRecord.value.rawData
    const pdfMap = { MEDICINE: '/med.pdf', LABORATORY: '/lab.pdf', HOSPITAL: '/hosp.pdf' }
    const pdfPath = pdfMap[data.category]
    const existingPdfBytes = await fetch(pdfPath).then((res) => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const amountWords = toWords(parseInt(data.issued_amount)).toUpperCase() + ' PESOS'
    const page = pdfDoc.getPages()[0]
    page.setSize(page.getWidth(), 1200)
    page.translateContent(0, 605)

    const parsedDate = new Date(data.date_issued)
    const dayNum = parsedDate.getDate() + getDaySuffix(parsedDate.getDate())
    const monthName = parsedDate.toLocaleString('default', { month: 'long' })

    const fullNameValue = data.patient_lastname + ", " + data.patient_firstname +
      (data.patient_middlename ? " " + data.patient_middlename : "") +
      (data.patient_suffix ? " " + data.patient_suffix : "")

    let clientValue = fullNameValue
    if (data.client_lastname) {
      clientValue = data.client_lastname + ", " + data.client_firstname +
        (data.client_middlename ? " " + data.client_middlename : "") +
        (data.client_suffix ? " " + data.client_suffix : "") +
        " / " + (data.relationship ? " " + data.relationship : "")
    }

    const fullAddressValue = data.house_address + ", " + data.barangay + ", " + data.city + ", " + data.province
    const age = calculateAge(data.birthdate)

    page.drawText(data.gl_no + ' / ' + data.partner, { x: 600, y: 489, size: 14, color: rgb(0, 0, 0), font: boldFont })
    page.drawText(fullNameValue.toUpperCase(), { x: 160, y: 375, size: 13, color: rgb(0, 0, 0), font: boldFont })

    if (age !== null) {
      page.drawText(String(age), { x: 545, y: 375, size: 13, color: rgb(0, 0, 0), font: boldFont })
    }

    page.drawText(data.sex.toUpperCase(), { x: 630, y: 375, size: 13, color: rgb(0, 0, 0), font: boldFont })
    page.drawText(fullAddressValue.toUpperCase(), { x: 120, y: 350, size: 13, color: rgb(0, 0, 0), font: boldFont })
    page.drawText(clientValue.toUpperCase(), { x: 70, y: 300, size: 13, color: rgb(0, 0, 0), font: boldFont })

    if (data.category == 'MEDICINE') {
      page.drawText(amountWords, { x: 310, y: 270, size: 13, color: rgb(0, 0, 0), font: boldFont })
    } else {
      page.drawText(amountWords, { x: 360, y: 270, size: 13, color: rgb(0, 0, 0), font: boldFont })
    }

    page.drawText(formatCurrency(data.issued_amount), { x: 340, y: 242, size: 14, color: rgb(0, 0, 0), font: boldFont })
    page.drawText(dayNum, { x: 170, y: 191, size: 13, color: rgb(0, 0, 0), font: boldFont })
    page.drawText(monthName.toUpperCase(), { x: 315, y: 191, size: 13, color: rgb(0, 0, 0), font: boldFont })
    page.drawText(data.issued_by.toUpperCase(), { x: 340, y: 65, size: 13, color: rgb(0, 0, 0), font: boldFont })

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    window.open(url)

    $q.notify({ type: 'positive', message: 'PDF generated successfully', position: 'top' })
  } catch (error) {
    console.error('PDF generation error:', error)
    $q.notify({ type: 'negative', message: 'Failed to generate PDF', position: 'top' })
  } finally {
    pdfLoading.value = false
  }
}

function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

onMounted(async () => {
  await fetchDropdownOptions()
  await fetchEligibilityCooldown()
  await loadPatientHistory()
})
</script>

<style scoped>
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

.budget-table :deep(.q-table__title) {
  font-size: 40px;
  font-weight: 600;
  color: #1f8f2e;
}

.budget-table :deep(td) {
  vertical-align: middle;
}

.budget-table :deep(.q-table__top) {
  padding: 12px 16px !important;
  margin: 0;
  background-color: #1f8f2e;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.budget-table :deep(.q-table__top .text-h4) {
  color: #ffffff !important;
}

.budget-table :deep(.q-table__card) {
  border-radius: 4px;
  overflow: hidden;
}

.budget-table :deep(.action-cell) {
  height: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========================
   DIALOG STYLES
======================== */
.info-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item-full {
  grid-column: 1 / -1;
  padding: 8px 0;
}

.info-label {
  font-weight: 600;
  color: #1f8f2e;
  font-size: 13px;
}

.info-value {
  color: #333;
  font-size: 14px;
}

/* ========================
   BUTTON STYLES
======================== */
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

.dialog-edit-btn {
  background: #ff9800 !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-print-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

/* ========================
   EDIT MODE STYLES
======================== */
.edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.edit-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.edit-item-full {
  grid-column: 1 / -1;
}

.edit-label {
  font-weight: 600;
  color: #1f8f2e;
  font-size: 13px;
}

.required {
  color: red;
}

.edit-input :deep(.q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

.edit-input :deep(.q-field__control:before),
.edit-input :deep(.q-field__control:after) {
  display: none !important;
}

.edit-input :deep(.q-field__native),
.edit-input :deep(.q-field__input),
.edit-input :deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

.edit-input :deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

.edit-input :deep(input[readonly]),
.edit-input :deep(input:read-only) {
  color: #757575 !important;
}

.edit-input :deep(.q-field--readonly .q-field__control) {
  background-color: #ededed;
  border-color: #cfcfcf;
}

.edit-input :deep(.q-field--readonly .q-field__native),
.edit-input :deep(.q-field--readonly .q-field__input) {
  color: #757575 !important;
}

.edit-input :deep(.q-field--disabled .q-field__control) {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
  color: #9e9e9e;
}

.edit-input :deep(.q-field--disabled .q-field__native),
.edit-input :deep(.q-field--disabled .q-field__input) {
  color: #9e9e9e !important;
}

.edit-input :deep(.q-field--error .q-field__control) {
  border-color: #c10015 !important;
}

.edit-input :deep(.q-field__messages) {
  color: #c10015;
  font-size: 12px;
  padding-top: 4px;
}

.edit-input :deep(.q-field__bottom .q-field__messages:not(.q-field__error)) {
  color: #757575 !important;
  font-size: 11px;
}

/* ========================
   CHECKBOX STYLES
======================== */
.form-checkbox :deep(.q-checkbox__bg) {
  border: 2px solid #000;
  border-radius: 2px;
}

.form-checkbox :deep(.q-checkbox__label) {
  font-weight: 600;
}

.form-checkbox :deep(.q-checkbox--disabled .q-checkbox__label) {
  color: #757575;
}

.form-checkbox :deep(.q-checkbox--disabled .q-checkbox__bg) {
  border-color: #757575;
}

/* ========================
   DATE PICKER ICON
======================== */
.cursor-pointer {
  cursor: pointer;
}

.disabled-icon {
  opacity: 0.5;
  cursor: not-allowed !important;
}

/* ========================
   PATIENT INFO BOX
======================== */
.patient-info-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.patient-info-box .info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.patient-info-box .info-item {
  font-size: 13px;
  color: #333;
}

.patient-info-box .info-item strong {
  color: #1f8f2e;
  font-weight: 600;
}

.patient-info-box .info-item-full {
  grid-column: 1 / -1;
}

.changes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.change-item {
  font-size: 13px;
  color: #333;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.change-item strong {
  color: #1976d2;
  min-width: 140px;
}

.old-value {
  color: #d32f2f;
  font-weight: 500;
}

.new-value {
  color: #388e3c;
  font-weight: 600;
}

.dialog-delete-btn {
  background: #ff3b3b !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-delete-confirm-btn {
  background: #ff3b3b !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}
</style>

