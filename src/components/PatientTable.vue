<template>
  <div class="toolbar-wrapper">

    <q-card flat bordered class="filter-card">
      <q-card-section class="row q-col-gutter-md items-center">

        <!-- SEARCH -->
        <div class="col-10">
          <q-input v-model="search"
            placeholder="Search by name, barangay, sector, category, UUID, GL no., or date (YYYY-MM-DD)" outlined dense
            clearable>
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
    <q-table title="Patient's Record" :rows="rows" :columns="columns" row-key="uuid">
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
const allSectors = ref([])

const fetchSectors = async () => {
  try {
    const res = await axios.get('/api/sectors')
    allSectors.value = res.data  // [{ id, sector }]
  } catch (err) {
    console.error('Failed to fetch sectors:', err)
  }
}

const columns = [
  { name: 'name', label: "Patient's Name", field: 'name', align: 'center', sortable: true },
  { name: 'barangay', label: 'Barangay', field: 'barangay', align: 'center', sortable: true },
  { name: 'sector', label: 'Sector', field: 'sector', align: 'center', sortable: true },
  { name: 'category', label: 'Category', field: 'category', align: 'center', sortable: true },
  { name: 'uuid', label: 'UUID', field: 'uuid', align: 'center', sortable: true }, // Added UUID column
  { name: 'glNum', label: 'GL No.', field: 'glNum', align: 'center', sortable: true },
  { name: 'date', label: 'Date Issued', field: 'date', align: 'center', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

const STORAGE_KEY = 'patient_list_search'

onMounted(async () => {
  // Fetch sectors first so mapPatientsToRows can resolve names
  await fetchSectors()

  // Restore saved search filter
  const savedSearch = sessionStorage.getItem(STORAGE_KEY)
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
    sessionStorage.setItem(STORAGE_KEY, search.value)
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
})

const formatSector = (sectorIds) => {
  if (!sectorIds || !sectorIds.length || !allSectors.value.length) return 'N/A'
  const names = sectorIds
    .map(id => {
      const found = allSectors.value.find(s => s.id === id)
      return found ? found.sector : null
    })
    .filter(Boolean)
  return names.length ? names.join(', ') : 'N/A'
}

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
      uuid: patient.uuid, // UUID for display and row-key
      name,
      barangay: patient.barangay,
      sector: formatSector(patient.sector_ids),
      category: patient.category,
      glNum: patient.gl_no, // Display GL number to user
      date: patient.date_issued
    }
  })
}

watch(search, async (val) => {
  // Save to sessionStorage whenever search changes (only if not empty)
  if (val && val !== '') {
    sessionStorage.setItem(STORAGE_KEY, val)
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const res = await axios.get(
    '/api/patients/search',
    { params: { q: val || '' } }
  )

  rows.value = mapPatientsToRows(res.data)
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

@media screen and (max-width: 1218px) {
  .toolbar-wrapper :deep(.row) {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  .toolbar-wrapper :deep(.col-10) {
    flex: 1;
    min-width: 0;
  }

  .toolbar-wrapper :deep(.col-auto) {
    flex-shrink: 0;
  }

  .toolbar-wrapper :deep(.q-btn) {
    width: auto;
    margin-left: 8px !important;
    white-space: nowrap;
  }

  .toolbar-wrapper :deep(.q-input) {
    width: 100%;
    overflow: hidden;
  }

  .toolbar-wrapper :deep(.q-input input) {
    font-size: 11px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .toolbar-wrapper :deep(.q-input input::placeholder) {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .budget-table :deep(.q-table__title) {
    font-size: 22px;
    padding: 8px 12px;
  }

  .budget-table :deep(thead th) {
    font-size: 10px;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  .budget-table :deep(td) {
    font-size: 11px;
    padding: 6px 8px;
  }
}

@media screen and (max-width: 480px) {
  .toolbar-wrapper :deep(.row) {
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  .toolbar-wrapper :deep(.col-10) {
    flex: 1;
    min-width: 0;
  }

  .toolbar-wrapper :deep(.col-auto) {
    flex-shrink: 0;
  }

  .toolbar-wrapper :deep(.q-btn) {
    width: auto;
    margin-left: 8px !important;
    white-space: nowrap;
  }

  .toolbar-wrapper :deep(.q-input) {
    width: 100%;
    overflow: hidden;
  }

  .toolbar-wrapper :deep(.q-input input) {
    font-size: 11px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .toolbar-wrapper :deep(.q-input input::placeholder) {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .budget-table :deep(.q-table__title) {
    font-size: 22px;
    padding: 8px 12px;
  }

  .budget-table :deep(thead th) {
    font-size: 10px;
    padding-left: 8px !important;
    padding-right: 8px !important;
  }

  .budget-table :deep(td) {
    font-size: 11px;
    padding: 6px 8px;
  }
}
</style>
