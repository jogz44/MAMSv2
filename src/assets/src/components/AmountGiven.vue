<template>
  <q-card class="dashboard-card">
    <div class="amount-title">DISTRIBUTION SUMMARY</div>

    <q-card-section class="text-center card-content">
      <div class="charts-container">
        <div class="chart-column">
          <div class="chart-wrapper chart-medium">
            <p>PER CATEGORY</p>
            <canvas ref="perCategoryChart" />
          </div>

          <div class="chart-wrapper chart-large">
            <p>PER AGE BRACKET</p>
            <canvas ref="perAgeBracketChart" />
          </div>
        </div>

        <div class="chart-column">
          <div class="chart-wrappers chart-small">
            <p>PER SEX</p>
            <canvas ref="perSexChart" />
          </div>

          <div class="chart-wrapper chart-mediums">
            <p>PER SECTOR</p>
            <canvas ref="perSectorChart" />
          </div>
        </div>
      </div>

      <div class="barangay-title">PER BARANGAY</div>

      <div class="table-container">
        <div class="table-scroll-wrapper">
          <q-table
            class="budget-table"
            :rows="sortedRows"
            row-key="barangay"
            flat bordered dense
            :rows-per-page-options="[5, 10, 15, 23]"
            v-model:pagination="pagination"
          >
            <template v-slot:header>
              <tr class="sticky-header">
                <th rowspan="2">#</th>
                <th rowspan="2" class="sortable-th" @click="setSort('barangay')">
                  Barangay <q-icon :name="getSortIcon('barangay')" class="sort-icon" />
                </th>
                <th colspan="2">Medicine</th>
                <th colspan="2">Laboratory</th>
                <th colspan="2">Hospital</th>
                <th rowspan="2" class="sortable-th" @click="setSort('totalPatients')">
                  Total Patients <q-icon :name="getSortIcon('totalPatients')" class="sort-icon" />
                </th>
                <th rowspan="2" class="sortable-th" @click="setSort('totalAmount')">
                  Total Amount <q-icon :name="getSortIcon('totalAmount')" class="sort-icon" />
                </th>
              </tr>
              <tr class="sticky-header second-row">
                <th class="sortable-th" @click="setSort('medicinePatients')">
                  Patients <q-icon :name="getSortIcon('medicinePatients')" class="sort-icon" />
                </th>
                <th class="sortable-th" @click="setSort('medicineAmount')">
                  Amount <q-icon :name="getSortIcon('medicineAmount')" class="sort-icon" />
                </th>
                <th class="sortable-th" @click="setSort('laboratoryPatients')">
                  Patients <q-icon :name="getSortIcon('laboratoryPatients')" class="sort-icon" />
                </th>
                <th class="sortable-th" @click="setSort('laboratoryAmount')">
                  Amount <q-icon :name="getSortIcon('laboratoryAmount')" class="sort-icon" />
                </th>
                <th class="sortable-th" @click="setSort('hospitalPatients')">
                  Patients <q-icon :name="getSortIcon('hospitalPatients')" class="sort-icon" />
                </th>
                <th class="sortable-th" @click="setSort('hospitalAmount')">
                  Amount <q-icon :name="getSortIcon('hospitalAmount')" class="sort-icon" />
                </th>
              </tr>
            </template>

            <!-- FIX 1 & 2: Restored body slot with correct sequential row numbering -->
            <template v-slot:body="props">
              <tr>
                <td>{{ (pagination.page - 1) * pagination.rowsPerPage + props.rowIndex + 1 }}</td>
                <td>{{ props.row.barangay }}</td>
                <td align="right">{{ props.row.medicinePatients }}</td>
                <td align="right">{{ formatPeso(props.row.medicineAmount) }}</td>
                <td align="right">{{ props.row.laboratoryPatients }}</td>
                <td align="right">{{ formatPeso(props.row.laboratoryAmount) }}</td>
                <td align="right">{{ props.row.hospitalPatients }}</td>
                <td align="right">{{ formatPeso(props.row.hospitalAmount) }}</td>
                <td align="right">{{ props.row.totalPatients }}</td>
                <td align="right">{{ formatPeso(props.row.totalAmount) }}</td>
              </tr>
            </template>
          </q-table>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js/auto'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { api } from 'src/boot/axios'

const axios = api

Chart.register(ChartDataLabels, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const perCategoryChart = ref(null)
const perSexChart = ref(null)
const perAgeBracketChart = ref(null)
const perSectorChart = ref(null)
const rows = ref([])

// FIX 3: Removed rowsNumber — caused pagination to break in non-server mode
const pagination = ref({ rowsPerPage: 5, page: 1 })

// ── Sorting ───────────────────────────────────────────────────────────────────
const sortKey = ref('totalAmount')
const sortOrder = ref('desc')

const setSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
  pagination.value.page = 1
}

const getSortIcon = (key) => {
  if (sortKey.value !== key) return 'unfold_more'
  return sortOrder.value === 'asc' ? 'arrow_upward' : 'arrow_downward'
}

const sortedRows = computed(() => {
  const data = [...rows.value]
  data.sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]
    const cmp = typeof aVal === 'number'
      ? aVal - bVal
      : String(aVal).localeCompare(String(bVal))
    return sortOrder.value === 'asc' ? cmp : -cmp
  })
  return data
})

// ── Formatting ────────────────────────────────────────────────────────────────
const formatPeso = (amount) =>
  amount == null
    ? '₱0.00'
    : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)

// ── Data fetching & charts ────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const resBarangay = await axios.get('/api/barangay-records')
    rows.value = resBarangay.data.map((item) => ({
      barangay: item.barangay,
      medicinePatients: item.medicinePatients,
      medicineAmount: item.medicineAmount,
      laboratoryPatients: item.laboratoryPatients,
      laboratoryAmount: item.laboratoryAmount,
      hospitalPatients: item.hospitalPatients,
      hospitalAmount: item.hospitalAmount,
      totalPatients: item.totalPatients,
      totalAmount: item.totalAmount
    }))
    // NOTE: rowsNumber intentionally NOT set here — q-table handles pagination
    // from sortedRows.length automatically in non-server mode

    const resSectors = await axios.get('/api/sectors')
    const allSectors = resSectors.data

    const resChart = await axios.get('/api/amount-given')
    const chartData = resChart.data

    await nextTick()

    const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

    const createDoughnut = (refEl, labels, data, colors) => {
      new Chart(refEl.value, {
        type: 'doughnut',
        data: { labels, datasets: [{ label: 'Amount Given', data, backgroundColor: colors }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${pesoFormatter.format(ctx.raw)}` } },
            legend: { display: true, position: 'top' },
            datalabels: {
              color: '#000',
              formatter: (v, c) => {
                const total = c.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
                if (total === 0) return '0%'
                return ((v / total) * 100).toFixed(1) + '%'
              },
              font: { size: 12 }
            }
          }
        },
        plugins: [ChartDataLabels]
      })
    }

    createDoughnut(
      perCategoryChart,
      ['Medicine', 'Laboratory', 'Hospital'],
      [parseFloat(chartData.medicine) || 0, parseFloat(chartData.laboratory) || 0, parseFloat(chartData.hospital) || 0],
      ['#4CAF50', '#2196F3', '#FF9800']
    )

    createDoughnut(
      perSexChart,
      ['Male', 'Female'],
      [parseFloat(chartData.perMale) || 0, parseFloat(chartData.perFemale) || 0],
      ['#42A5F5', '#EC407A']
    )

    createDoughnut(
      perAgeBracketChart,
      ['0-1', '2-5', '6-12', '13-19', '20-39', '40-64', '65+'],
      [
        parseFloat(chartData['0to1']) || 0,
        parseFloat(chartData['2to5']) || 0,
        parseFloat(chartData['6to12']) || 0,
        parseFloat(chartData['13to19']) || 0,
        parseFloat(chartData['20to39']) || 0,
        parseFloat(chartData['40to64']) || 0,
        parseFloat(chartData['65AndAbove']) || 0
      ],
      ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCF7F', '#4ECDC4', '#45B7D1', '#9B59B6']
    )

    const sectorPalette = ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#45B7D1', '#FFD93D', '#FF9800', '#9B59B6', '#E74C3C', '#3498DB']
    const sectorData = allSectors.map(sector => ({
      label: sector.sector,
      value: parseFloat(chartData[`sector_${sector.sector}`]) || 0
    }))
    sectorData.sort((a, b) => b.value - a.value)

    createDoughnut(
      perSectorChart,
      sectorData.map(s => s.label),
      sectorData.map(s => s.value),
      sectorPalette.slice(0, sectorData.length)
    )
  } catch (err) {
    console.error('Error loading data:', err)
  }
})
</script>

<style scoped>
.dashboard-card {
  width: 100%;
  padding: 0;
  background: #fff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.33);
  font-family: Arial, sans-serif;
  box-sizing: border-box;
  margin: 10px 0;
  overflow: hidden;
  margin-bottom: -2%;
  max-height: 1580px;
  min-width: 600px;
}

.amount-title {
  font-weight: 900;
  font-size: 22px;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  padding: 12px 20px;
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.card-content {
  padding: 15px;
}

.barangay-title {
  font-weight: 900;
  font-size: 22px;
  color: #2e7d32;
  margin-top: 50px;
  margin-bottom: 30px;
  text-align: center;
}

.charts-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 40px;
  padding: 0 10px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.chart-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  max-width: 400px;
  min-width: 280px;
}

.chart-wrapper {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.chart-wrappers {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.chart-wrappers p {
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 40px;
  letter-spacing: 0.3px;
  min-height: 25px;
  margin-top: -2px;
}

.chart-wrapper p {
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 15px;
  letter-spacing: 0.3px;
  min-height: 25px;
}

.chart-small {
  flex: 1 1 200px;
  height: 190px !important;
  max-width: 190px;
  min-width: 200px;
  margin-left: 100px;
}

.chart-medium {
  flex: 1 1 200px;
  height: 220px !important;
  max-width: 310px;
  min-width: 200px;
}

.chart-mediums {
  flex: 1 1 200px;
  height: 250px !important;
  max-width: 310px;
  min-width: 250px;
  margin-top: 70px;
  margin-left: 50px;
}

.chart-large {
  flex: 1 1 200px;
  height: 270px !important;
  max-width: 310px;
  min-width: 250px;
  margin-top: 50px;
}

.chart-small canvas,
.chart-medium canvas,
.chart-large canvas {
  width: 100% !important;
  height: 200px !important;
  max-width: 280px;
}

.table-container {
  width: 100%;
  border-radius: 8px;
  box-sizing: border-box;
  height: 100px;
}

.table-scroll-wrapper {
  width: 100%;
  height: 300px;
  max-height: 60vh;
  min-height: 260px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.table-scroll-wrapper .q-table__container {
  height: 100% !important;
  max-height: none !important;
}

/* FIX 3: Changed from width: max-content to width: 100% to prevent horizontal scroll */
.budget-table {
  width: 100%;
  table-layout: fixed;
}

.sticky-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.sticky-header.second-row {
  top: 40px;
}

.sticky-header th {
  background: #1f8f2e;
  color: white;
  font-weight: 700;
  border-bottom: 1px solid #1b5e20;
  text-align: center;
  padding: 10px 8px;
  font-size: 13px;
  white-space: nowrap;
}

.budget-table td {
  padding: 8px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sortable-th {
  cursor: pointer;
  user-select: none;
}

.sortable-th:hover {
  background: #176e22 !important;
}

.sort-icon {
  font-size: 12px;
  vertical-align: middle;
  margin-left: 3px;
  opacity: 0.85;
}

@media (max-width: 1023px) {
  .table-container {
    height: auto;
  }

  .dashboard-card {
    overflow: visible;
    max-height: none;
  }
}
</style>