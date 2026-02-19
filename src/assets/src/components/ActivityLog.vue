<template>
  <div class="activity-log q-mb-lg">
    <q-table :rows="filteredLogs" :columns="columns" row-key="id" :loading="loading" :pagination="pagination" flat
      bordered @row-click="openLogDetails">

      <!-- TOP BAR -->
      <template #top>
        <div class="row items-center full-width q-gutter-sm">
          <div class="text-h4 text-weight-bold text-white">
            Activity Log
          </div>
          <q-space />

          <!-- SEARCH -->
          <q-input v-model="searchText" dense outlined placeholder="Search..." style="min-width: 200px" clearable
            @update:model-value="onSearchChange">
            <template #prepend>
              <q-icon name="search" color="white" />
            </template>
          </q-input>

          <!-- REFRESH -->
          <q-btn icon="refresh" label="Refresh" flat dense color="white" @click="refreshAll" />
        </div>
      </template>

      <!-- ACTION BADGE -->
      <template #body-cell-action="props">
        <q-td align="center">
          <q-badge :color="getActionColor(props.row.action)" :label="props.row.action"
            class="text-weight-bold q-pa-xs action-badge" />
        </q-td>
      </template>

      <!-- TARGET COLUMN -->
      <template #body-cell-target="props">
        <q-td align="center">
          <span class="target-text">{{ props.row.target || '—' }}</span>
        </q-td>
      </template>

      <!-- CHANGES COLUMN -->
      <template #body-cell-changes="props">
        <q-td align="left">
          <span class="changes-text">{{ props.row.changes || '—' }}</span>
          <q-tooltip v-if="props.row.changes && props.row.changes.length > 60" max-width="420px"
            class="text-body2 q-pa-sm">
            {{ props.row.changes }}
          </q-tooltip>
        </q-td>
      </template>

      <!-- NO DATA -->
      <template #no-data>
        <div class="full-width row flex-center text-grey q-py-lg">
          <q-icon name="info" size="sm" class="q-mr-sm" />
          No activity logs found.
        </div>
      </template>
    </q-table>

    <!-- ========================= -->
    <!-- ACTIVITY DETAILS DIALOG  -->
    <!-- ========================= -->

    <q-dialog v-model="showDetails">
      <q-card class="details-card">

        <!-- HEADER -->
        <q-card-section class="details-header row items-center">
          <div class="text-h6 text-weight-bold">
            Activity Details
          </div>
          <q-space />
          <q-btn icon="close" flat dense round v-close-popup />
        </q-card-section>

        <!-- BODY -->
        <q-card-section class="details-body" v-if="selectedLog">
          <div class="section-box">

            <div class="text-subtitle1 text-weight-bold q-mb-md">
              Activity Information
            </div>

            <div class="row q-col-gutter-lg">

              <!-- LEFT COLUMN -->
              <div class="col-12 col-md-6">
                <div class="field-block">
                  <div class="field-label">Date & Time:</div>
                  <div>{{ formatDate(selectedLog.created_at) }}</div>
                </div>

                <div class="field-block">
                  <div class="field-label">Performed By:</div>
                  <div>{{ selectedLog.performed_by }}</div>
                </div>
              </div>

              <!-- RIGHT COLUMN -->
              <div class="col-12 col-md-6">
                <div class="field-block">
                  <div class="field-label">Action:</div>
                  <div>
                    <q-badge :color="getActionColor(selectedLog.action)" :label="selectedLog.action"
                      class="text-weight-bold" />
                  </div>
                </div>

                <div class="field-block">
                  <div class="field-label">Target:</div>
                  <div>{{ selectedLog.target || '—' }}</div>
                </div>
              </div>

            </div>

            <!-- CHANGES -->
            <div class="field-block q-mt-lg">
              <div class="field-label">Changes Made:</div>
              <div class="changes-full">
                {{ selectedLog.changes || '—' }}
              </div>
            </div>

          </div>
        </q-card-section>

      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import dayjs from 'dayjs'

const axios = api
const $q = useQuasar()

const logs = ref([])
const loading = ref(false)
const searchText = ref('')
const filterAction = ref('ALL')
const actionFilterOptions = ref([{ label: 'All Actions', value: 'ALL' }])

let searchTimeout = null

const pagination = ref({
  rowsPerPage: 5,
  sortBy: 'created_at',
  descending: true
})

const columns = [
  {
    name: 'created_at',
    label: 'DATE & TIME',
    field: 'created_at',
    align: 'center',
    sortable: true,
    sort: (a, b) => dayjs(a).unix() - dayjs(b).unix(),
    format: val => val ? dayjs(val).format('YYYY-MM-DD hh:mm A') : '—',
    style: 'min-width: 180px'
  },
  {
    name: 'performed_by',
    label: 'PERFORMED BY',
    field: 'performed_by',
    align: 'center',
    sortable: true,
    style: 'min-width: 140px'
  },
  {
    name: 'action',
    label: 'ACTION',
    field: 'action',
    align: 'center',
    style: 'min-width: 160px'
  },
  {
    name: 'target',
    label: 'TARGET',
    field: 'target',
    align: 'center',
    style: 'min-width: 160px'
  },
  {
    name: 'changes',
    label: 'CHANGES MADE',
    field: 'changes',
    align: 'left',
    style: 'min-width: 280px'
  },
]

// Client-side filter for instant search feedback while server also filters
const filteredLogs = computed(() => {
  if (!searchText.value) return logs.value
  const s = searchText.value.toLowerCase()
  return logs.value.filter(log =>
    dayjs(log.created_at).format('YYYY-MM-DD hh:mm A').toLowerCase().includes(s) ||
    (log.performed_by || '').toLowerCase().includes(s) ||
    (log.action || '').toLowerCase().includes(s) ||
    (log.target || '').toLowerCase().includes(s) ||
    (log.changes || '').toLowerCase().includes(s)
  )
})

const getActionColor = (action) => {
  if (!action) return 'grey-6'
  if (action.includes('DELETE')) return 'red'
  if (action.includes('CREATED') || action.includes('ADDED') || action.includes('REACTIVATED')) return 'green-7'
  if (action.includes('UPDATED') || action.includes('TOGGLED')) return 'orange-8'
  return 'grey-6'
}

const fetchActionTypes = async () => {
  try {
    const res = await axios.get('/api/activity-logs/actions')
    const dynamic = res.data.actions.map(a => ({
      label: a.replace(/_/g, ' '),
      value: a
    }))
    actionFilterOptions.value = [{ label: 'All Actions', value: 'ALL' }, ...dynamic]
  } catch (err) {
    console.error('Failed to fetch action types:', err)
  }
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {}
    if (filterAction.value && filterAction.value !== 'ALL') {
      params.action = filterAction.value
    }
    // ← REMOVE the search param block entirely
    const res = await axios.get('/api/activity-logs', { params })
    logs.value = res.data.logs
  } catch (err) {
    console.error('Failed to fetch activity logs:', err)
    $q.notify({ type: 'negative', message: 'Failed to load activity logs', position: 'top' })
  } finally {
    loading.value = false
  }
}

const refreshAll = async () => {
  loading.value = true
  try {
    await fetchActionTypes()   // refresh dropdown options
    await fetchLogs()          // refresh table data
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchActionTypes()
  await fetchLogs()
})

const showDetails = ref(false)
const selectedLog = ref(null)

const openLogDetails = (evt, row) => {
  selectedLog.value = row
  showDetails.value = true
}

const formatDate = (val) => {
  return val ? dayjs(val).format('YYYY-MM-DD hh:mm A') : '—'
}
</script>

<style scoped>
.activity-log {
  align-items: center;
  display: flex;
  justify-content: center;
}

.activity-log :deep(.q-table__card) {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  width: 96%;
}

.activity-log :deep(.q-table__top) {
  padding: 12px 16px !important;
  background-color: #1f8f2e;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.activity-log :deep(thead tr) {
  background: #1f8f2e;
}

.activity-log :deep(thead th) {
  color: #ffffff;
  font-weight: 600;
  text-align: center;
}

.activity-log :deep(td) {
  vertical-align: middle;
}

.activity-log :deep(.q-table__bottom) {
  border-top: 1px solid #e0e0e0;
}

/* Search input styling */
.activity-log :deep(.q-input .q-field__control) {
  background-color: #ffffff !important;
  border-color: #cccccc !important;
}

.activity-log :deep(.q-input .q-field__native),
.activity-log :deep(.q-input input) {
  color: #222222 !important;
}

.activity-log :deep(.q-input .q-field__native::placeholder) {
  color: #888888 !important;
}

.activity-log :deep(.q-input .q-icon) {
  color: #1f8f2e !important;
}

/* Select filter styling */
.activity-log :deep(.q-select .q-field__control) {
  background-color: #ffffff !important;
}

.activity-log :deep(.q-select .q-field__native),
.activity-log :deep(.q-select .q-field__input) {
  color: #222222 !important;
}

.activity-log :deep(.q-select .q-field__append .q-icon) {
  color: #444444 !important;
}

/* Badge */
.action-badge {
  font-size: 11px;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

/* Changes cell */
.changes-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
  font-size: 13px;
  color: #333;
  cursor: default;
}

/* Target cell */
.target-text {
  font-size: 13px;
  font-weight: 500;
  color: #1f8f2e;
}

.details-card {
  width: 90vw;
  max-width: 750px;
  border-radius: 6px;
  overflow: hidden;
}

.details-header {
  background-color: #f39c12;
  color: white;
  padding: 16px 20px;
}

.details-body {
  background: #f4f4f4;
  padding: 20px;
}

.section-box {
  background: #eaeaea;
  padding: 20px;
  border-radius: 8px;
}

.field-block {
  margin-bottom: 10px;
}

.field-label {
  color: #1f8f2e;
  font-weight: 600;
  margin-bottom: 4px;
}

.changes-full {
  background: #ffffff;
  padding: 12px;
  border-radius: 4px;
  max-height: 220px;
  overflow-y: auto;
  white-space: pre-wrap;
  font-size: 13px;
}
</style>
