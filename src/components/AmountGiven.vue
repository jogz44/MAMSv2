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
          <q-table class="budget-table" :rows="rows" row-key="num" flat bordered dense :pagination="pagination"
            @update:pagination="updatePagination" :rows-per-page-options="[5, 10, 15, 23]">
            <template v-slot:header>
              <tr class="sticky-header">
                <th rowspan="2">#</th>
                <th rowspan="2">Barangay</th>
                <th colspan="2">Medicine</th>
                <th colspan="2">Laboratory</th>
                <th colspan="2">Hospital</th>
                <th rowspan="2">Total Patients</th>
                <th rowspan="2">Total Amount</th>
              </tr>
              <tr class="sticky-header second-row">
                <th>Patients</th>
                <th>Amount</th>
                <th>Patients</th>
                <th>Amount</th>
                <th>Patients</th>
                <th>Amount</th>
              </tr>
            </template>

            <template v-slot:body="props">
              <tr>
                <td>{{ props.row.num }}</td>
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
const pagination = ref({ rowsPerPage: 5, page: 1 })

// Format PHP currency
const formatPeso = (amount) =>
  amount == null
    ? '₱0.00'
    : new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)

const updatePagination = (newPagination) => {
  pagination.value = newPagination
}

onMounted(async () => {
  try {
    // Fetch barangay table
    const resBarangay = await axios.get('/api/barangay-records')
    rows.value = resBarangay.data.map((item, index) => ({
      num: index + 1,
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

    // Fetch all sectors from the database
    const resSectors = await axios.get('/api/sectors')
    const allSectors = resSectors.data // Array of { id, sector }

    // Fetch chart data
    const resChart = await axios.get('/api/amount-given')
    const chartData = resChart.data

    // Wait for DOM update
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
      [
        parseFloat(chartData.medicine) || 0,
        parseFloat(chartData.laboratory) || 0,
        parseFloat(chartData.hospital) || 0
      ],
      ['#4CAF50', '#2196F3', '#FF9800']
    )

    createDoughnut(
      perSexChart,
      ['Male', 'Female'],
      [
        parseFloat(chartData.perMale) || 0,
        parseFloat(chartData.perFemale) || 0
      ],
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

    // ✅ NEW: Per Sector Chart - Include ALL sectors even with 0 data
    const sectorPalette = ['#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#45B7D1', '#FFD93D', '#FF9800', '#9B59B6', '#E74C3C', '#3498DB']

    // Map all sectors to their data (0 if no data)
    const sectorData = allSectors.map(sector => {
      const dataKey = `sector_${sector.sector}` // Match the key from backend
      return {
        label: sector.sector,
        value: parseFloat(chartData[dataKey]) || 0
      }
    })

    // Sort by value (optional - shows highest first)
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
/* ═══════════════════════════════════════════════════════════
   ALL ORIGINAL STYLES — 100% UNTOUCHED
═══════════════════════════════════════════════════════════ */
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
  margin-bottom: 15px;
  letter-spacing: 0.3px;
  min-height: 25px;
  margin-bottom: 40px;
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
  height: 100px;            /* original — overridden on mobile below */
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

.budget-table {
  width: max-content;
  min-width: 100%;
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

.budget-table {
  width: 100%;
  table-layout: fixed;
}

.budget-table td {
  padding: 8px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-card {
  min-width: 600px;
}

/* ═══════════════════════════════════════════════════════════
   ONLY FIX: on mobile, .table-container height:100px was
   clipping the scroll wrapper entirely. Override it to auto
   so the scroll wrapper's own height:300px takes effect and
   the scrollbar appears correctly — same behaviour as desktop.
   Nothing else is touched.
═══════════════════════════════════════════════════════════ */
@media (max-width: 1023px) {
  /* Remove the 100px height that clips the table on mobile */
  .table-container {
    height: auto;
  }

  /* Ensure the card itself doesn't clip the table via overflow:hidden */
  .dashboard-card {
    overflow: visible;
    max-height: none;
  }
}
</style>