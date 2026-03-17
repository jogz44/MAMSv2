<template>
  <div class="toolbar-wrapper">

    <q-card flat bordered class="filter-card">
      <q-card-section class="toolbar-row row q-col-gutter-md items-center">

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
            <q-btn icon="add" label="ADD PATIENT" color="green" class="add-patient-btn" style="margin-left: 20px;" />
          </RouterLink>
        </div>

      </q-card-section>
    </q-card>

  </div>
  <br>
  <div class="budget-table table-scroll">
    <q-table :rows="rows" :columns="columns" row-key="uuid">
      <template #top>
        <div class="table-header">
          <div class="table-title">Patient's Record</div>

          <div class="table-filter-group">
            <q-select
              v-model="activeDateFilter"
              :options="dateFilterOptions"
              emit-value
              map-options
              dense
              outlined
              bg-color="white"
              color="white"
              options-dense
              popup-content-class="patient-filter-menu"
              class="table-filter-select"
            />
          </div>
        </div>
      </template>

      <template #body-cell-action="props">
        <ActionBtn :row="props.row" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
const axios = api
import dayjs from 'dayjs'
import { computed, ref, onMounted, watch } from 'vue'
import ActionBtn from './ActionBtn.vue'

const allRows = ref([])
const search = ref('')
const allSectors = ref([])
const activeDateFilter = ref('today')
const dateFilterOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'All Records', value: 'all' }
]

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
  { name: 'uuid', label: 'UUID', field: 'uuid', align: 'center', sortable: true },
  { name: 'glNum', label: 'GL No.', field: 'glNum', align: 'center', sortable: true },
  { name: 'date', label: 'Date Issued', field: 'date', align: 'center', sortable: true },
  { name: 'action', label: 'Action', field: 'action', align: 'center' }
]

const STORAGE_KEY = 'patient_list_search'

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
    const sector = formatSector(patient.sector_ids)
    const date = patient.date_issued

    return {
      ...patient,
      uuid: patient.uuid,
      name,
      barangay: patient.barangay,
      sector,
      category: patient.category,
      glNum: patient.gl_no,
      date,
      searchIndex: [
        name,
        patient.barangay,
        sector,
        patient.category,
        patient.uuid,
        patient.gl_no,
        date
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    }
  })
}

const normalizeRecordDate = (value) => {
  if (!value) return ''
  return String(value).slice(0, 10)
}

const getThisWeekRange = () => {
  const today = dayjs().startOf('day')
  const dayOfWeek = today.day()
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const start = today.subtract(daysSinceMonday, 'day')
  const end = start.add(6, 'day')

  return { start, end }
}

const matchesDateFilter = (rowDate, filterValue) => {
  if (filterValue === 'all') return true

  const normalizedDate = normalizeRecordDate(rowDate)
  if (!normalizedDate) return false

  const recordDate = dayjs(normalizedDate).startOf('day')
  if (!recordDate.isValid()) return false

  const today = dayjs().startOf('day')

  if (filterValue === 'today') {
    return recordDate.isSame(today, 'day')
  }

  if (filterValue === 'yesterday') {
    return recordDate.isSame(today.subtract(1, 'day'), 'day')
  }

  if (filterValue === 'thisWeek') {
    const { start, end } = getThisWeekRange()
    return (
      (recordDate.isSame(start, 'day') || recordDate.isAfter(start, 'day')) &&
      (recordDate.isSame(end, 'day') || recordDate.isBefore(end, 'day'))
    )
  }

  return true
}

const rows = computed(() => {
  const normalizedSearch = search.value.trim().toLowerCase()

  return allRows.value.filter(row => {
    const matchesSearch = !normalizedSearch || row.searchIndex.includes(normalizedSearch)
    const matchesDate = matchesDateFilter(row.date, activeDateFilter.value)

    return matchesSearch && matchesDate
  })
})

const fetchPatients = async () => {
  try {
    const res = await axios.get('/api/patients')
    allRows.value = mapPatientsToRows(res.data)
  } catch (error) {
    console.error('Failed to fetch patients:', error)
  }
}

onMounted(async () => {
  await fetchSectors()

  const savedSearch = sessionStorage.getItem(STORAGE_KEY)
  if (savedSearch && savedSearch !== 'null' && savedSearch !== '') {
    search.value = savedSearch
  }

  await fetchPatients()
})

watch(search, (val) => {
  if (val && val !== '') {
    sessionStorage.setItem(STORAGE_KEY, val)
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
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
}

.table-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  background-color: #1f8f2e;
  padding: 8px 16px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  box-sizing: border-box;
}

.table-title {
  font-size: 35px;
  font-weight: 700;
  color: #ffffff;
}

.table-filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
  margin-left: auto;
}

.table-filter-select {
  min-width: 180px;
}

.budget-table :deep(.action-cell) {
  height: 100%;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 1218px) {
  .toolbar-row {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .toolbar-row > .col-10 {
    flex: 1;
    min-width: 0;
  }

  .toolbar-row > .col-auto {
    flex-shrink: 0;
  }

  .add-patient-btn {
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

  .table-header {
    gap: 12px;
    padding: 8px 12px;
  }

  .table-title {
    font-size: 22px;
  }

  .table-filter-group {
    margin-left: 0;
    justify-content: flex-start;
  }

  .table-filter-select {
    min-width: 170px;
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
  .toolbar-row {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }

  .toolbar-row > .col-10 {
    flex: 1;
    min-width: 0;
  }

  .toolbar-row > .col-auto {
    flex-shrink: 0;
  }

  .add-patient-btn {
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

  .table-header {
    padding: 8px 12px;
  }

  .table-filter-group {
    gap: 8px;
  }

  .table-filter-select {
    min-width: 150px;
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
