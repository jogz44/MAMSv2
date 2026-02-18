<template>
  <div class="activity-log q-mb-lg">
    <q-table
      :rows="filteredLogs"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      flat
      bordered
    >
      <!-- TOP BAR -->
      <template #top>
        <div class="row items-center full-width q-gutter-sm">
          <div class="text-h4 text-weight-bold text-white">
            Activity Log
          </div>
          <q-space />

          <!-- SEARCH -->
          <q-input
            v-model="searchText"
            dense
            outlined
            placeholder="Search..."
            style="min-width: 200px"
            input-style="color: #ffffff;"
          >
            <template #prepend>
              <q-icon name="search" color="white" />
            </template>
          </q-input>

          <!-- ACTION FILTER -->
          <q-select
            v-model="filterAction"
            :options="actionFilterOptions"
            dense
            outlined
            dark
            emit-value
            map-options
            style="min-width: 150px"
          />

          <!-- REFRESH -->
          <q-btn
            icon="refresh"
            label="Refresh"
            flat
            dense
            color="white"
            @click="fetchLogs"
          />
        </div>
      </template>

      <!-- ACTION BADGE -->
      <template #body-cell-action="props">
        <q-td align="center">
          <q-badge
            :color="getActionColor(props.row.action)"
            :label="props.row.action"
            class="text-weight-bold q-pa-xs"
          />
        </q-td>
      </template>

      <!-- CHANGES COLUMN -->
      <template #body-cell-changes="props">
        <q-td align="left">
          <span class="changes-text">{{ props.row.changes }}</span>
          <q-tooltip
            v-if="props.row.changes && props.row.changes.length > 60"
            max-width="420px"
            class="text-body2 q-pa-sm"
          >
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const axios = api
const $q = useQuasar()

const logs = ref([])
const loading = ref(false)
const searchText = ref('')
const filterAction = ref('ALL')

const pagination = ref({
  rowsPerPage: 10,
  sortBy: 'created_at',
  descending: true
})

const actionFilterOptions = [
  { label: 'All Actions', value: 'ALL' },
  { label: 'Updated', value: 'UPDATED' },
  { label: 'Created', value: 'CREATED' },
  { label: 'Deleted', value: 'DELETED' },
]

const columns = [
  {
    name: 'created_at',
    label: 'DATE & TIME',
    field: 'created_at',
    align: 'center',
    sortable: true,
    style: 'min-width: 160px'
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
    style: 'min-width: 100px'
  },
  {
    name: 'target_uuid',
    label: 'RECORD UUID',
    field: 'target_uuid',
    align: 'center',
    style: 'min-width: 180px'
  },
  {
    name: 'changes',
    label: 'CHANGES MADE',
    field: 'changes',
    align: 'left',
    style: 'min-width: 250px'
  },
]

const filteredLogs = computed(() => {
  let result = logs.value

  if (filterAction.value !== 'ALL') {
    result = result.filter(log => log.action === filterAction.value)
  }

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    result = result.filter(log =>
      (log.performed_by || '').toLowerCase().includes(search) ||
      (log.target_uuid || '').toLowerCase().includes(search) ||
      (log.changes || '').toLowerCase().includes(search) ||
      (log.action || '').toLowerCase().includes(search)
    )
  }

  return result
})

const getActionColor = (action) => {
  const map = {
    UPDATED: 'orange-8',
    CREATED: 'green-7',
    DELETED: 'red-7',
  }
  return map[action] || 'grey-6'
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/activity-logs')
    logs.value = res.data.logs
  } catch (err) {
    console.error('Failed to fetch activity logs:', err)
    $q.notify({ type: 'negative', message: 'Failed to load activity logs', position: 'top' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchLogs)
</script>

<style scoped>
.activity-log :deep(.q-input .q-field__control) {
  background-color: white !important;
  border-color: #444444 !important;
}

.activity-log :deep(.q-input .q-field__native),
.activity-log :deep(.q-input input) {
  color: #242121 !important;
}

.activity-log :deep(.q-input .q-field__native::placeholder) {
  color: #272424 !important;
}

.activity-log :deep(.q-input .q-icon) {
  color: #6b886d !important;
}

.activity-log :deep(.q-input .q-field__append .q-icon) {
  color: #aaaaaa !important;
}
.activity-log{
  align-items: center;
  display: flex;
  justify-content: center;
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

.activity-log :deep(.q-table__top) {
  padding: 12px 16px !important;
  background-color: #1f8f2e;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.activity-log :deep(.q-table__card) {
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
  width: 95%;
}

.activity-log :deep(.q-table__bottom) {
  border-top: 1px solid #e0e0e0;
}

.changes-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 320px;
  font-size: 13px;
  color: #ccc;
}
.activity-log :deep(.q-select .q-field__control) {
  background-color: #ffffff !important;
}

.activity-log :deep(.q-select .q-field__native),
.activity-log :deep(.q-select .q-field__input) {
  color: #000000 !important;
}

.activity-log :deep(.q-select .q-field__append .q-icon) {
  color: #000000 !important;
}
</style>