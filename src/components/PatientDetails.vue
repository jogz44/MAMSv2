<template>
  <div>
    <!-- HEADER ROW - no padding needed, full width -->
    <div class="fieldset-header">
      <div class="fieldset-title">Patient's Info.</div>

      <div class="actions">
        <!-- View Mode Buttons -->
        <template v-if="!edit">
          <q-btn label="DELETE" icon="delete" class="action-btn delete-btn" @click="showDeleteDialog = true" dense />
          <q-btn label="EDIT" icon="edit" class="action-btn edit-btn" dense @click="edit = true" />
        </template>

        <!-- Edit Mode Buttons -->
        <template v-if="edit">
          <q-btn label="Cancel" icon="close" class="action-btn cancel-btn" @click="showCancelDialog = true" dense />
          <q-btn label="Save" icon="save" class="action-btn save-btn" @click="handleSaveClick" dense />
        </template>
      </div>
    </div>

    <!-- Content with padding -->
    <div class="q-pa-md">
      <q-form ref="patientForm">
        <div class="patient-ids">
          <h6>Patient ID: {{ patientIDValue }}</h6>
        </div>

        <!-- ================= PATIENT DETAILS ================= -->
        <div class="row q-col-gutter-md">

          <div class="col-6">
            <label class="form-label">Last Name <span class="required">*</span></label>
            <q-input v-model="lastNameValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-6">
            <label class="form-label">First Name <span class="required">*</span></label>
            <q-input v-model="firstNameValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-6">
            <label class="form-label">Middle Name</label>
            <q-input v-model="middleNameValue" dense outlined class="flat-input" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-6">
            <label class="form-label">Suffix</label>
            <q-input v-model="suffixValue" dense outlined class="flat-input" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>
          <div class="col-3">
            <label class="form-label">Birthdate <span class="required">*</span></label>
            <q-input v-model="birthdateValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit" placeholder="DD/MM/YYYY"
              @update:model-value="checkForChanges">
              <template #append v-if="edit">
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="birthdateValue" mask="DD/MM/YYYY" emit-immediately>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-3">
            <label class="form-label">Age</label>
            <q-input v-model="ageValue" dense outlined placeholder="Auto-calculated" class="flat-input" readonly />
          </div>

          <div class="col-3">
            <label class="form-label">Sex <span class="required">*</span></label>
            <q-select v-model="sexValue" :options="options[0]" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :disable="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-3">
            <label class="form-label">Preference</label>
            <q-select v-model="preferenceValue" :options="preferenceOptions" dense outlined class="flat-input"
              :disable="!edit" @update:model-value="checkForChanges" />
          </div>

          <div class="col-12">
            <label class="form-label">Sector</label>
            <div class="sector-container">
              <div v-if="allSectors.length === 0" class="text-grey-6 text-caption q-pa-sm">
                No sectors available
              </div>
              <q-checkbox v-for="sector in allSectors" :key="sector.id" :val="sector.id" v-model="selectedSectorIds"
                :label="sector.sector" dense :disable="!edit || !sector.is_active"
                @update:model-value="checkForChanges">
                <q-tooltip v-if="!sector.is_active" :delay="300" class="text-body2">
                  This sector is deactivated and cannot be changed
                </q-tooltip>
              </q-checkbox>
            </div>
          </div>

          <div class="col-4">
            <label class="form-label">Province</label>
            <q-input v-model="provinceValue" :hint="'Cannot be edited!'" :persistent-hint="true" dense outlined
              class="flat-input" readonly />
          </div>

          <div class="col-4">
            <label class="form-label">City</label>
            <q-input v-model="cityValue" :hint="'Cannot be edited!'" :persistent-hint="true" dense outlined
              class="flat-input" readonly />
          </div>

          <div class="col-4">
            <label class="form-label">Barangay <span class="required">*</span></label>
            <q-select v-model="barangayValue" :options="options[2]" :rules="[val => !!val || 'This field is required']"
              dense outlined class="flat-input" :disable="!edit" @update:model-value="checkForChanges" />
          </div>

          <div class="col-6">
            <label class="form-label">House Address <span class="required">*</span></label>
            <q-input v-model="houseAddressValue" dense outlined class="flat-input"
              :rules="[val => !!val || 'This field is required']" :readonly="!edit"
              @update:model-value="checkForChanges" />
          </div>

          <div class="col-6">
            <label class="form-label">Phone Number <span class="required">*</span></label>
            <q-input v-model="phoneNumberValue" dense outlined class="flat-input" placeholder="09XXXXXXXXX"
              :rules="[validatePhoneNumber]" :readonly="!edit" maxlength="11" @update:model-value="onPhoneNumberChange"
              @keypress="onPhoneNumberKeyPress" hint="Format: 09XXXXXXXXX (11 digits)" :persistent-hint="true" />
          </div>
        </div>
      </q-form>
    </div>

    <!-- All dialogs remain the same -->
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
          <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="handleDelete"
            :loading="deleteLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

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

    <!-- FINAL SAVE CONFIRMATION -->
    <q-dialog v-model="showFinalSaveDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save Changes?</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to save these changes?
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelPatientEdit" />
          <q-btn label="UPDATE" icon="check" unelevated class="dialog-cancel-btn" @click="confirmSave"
            :loading="editActionLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- PATIENT EDIT CONFIRMATION DIALOG -->
    <q-dialog v-model="showPatientEditDialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px;">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-h6">
            <q-icon name="edit" size="sm" class="q-mr-sm" />
            Patient Information Changed
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            You have modified the patient information. Are you sure you want to update?
          </div>

          <!-- Show original patient info -->
          <div class="patient-info-box q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Original Patient Information:</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>Name:</strong>
                {{ originalPatientData.lastname }}, {{ originalPatientData.firstname }}
                <span v-if="originalPatientData.middlename"> {{ originalPatientData.middlename }}</span>
                <span v-if="originalPatientData.suffix"> {{ originalPatientData.suffix }}</span>
              </div>
              <div class="info-item">
                <strong>Birthdate:</strong> {{ originalPatientData.birthdate }}
              </div>
              <div class="info-item">
                <strong>Age:</strong> {{ calculateAgeFromDate(originalPatientData.birthdate) }}
              </div>
              <div class="info-item">
                <strong>Sex:</strong> {{ originalPatientData.sex || 'N/A' }}
              </div>
              <div class="info-item">
                <strong>Preference:</strong> {{ originalPatientData.preference || 'N/A' }}
              </div>
              <div class="info-item info-item-full">
                <strong>Address:</strong> {{ originalPatientData.house_address }}, {{ originalPatientData.barangay }},
                {{ originalPatientData.city }}, {{ originalPatientData.province }}
              </div>
              <div class="info-item">
                <strong>Phone:</strong> {{ formatPhoneNumber(originalPatientData.phone_number) }}
              </div>
              <div class="info-item info-item-full">
                <strong>Sectors:</strong>
                {{(originalPatientData.sector_ids || []).length
                  ? allSectors.filter(s => (originalPatientData.sector_ids || []).includes(s.id)).map(s =>
                    s.sector).join(',') : 'None'}}
              </div>
            </div>
          </div>

          <!-- Show current form values -->
          <div class="patient-info-box">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Current Form Values:</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>Name:</strong>
                {{ lastNameValue }}, {{ firstNameValue }}
                <span v-if="middleNameValue"> {{ middleNameValue }}</span>
                <span v-if="suffixValue"> {{ suffixValue }}</span>
              </div>
              <div class="info-item">
                <strong>Birthdate:</strong> {{ birthdateValue || 'N/A' }}
              </div>
              <div class="info-item">
                <strong>Age:</strong> {{ ageValue }}
              </div>
              <div class="info-item">
                <strong>Sex:</strong> {{ sexValue || 'N/A' }}
              </div>
              <div class="info-item">
                <strong>Preference:</strong> {{ preferenceValue || 'N/A' }}
              </div>
              <div class="info-item info-item-full">
                <strong>Address:</strong> {{ houseAddressValue }}, {{ barangayValue }}, {{ cityValue }}, {{
                  provinceValue }}
              </div>
              <div class="info-item">
                <strong>Phone:</strong> {{ formatPhoneNumber(phoneNumberValue) }}
              </div>
              <div class="info-item info-item-full">
                <strong>Sectors:</strong>
                {{selectedSectorIds.length
                  ? allSectors.filter(s => selectedSectorIds.includes(s.id)).map(s => s.sector).join(', ') : 'None'}}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelPatientEdit" />
          <q-btn label="UPDATE" icon="check" unelevated class="dialog-cancel-btn" @click="showFinalSaveDialog = true"
            :loading="editActionLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- TRANSACTION/CLIENT DETAILS EDIT CONFIRMATION DIALOG -->
    <q-dialog v-model="showTransactionEditDialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px;">
        <q-card-section class="bg-orange-6 text-white">
          <div class="text-h6">
            <q-icon name="receipt_long" size="sm" class="q-mr-sm" />
            Transaction/Client Details Changed
          </div>
        </q-card-section>

        <q-card-section>
          <div class="text-subtitle1 q-mb-md">
            You have modified the transaction or client details for this record. Are you sure you want to update?
          </div>

          <!-- Show original transaction info -->
          <div class="patient-info-box q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Original Transaction Information:</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>Category:</strong> {{ originalPatientData.category || 'N/A' }}
              </div>
              <div class="info-item">
                <strong>Partner:</strong> {{ originalPatientData.partner || 'N/A' }}
              </div>
              <div class="info-item" v-if="originalPatientData.category === 'HOSPITAL'">
                <strong>Hospital Bill:</strong> {{ originalPatientData.hospital_bill || 'N/A' }}
              </div>
              <div class="info-item" :class="{ 'info-item-full': originalPatientData.category !== 'HOSPITAL' }">
                <strong>Issued Amount:</strong> {{ originalPatientData.issued_amount || 'N/A' }}
              </div>
              <div class="info-item info-item-full">
                <strong>Client Name:</strong>
                <span v-if="originalPatientData.client_lastname">
                  {{ originalPatientData.client_lastname }}, {{ originalPatientData.client_firstname }}
                  <span v-if="originalPatientData.client_middlename"> {{ originalPatientData.client_middlename }}</span>
                  <span v-if="originalPatientData.client_suffix"> {{ originalPatientData.client_suffix }}</span>
                </span>
                <span v-else>N/A</span>
              </div>
              <div class="info-item" v-if="originalPatientData.client_lastname">
                <strong>Relationship:</strong> {{ originalPatientData.relationship || 'N/A' }}
              </div>
            </div>
          </div>

          <!-- Show current form values -->
          <div class="patient-info-box">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Current Form Values:</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>Category:</strong> {{ categoryValue || 'N/A' }}
              </div>
              <div class="info-item">
                <strong>Partner:</strong> {{ partnerValue || 'N/A' }}
              </div>
              <div class="info-item" v-if="categoryValue === 'HOSPITAL'">
                <strong>Hospital Bill:</strong> {{ hospitalBillValue || 'N/A' }}
              </div>
              <div class="info-item" :class="{ 'info-item-full': categoryValue !== 'HOSPITAL' }">
                <strong>Issued Amount:</strong> {{ issuedAmountValue || 'N/A' }}
              </div>
              <div class="info-item info-item-full">
                <strong>Client Name:</strong>
                <span v-if="clientLastNameValue">
                  {{ clientLastNameValue }}, {{ clientFirstNameValue }}
                  <span v-if="clientMiddleNameValue"> {{ clientMiddleNameValue }}</span>
                  <span v-if="clientSuffixValue"> {{ clientSuffixValue }}</span>
                </span>
                <span v-else>N/A</span>
              </div>
              <div class="info-item" v-if="clientLastNameValue">
                <strong>Relationship:</strong> {{ relationshipValue || 'N/A' }}
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
          <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelTransactionEdit" />
          <q-btn label="UPDATE" icon="check" unelevated class="dialog-cancel-btn" @click="proceedWithTransactionUpdate"
            :loading="editActionLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
// Script remains exactly the same - no changes needed
import { api } from 'src/boot/axios'

const axios = api
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { toWords } from 'number-to-words'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const glNum = computed(() => route.params.glNum)

const allSectors = ref([])
const selectedSectorIds = ref([])

const edit = ref(false)

const dynamicPartners = ref([])
const dynamicPreferences = ref([])
const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const preferenceOptions = computed(() =>
  dynamicPreferences.value.map(p => p.preference)
)

const options = [
  ['MALE', 'FEMALE'],
  preferenceOptions,
  ["APOKON",
    "BINCUNGAN",
    "BUSAON",
    "CANOCOTAN",
    "CUAMBOGAN",
    "LA FILIPINA",
    "LIBOGANON",
    "MADAUM",
    "MAGDUM",
    "MAGUGPO EAST",
    "MAGUGPO NORTH",
    "MAGUGPO POBLACION",
    "MAGUGPO SOUTH",
    "MAGUGPO WEST",
    "MANKILAM",
    "NEW BALAMBAN",
    "NUEVA FUERZA",
    "PAGSABANGAN",
    "PANDAPAN",
    "SAN AGUSTIN",
    "SAN ISIDRO",
    "SAN MIGUEL (CAMP 4)",
    "VISAYAN VILLAGE"
  ]
]
const patientForm = ref(null);
const patientIDValue = ref(null)
const categoryValue = ref(null)
const lastNameValue = ref(null)
const firstNameValue = ref(null)
const middleNameValue = ref(null)
const suffixValue = ref(null)
const birthdateValue = ref(null)
const sexValue = ref(null)
const preferenceValue = ref(null)
const isChecked = ref(false);
const provinceValue = ref('Davao del Norte')
const cityValue = ref("Tagum City")
const barangayValue = ref(null)
const houseAddressValue = ref(null)
const partnerValue = ref(null)
const hospitalBillValue = ref(null)
const issuedAmountValue = ref(null)
const issuedByValue = ref(null)
const clientLastNameValue = ref(null)
const clientFirstNameValue = ref(null)
const clientMiddleNameValue = ref(null)
const clientSuffixValue = ref(null)
const relationshipValue = ref(null)
const dateToday = ref(null)

const showFinalSaveDialog = ref(false)
const showDeleteDialog = ref(false)
const showCancelDialog = ref(false)
const showPatientEditDialog = ref(false)
const showTransactionEditDialog = ref(false)
const deleteLoading = ref(false)
const editActionLoading = ref(false)
const hasPatientChanges = ref(false)
const hasTransactionChanges = ref(false)

const fetchDropdownOptions = async () => {
  try {
    const res = await axios.get('/api/all')
    dynamicPartners.value = res.data.partners
    dynamicPreferences.value = res.data.preferences
    const sectorsRes = await axios.get('/api/sectors/all')
    allSectors.value = sectorsRes.data
  } catch (err) {
    console.error('Failed to fetch dropdown options', err)
    $q.notify({ type: 'negative', message: 'Failed to load dropdown options', position: 'top' })
  }
}

const partnerOptions = computed(() => {
  if (!categoryValue.value) return []
  return dynamicPartners.value
    .filter(p => p.category === categoryValue.value)
    .map(p => p.partner)
})

const originalPatientData = ref({
  lastname: null,
  firstname: null,
  middlename: null,
  suffix: null,
  patient_id: null,
  birthdate: null,
  sex: null,
  preference: null,
  barangay: null,
  house_address: null,
  phone_number: null,
  province: null,
  city: null,
  category: null,
  partner: null,
  hospital_bill: null,
  issued_amount: null,
  is_checked: null,
  client_lastname: null,
  client_firstname: null,
  client_middlename: null,
  client_suffix: null,
  relationship: null
})
const phoneNumberValue = ref(null)

const normalizePhoneNumber = (value) => {
  if (!value) return null
  let cleaned = value.replace(/\D/g, '')
  if (!cleaned.startsWith('09')) {
    return null
  }
  if (cleaned.length !== 11) {
    return null
  }
  return cleaned
}

const validatePhoneNumber = (value) => {
  if (!value) return 'Phone number is required'
  const normalized = normalizePhoneNumber(value)
  if (!normalized) {
    return 'Invalid phone number. Must be 11 digits starting with 09'
  }
  return true
}

const onPhoneNumberChange = (value) => {
  if (value) {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    phoneNumberValue.value = cleaned

    const normalized = normalizePhoneNumber(cleaned)
    if (normalized) {
      phoneNumberValue.value = normalized
    }
  }
  checkForChanges()
}

const onPhoneNumberKeyPress = (event) => {
  // Only allow numbers (0-9)
  const charCode = event.which ? event.which : event.keyCode
  if (charCode < 48 || charCode > 57) {
    event.preventDefault()
  }
}

const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A'
  if (phone.length === 11) {
    return `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}`
  }
  return phone
}

const convertToMySQLDate = (dateString) => {
  if (!dateString) return null
  const parts = dateString.split('/')
  if (parts.length !== 3) return null
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
}

const convertFromMySQLDate = (dateString) => {
  if (!dateString) return null
  const parts = dateString.split('-')
  if (parts.length !== 3) return null
  const year = parts[0]
  const month = parts[1].padStart(2, '0')
  const day = parts[2].padStart(2, '0')
  return `${day}/${month}/${year}`
}

watch(categoryValue, () => {
  partnerValue.value = null
})

const checkPatientChanges = () => {
  if (!edit.value) return false
  return lastNameValue.value !== originalPatientData.value.lastname ||
    firstNameValue.value !== originalPatientData.value.firstname ||
    (middleNameValue.value || null) !== (originalPatientData.value.middlename || null) ||
    (suffixValue.value || null) !== (originalPatientData.value.suffix || null) ||
    birthdateValue.value !== originalPatientData.value.birthdate ||
    sexValue.value !== originalPatientData.value.sex ||
    (preferenceValue.value || null) !== (originalPatientData.value.preference || null) ||
    barangayValue.value !== originalPatientData.value.barangay ||
    houseAddressValue.value !== originalPatientData.value.house_address ||
    (phoneNumberValue.value || null) !== (originalPatientData.value.phone_number || null) ||
    JSON.stringify([...selectedSectorIds.value].sort()) !== JSON.stringify([...(originalPatientData.value.sector_ids || [])].sort())  // ADD THIS LINE
}

const checkTransactionChanges = () => {
  if (!edit.value) return false
  return categoryValue.value !== originalPatientData.value.category ||
    partnerValue.value !== originalPatientData.value.partner ||
    (hospitalBillValue.value || 0) !== (originalPatientData.value.hospital_bill || 0) ||
    issuedAmountValue.value !== originalPatientData.value.issued_amount ||
    isChecked.value !== originalPatientData.value.is_checked ||
    (clientLastNameValue.value || null) !== (originalPatientData.value.client_lastname || null) ||
    (clientFirstNameValue.value || null) !== (originalPatientData.value.client_firstname || null) ||
    (clientMiddleNameValue.value || null) !== (originalPatientData.value.client_middlename || null) ||
    (clientSuffixValue.value || null) !== (originalPatientData.value.client_suffix || null) ||
    (relationshipValue.value || null) !== (originalPatientData.value.relationship || null)
}

const checkForChanges = () => {
  hasPatientChanges.value = checkPatientChanges()
  hasTransactionChanges.value = checkTransactionChanges()
}

const handleDelete = async () => {
  deleteLoading.value = true
  try {
    await axios.post(`/api/patient-details/delete/${glNum.value}`)
    $q.notify({
      type: 'positive',
      message: 'Patient record deleted successfully',
      position: 'top'
    })
    showDeleteDialog.value = false
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

const ageValue = computed(() => {
  if (!birthdateValue.value) return null
  const birth = dayjs(birthdateValue.value, 'DD/MM/YYYY', true)
  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null
  return dayjs().diff(birth, 'year')
})

const calculateAgeFromDate = (birthdateString) => {
  if (!birthdateString) return null
  const birth = dayjs(birthdateString, 'DD/MM/YYYY', true)
  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null
  return dayjs().diff(birth, 'year')
}

const handleCancel = async () => {
  showCancelDialog.value = false
  edit.value = false
  hasPatientChanges.value = false
  hasTransactionChanges.value = false
  await getPatientDetails(glNum.value)
}

const validateRequiredFields = () => {
  const errors = []
  if (!lastNameValue.value?.trim()) errors.push('Last Name is required')
  if (!firstNameValue.value?.trim()) errors.push('First Name is required')
  if (!birthdateValue.value) errors.push('Birthdate is required')
  if (!sexValue.value) errors.push('Sex is required')
  if (!barangayValue.value) errors.push('Barangay is required')
  if (!houseAddressValue.value?.trim()) errors.push('House Address is required')
  return errors
}

const handleSaveClick = async () => {
  const errors = validateRequiredFields()
  if (errors.length > 0) {
    $q.notify({
      type: 'negative',
      message: errors.join('<br>'),
      html: true,
      position: 'top',
      timeout: 4000
    })
    return
  }
  const isValid = await patientForm.value.validate()
  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields',
      position: 'top'
    })
    return
  }
  const patientChanged = checkPatientChanges()
  const transactionChanged = checkTransactionChanges()
  if (patientChanged) {
    showPatientEditDialog.value = true
  } else if (transactionChanged) {
    showTransactionEditDialog.value = true
  } else {
    $q.notify({
      type: 'info',
      message: 'No changes detected',
      position: 'top'
    })
    edit.value = false
  }
}

const cancelPatientEdit = () => {
  showPatientEditDialog.value = false
}

const cancelTransactionEdit = () => {
  showTransactionEditDialog.value = false
}

const proceedWithTransactionUpdate = async () => {
  editActionLoading.value = true
  try {
    await updateTransactionDetails()
    showTransactionEditDialog.value = false
    edit.value = false
    hasPatientChanges.value = false
    hasTransactionChanges.value = false
    await getPatientDetails(glNum.value)
  } catch (error) {
    console.error('Transaction update failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update transaction details',
      position: 'top'
    })
  } finally {
    editActionLoading.value = false
  }
}

const updatePatientInfo = async () => {
  const formData = new FormData()
  formData.append('identifier', glNum.value)
  formData.append('update_patient_info', '1')
  formData.append('category', categoryValue.value)
  formData.append('lastname', lastNameValue.value)
  formData.append('firstname', firstNameValue.value)
  formData.append('middlename', middleNameValue.value || '')
  formData.append('suffix', suffixValue.value || '')
  formData.append('sector_ids', JSON.stringify(selectedSectorIds.value))
  const mysqlBirthdate = convertToMySQLDate(birthdateValue.value)
  formData.append('birthdate', mysqlBirthdate)
  formData.append('sex', sexValue.value)
  formData.append('preference', preferenceValue.value || '')
  formData.append('is_checked', isChecked.value ? 1 : 0)
  formData.append('province', provinceValue.value)
  formData.append('city', cityValue.value)
  formData.append('barangay', barangayValue.value)
  formData.append('house_address', houseAddressValue.value)
  formData.append('phone_number', phoneNumberValue.value || '')
  formData.append('partner', partnerValue.value)
  formData.append('hospital_bill', hospitalBillValue.value || 0)
  formData.append('issued_amount', issuedAmountValue.value)
  const user = JSON.parse(localStorage.getItem('user'))
  formData.append('issued_by', user.USERNAME)
  formData.append('client_lastname', clientLastNameValue.value || '')
  formData.append('client_firstname', clientFirstNameValue.value || '')
  formData.append('client_middlename', clientMiddleNameValue.value || '')
  formData.append('client_suffix', clientSuffixValue.value || '')
  formData.append('relationship', relationshipValue.value || '')
  await axios.post('/api/patient-details/update', formData)
  $q.notify({
    type: 'positive',
    message: 'Patient information updated successfully',
    position: 'top'
  })
}

const updateTransactionDetails = async () => {
  const formData = new FormData()
  formData.append('identifier', glNum.value)
  formData.append('update_transaction_only', '1')
  formData.append('sector_ids', JSON.stringify(selectedSectorIds.value))
  formData.append('category', categoryValue.value)
  formData.append('partner', partnerValue.value)
  formData.append('hospital_bill', hospitalBillValue.value || 0)
  formData.append('issued_amount', issuedAmountValue.value)
  formData.append('is_checked', isChecked.value ? 1 : 0)
  formData.append('client_lastname', clientLastNameValue.value || '')
  formData.append('client_firstname', clientFirstNameValue.value || '')
  formData.append('client_middlename', clientMiddleNameValue.value || '')
  formData.append('client_suffix', clientSuffixValue.value || '')
  formData.append('relationship', relationshipValue.value || '')
  await axios.post('/api/patient-details/update', formData)
  $q.notify({
    type: 'positive',
    message: 'Transaction details updated successfully',
    position: 'top'
  })
}

onMounted(async () => {
  // Fetch dropdown options first
  await fetchDropdownOptions()

  if (!glNum.value) return
  getPatientDetails(glNum.value)
})
watch(
  () => route.params.glNum,
  (newGlNum) => {
    if (newGlNum) {
      getPatientDetails(newGlNum)
    }
  }
)

const confirmSave = async () => {
  editActionLoading.value = true
  try {
    await updatePatientInfo()
    showFinalSaveDialog.value = false
    showPatientEditDialog.value = false
    if (checkTransactionChanges()) {
      showTransactionEditDialog.value = true
    } else {
      edit.value = false
      hasPatientChanges.value = false
      hasTransactionChanges.value = false
      await getPatientDetails(glNum.value)
    }
  } catch (error) {
    console.error('Save failed:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save changes',
      position: 'top'
    })
  } finally {
    editActionLoading.value = false
  }
}

const getPatientDetails = async (id) => {
  const res = await axios.get(
    `/api/patient-details/${id}`
  )
  const patientDetails = res.data
  if (!patientDetails) return
  patientIDValue.value = patientDetails.patient_id
  categoryValue.value = patientDetails.category
  lastNameValue.value = patientDetails.patient_lastname
  firstNameValue.value = patientDetails.patient_firstname
  middleNameValue.value = patientDetails.patient_middlename
  suffixValue.value = patientDetails.patient_suffix
  birthdateValue.value = convertFromMySQLDate(patientDetails.birthdate)
  sexValue.value = patientDetails.sex
  preferenceValue.value = patientDetails.preference
  provinceValue.value = patientDetails.province
  cityValue.value = patientDetails.city
  barangayValue.value = patientDetails.barangay
  houseAddressValue.value = patientDetails.house_address
  phoneNumberValue.value = patientDetails.phone_number
  selectedSectorIds.value = patientDetails.sector_ids || []
  originalPatientData.value = {
    lastname: patientDetails.patient_lastname,
    firstname: patientDetails.patient_firstname,
    middlename: patientDetails.patient_middlename,
    suffix: patientDetails.patient_suffix,
    patient_id: patientDetails.patient_id,
    birthdate: convertFromMySQLDate(patientDetails.birthdate),
    sex: patientDetails.sex,
    preference: patientDetails.preference,
    barangay: patientDetails.barangay,
    house_address: patientDetails.house_address,
    phone_number: patientDetails.phone_number,
    province: patientDetails.province,
    city: patientDetails.city,
    category: patientDetails.category,
    partner: patientDetails.partner,
    hospital_bill: patientDetails.hospital_bill,
    issued_amount: patientDetails.issued_amount,
    sector_ids: patientDetails.sector_ids || [],
    is_checked: patientDetails.client_lastname == null,
    client_lastname: patientDetails.client_lastname,
    client_firstname: patientDetails.client_firstname,
    client_middlename: patientDetails.client_middlename,
    client_suffix: patientDetails.client_suffix,
    relationship: patientDetails.relationship
  }
  await nextTick()
  partnerValue.value = patientDetails.partner
  hospitalBillValue.value = patientDetails.hospital_bill
  issuedAmountValue.value = patientDetails.issued_amount
  issuedByValue.value = patientDetails.issued_by
  dateToday.value = patientDetails.date_issued
  if (patientDetails.client_lastname != null) {
    isChecked.value = false
    clientLastNameValue.value = patientDetails.client_lastname
    clientFirstNameValue.value = patientDetails.client_firstname
    clientMiddleNameValue.value = patientDetails.client_middlename
    clientSuffixValue.value = patientDetails.client_suffix
    relationshipValue.value = patientDetails.relationship
  } else {
    isChecked.value = true
    clientLastNameValue.value = null
    clientFirstNameValue.value = null
    clientMiddleNameValue.value = null
    clientSuffixValue.value = null
    relationshipValue.value = null
  }
  hasPatientChanges.value = false
  hasTransactionChanges.value = false
}

function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}
</script>

<style scoped>
/* TITLE */
.fieldset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1f8f2e;
  padding: 12px 24px;
  margin-bottom: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.fieldset-title {
  font-size: 40px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
}

.patient-ids {
  margin-bottom: 20px;
}

.patient-ids h6 {
  margin: 4px 0;
  font-weight: 600;
}

.q-card-section {
  border: 2px solid #b5b5b5;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.12),
    0 6px 18px rgba(0, 0, 0, 0.08);
  border-radius: 6px;
  background: #ffffff;
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
.form-group {
  margin-bottom: 16px;
}

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

.flat-input :deep(.q-field--disabled .q-field__control) {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
}

.flat-input :deep(.q-field--disabled .q-field__native),
.flat-input :deep(.q-field--disabled .q-field__input),
.flat-input :deep(.q-field--disabled input),
.flat-input :deep(.q-field--disabled .q-field__label) {
  color: #757575 !important;
}

/* BUTTON COLORS */
.delete-btn {
  background: #ff3b3b;
  border-radius: 5%;
}

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

.cancel-btn,
.save-btn {
  gap: 10px;
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

.dialog-warning-btn {
  background: #ff9800 !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-cancel-btn .q-icon,
.dialog-goback-btn .q-icon,
.dialog-warning-btn .q-icon {
  margin-right: 6px;
}

/* =========================
   PATIENT INFO BOX
========================= */
.patient-info-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  font-size: 13px;
  color: #333;
}

.info-item strong {
  color: #1f8f2e;
}

.info-item-full {
  grid-column: 1 / -1;
}

/* =========================
   CHANGES LIST (for transaction dialog)
========================= */
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

/* =========================
   OPTIONS GRID
========================= */
.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.option-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-card:hover {
  border-color: #0aa64f;
  background-color: #f5f5f5;
}

.option-selected {
  border-color: #0aa64f;
  background-color: #e8f5e9;
  border-width: 3px;
}

.option-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-disabled:hover {
  border-color: #e0e0e0;
  background-color: transparent;
}

.option-title {
  font-weight: 700;
  font-size: 16px;
  color: #1f8f2e;
}

.option-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.sector-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 8px 10px;
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  align-items: center;
}

.sector-container :deep(.q-checkbox) {
  margin-top: 0;
}

.sector-container :deep(.q-checkbox__label) {
  font-size: 13px;
  font-weight: 500;
}
</style>
