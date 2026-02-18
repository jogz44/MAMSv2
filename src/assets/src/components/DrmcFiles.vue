<template>
    <q-card flat bordered class="filter-card" style="margin-top: 20px; width: 85%; margin-left: 90px;">
        <q-card-section>
            <div class="row items-center" style="gap: 16px;">
                <!-- DATE SEARCH -->
                <div class="row items-center" style="gap: 8px;">
                    <span class="text-body2 text-weight-medium" style="white-space: nowrap; margin-left: 20px;">
                        Filter by Period:
                    </span>

                    <q-input style="width: 250px;" :model-value="formattedDate" outlined dense
                        placeholder="dd/mm/yyyy - dd/mm/yyyy" @clear="onClearDate" readonly>
                        <template #append>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover>
                                    <q-date v-model="dateRange" range emit-immediately mask="DD/MM/YYYY">
                                        <div class="row items-center justify-end q-pa-sm">
                                            <q-btn label="Close" color="primary" flat v-close-popup />
                                        </div>
                                    </q-date>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </div>

                <!-- CATEGORY -->
                <div style="width: 200px;">
                    <q-select v-model="categoryValue" :options="categoryOptions" label="Category" placeholder="Category"
                        dense outlined @clear="onClearCategory" />
                </div>

                <!-- PARTNER -->
                <div style="width: 200px;">
                    <q-select v-model="partnerValue" dense outlined :options="partnerOptions" label="Partner"
                        placeholder="Partner" @clear="onClearPartner" :disable="categoryValue == null" />
                </div>

                <!-- BARANGAY -->
                <div style="width: 200px;">
                    <q-select v-model="barangayValue" :options="barangayOptions" label="Barangay" placeholder="Barangay"
                        dense outlined @clear="onClearBarangay" />
                </div>
            </div>
        </q-card-section>
    </q-card>
    <div class="budget-table table-scroll">
        <q-table :rows="filteredRows" :columns="columns" row-key="glNum" :loading="loading" flat bordered>
            <template #body-cell-action="props">
                <ActionBtn :row="props.row" />
            </template>
        </q-table>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'

const axios = api
import ActionBtn from './ActionBtn.vue'

const rows = ref([])
const allPatients = ref([]) // Store all patients
const loading = ref(false)
const dateRange = ref(null)

const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const barangayOptions = [
  "APOKON", "BINCUNGAN", "BUSAON", "CANOCOTAN", "CUAMBOGAN", "LA FILIPINA", "LIBOGANON", "MADAUM",
  "MAGDUM", "MAGUGPO EAST", "MAGUGPO NORTH", "MAGUGPO POBLACION", "MAGUGPO SOUTH", "MAGUGPO WEST",
  "MANKILAM", "NEW BALAMBAN", "NUEVA FUERZA", "PAGSABANGAN", "PANDAPAN", "SAN AGUSTIN", "SAN ISIDRO",
  "SAN MIGUEL (CAMP 4)", "VISAYAN VILLAGE"
]

const categoryValue = ref(null)
const partnerValue = ref(null)
const barangayValue = ref(null)

const columns = [
  { name: 'date', label: "Date", field: 'date', align: 'center', sortable: true },
  { name: 'glNo', label: 'Gl No.', field: 'glNo', align: 'center', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'center', sortable: true },
  { name: 'patient', label: "Patient's Name", field: 'patient', align: 'center', sortable: true },
  { name: 'client', label: "Client's Name", field: 'client', align: 'center', sortable: true },
  { name: 'address', label: 'Address', field: 'address', align: 'center' },
  { name: 'age', label: 'Age', field: 'age', align: 'center' },
  { name: 'sex', label: 'Sex', field: 'sex', align: 'center' },
  { name: 'bill', label: 'Bill', field: 'bill', align: 'center' },
  { name: 'issuedAmount', label: 'Issued Amount', field: 'issuedAmount', align: 'center' }
]

// Computed rows - filters by category, partner, and barangay on frontend
const filteredRows = computed(() => {
  let filtered = allPatients.value

  // Filter by category
  if (categoryValue.value) {
    filtered = filtered.filter(patient => patient.category === categoryValue.value)
  }

  // Filter by partner
  if (partnerValue.value) {
    filtered = filtered.filter(patient => patient.partner === partnerValue.value)
  }

  // Filter by barangay
  if (barangayValue.value) {
    filtered = filtered.filter(patient => patient.barangay === barangayValue.value)
  }

  return filtered
})

const partnerOptions = computed(() => {
  if (categoryValue.value === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (categoryValue.value === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (categoryValue.value === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

// Watch category changes to reset partner
watch(categoryValue, (newVal, oldVal) => {
  // Reset partner when category changes
  if (newVal !== oldVal) {
    partnerValue.value = null
  }
})

// Map patient data to table rows
const mapPatientsToRows = (patients) => {
  return patients.map(patient => {
    const name = [
      patient.lastname ? patient.lastname + ',' : '',
      patient.firstname,
      patient.middlename,
      patient.suffix
    ].filter(Boolean).join(' ')

    return {
      ...patient,
      name,
      barangay: patient.barangay,
      category: patient.category,
      partner: patient.partner,
      glNum: patient.gl_no,
      date: patient.date_issued
    }
  })
}

// Format date for display
const formattedDate = computed(() => {
  if (!dateRange.value) {
    return ''
  }

  if (typeof dateRange.value === 'string') {
    return dateRange.value
  }

  const { from, to } = dateRange.value
  if (from && !to) {
    return from
  }
  if (from && to) {
    return `${from} - ${to}`
  }
  return ''
})

// Fetch patients with optional date filter
const fetchPatients = async (dateFilter = null) => {
  loading.value = true
  try {
    let params = {}
    
    if (dateFilter) {
      if (typeof dateFilter === 'string') {
        params.date = dateFilter
      } else {
        const { from, to } = dateFilter
        if (from && to) {
          params.from = from
          params.to = to
        } else if (from) {
          params.date = from
        }
      }
    }
    
    const res = await axios.get('/api/patient-records', { params })
    allPatients.value = mapPatientsToRows(res.data)
  } catch (err) {
    console.error('Failed to fetch patients:', err)
  } finally {
    loading.value = false
  }
}

// Watch for date range changes
watch(dateRange, async (newVal) => {
  if (!newVal) {
    fetchPatients()
    return
  }

  if (typeof newVal === 'string') {
    fetchPatients(newVal)
  } else {
    const { from, to } = newVal
    if (from && to) {
      fetchPatients({ from, to })
    } else if (from) {
      fetchPatients(from)
    }
  }
})

// Clear date filter
const onClearDate = () => {
  dateRange.value = null
}

// Clear category filter
const onClearCategory = () => {
  categoryValue.value = null
  partnerValue.value = null
}

// Clear partner filter
const onClearPartner = () => {
  partnerValue.value = null
}

// Clear barangay filter
const onClearBarangay = () => {
  barangayValue.value = null
}

// Initial fetch on mount
onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>

.budget-table {
    margin-left: 90px;
  width: 85%;
  overflow-x: auto;
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

.budget-table :deep(td) {
  text-align: center;
  vertical-align: middle;
}

.budget-table :deep(.q-table__title) {
  font-size: 24px;
  font-weight: 700;
  color: #1f8f2e;
}

.budget-table :deep(.action-cell) {
  height: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>