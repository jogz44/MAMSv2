<template>
  <div class="toolbar-wrapper">

    <q-card flat bordered class="filter-card">
      <q-card-section class="row q-col-gutter-md items-center">

        <!-- SEARCH -->
        <div class="col-10">
          <q-input v-model="search" placeholder="Search by name, category, GL No., barangay, or date (YYYY-MM-DD)"
            outlined dense clearable>
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- BUTTON -->
        <div class="col-auto">
          <RouterLink to="/add-patient">
            <q-btn icon="add" label="ADD PATIENT" color="green" style="margin-left: 20px;" />
          </RouterLink>
        </div>

      </q-card-section>
    </q-card>

  </div>
  <br>
  <div class="budget-table table-scroll">
    <q-table title="Patient's Record" :rows="rows" :columns="columns" row-key="glNum">
      <template #body-cell-action="props">
        <ActionBtn :row="props.row" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'

const axios = api
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import ActionBtn from './ActionBtn.vue'

const router = useRouter()
const rows = ref([])
const search = ref('')

const columns = [
  { name: 'name', label: "Patient's Name", field: 'name', align: 'center', sortable: true },
  { name: 'barangay', label: 'Barangay', field: 'barangay', align: 'center', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'center', sortable: true },
  { name: 'glNum', label: 'GL No.', field: 'glNum', align: 'center', sortable: true },
  { name: 'date', label: 'Date Issued', field: 'date', align: 'center', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

const STORAGE_KEY = 'patient_list_search'

onMounted(() => {
  // Restore saved search filter
  const savedSearch = localStorage.getItem(STORAGE_KEY)
  if (savedSearch && savedSearch !== 'null' && savedSearch !== '') {
    search.value = savedSearch
  }

  const getPatientList = async () => {
    try {
      const res = await axios.get('/api/patients')
      rows.value = mapPatientsToRows(res.data)
      
      // If there's a saved search, trigger the search
      if (savedSearch && savedSearch !== 'null' && savedSearch !== '') {
        const searchRes = await axios.get(
          '/api/patients/search',
          { params: { q: savedSearch } }
        )
        rows.value = mapPatientsToRows(searchRes.data)
      }
    } catch (error) {
      console.error('Failed to fetch patients:', error)
    }
  }

  getPatientList()
})

// Save search filter before component unmounts
onBeforeUnmount(() => {
  if (search.value && search.value !== '') {
    localStorage.setItem(STORAGE_KEY, search.value)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
})

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
      glNum: patient.gl_no,
      date: patient.date_issued
    }
  })
}
watch(search, async (val) => {
  if (val && val !== '') {
    localStorage.setItem(STORAGE_KEY, val)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }

  if (!val || val.trim() === '') {
    const res = await axios.get('/api/patients')
    rows.value = mapPatientsToRows(res.data)
  } else {
    const res = await axios.get(
      '/api/patients/search',
      { params: { q: val } }
    )
    rows.value = mapPatientsToRows(res.data)
  }
})
</script>

<style scoped>
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

.budget-table :deep(.q-table__card) {
  border-radius: 4px;
  overflow: hidden;
}

.budget-table :deep(.q-table__top) {
  padding: 0 !important;
  margin: 0;
  display: block;
}

.budget-table :deep(.q-table__title) {
  font-size: 35px;
  font-weight: 700;
  color: #ffffff;
  background-color: #1f8f2e;
  padding: 8px 16px;
  width: 100%;
  margin: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  display: block;
  box-sizing: border-box;
}

.budget-table :deep(.action-cell) {
  height: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>