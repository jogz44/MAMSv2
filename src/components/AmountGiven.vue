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

/* Charts Container */
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

/* Chart Sizes - Consistent across all charts */
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

/* Table */
.table-container {
  width: 100%;
  border-radius: 8px;
}

/* Add scrollable wrapper with fixed height */
.table-scroll-wrapper {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
}

.q-table__container {
  max-height: 490px;
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

/* Extra Small Mobile (320px to 480px) */
@media (max-width: 480px) {
  .dashboard-card {
    margin: 5px 0;
  }

  .amount-title {
    font-size: 16px;
    padding: 8px 10px;
  }

  .card-content {
    padding: 8px;
  }

  .charts-container {
    gap: 15px;
    margin-top: 15px;
    margin-bottom: 20px;
    padding: 0 5px;
    flex-direction: column;
  }

  .chart-column {
    gap: 15px;
    max-width: 100%;
    min-width: 0;
  }

  .chart-wrapper {
    max-width: 100%;
    min-width: 0;
  }

  .chart-wrapper p {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .chart-small canvas,
  .chart-medium canvas,
  .chart-large canvas {
    height: 180px !important;
    max-width: 100%;
  }

  .barangay-title {
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 15px;
  }

  .table-scroll-wrapper {
    max-height: 400px;
  }

  .sticky-header th {
    padding: 6px 3px;
    font-size: 9px;
  }

  .sticky-header.second-row {
    top: 35px;
  }

  .budget-table td {
    padding: 6px 3px;
    font-size: 9px;
  }
}

/* Small Mobile (481px to 599px) */
@media (min-width: 481px) and (max-width: 599px) {
  .amount-title {
    font-size: 17px;
    padding: 9px 12px;
  }

  .card-content {
    padding: 10px;
  }

  .charts-container {
    gap: 18px;
    margin-top: 20px;
    margin-bottom: 25px;
    flex-direction: column;
  }

  .chart-column {
    gap: 18px;
    max-width: 100%;
  }

  .chart-wrapper {
    max-width: 100%;
  }

  .chart-wrapper p {
    font-size: 15px;
    margin-bottom: 10px;
  }

  .chart-small canvas,
  .chart-medium canvas,
  .chart-large canvas {
    height: 200px !important;
  }

  .barangay-title {
    font-size: 17px;
    margin-top: 25px;
    margin-bottom: 15px;
  }

  .table-scroll-wrapper {
    max-height: 450px;
  }

  .sticky-header th {
    padding: 7px 4px;
    font-size: 10px;
  }

  .sticky-header.second-row {
    top: 37px;
  }

  .budget-table td {
    padding: 7px 4px;
    font-size: 10px;
  }
}

/* Tablet Portrait (600px to 767px) */
@media (min-width: 600px) and (max-width: 767px) {
  .amount-title {
    font-size: 18px;
    padding: 10px 15px;
  }

  .card-content {
    padding: 12px;
  }

  .charts-container {
    gap: 20px;
    margin-top: 25px;
    margin-bottom: 30px;
  }

  .chart-column {
    gap: 18px;
    max-width: 350px;
  }

  .chart-wrapper p {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .chart-small canvas,
  .chart-medium canvas,
  .chart-large canvas {
    height: 220px !important;
  }

  .barangay-title {
    font-size: 18px;
    margin-top: 30px;
    margin-bottom: 18px;
  }

  .table-scroll-wrapper {
    max-height: 500px;
  }

  .sticky-header th {
    padding: 8px 5px;
    font-size: 11px;
  }

  .sticky-header.second-row {
    top: 38px;
  }

  .budget-table td {
    padding: 5px 5px;
    font-size: 11px;
  }
}

/* Tablet Landscape (768px to 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .amount-title {
    font-size: 19px;
    padding: 11px 16px;
  }

  .card-content {
    padding: 13px;
  }

  .charts-container {
    gap: 25px;
    margin-top: 28px;
    margin-bottom: 35px;
  }

  .chart-column {
    gap: 20px;
    max-width: 380px;
  }

  .chart-wrapper p {
    font-size: 17px;
    margin-bottom: 13px;
  }

  .chart-small canvas,
  .chart-medium canvas,
  .chart-large canvas {
    height: 230px !important;
  }

  .barangay-title {
    font-size: 19px;
    margin-top: 35px;
    margin-bottom: 18px;
  }

  .table-scroll-wrapper {
    max-height: 500px;
  }

  .sticky-header th {
    padding: 9px 6px;
    font-size: 11px;
  }

  .sticky-header.second-row {
    top: 39px;
  }

  .budget-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
}

/* Small Desktop (1024px to 1279px) */
@media (min-width: 1024px) and (max-width: 1279px) {
  .amount-title {
    font-size: 20px;
    padding: 11px 18px;
  }

  .card-content {
    padding: 14px;
  }

  .charts-container {
    gap: 25px;
    margin-top: 28px;
    margin-bottom: 38px;
  }

  .chart-column {
    gap: 20px;
    max-width: 400px;
  }

  .chart-wrapper p {
    font-size: 18px;
    margin-bottom: 14px;
  }

  .chart-small canvas,
  .chart-medium canvas,
  .chart-large canvas {
    height: 240px !important;
  }

  .barangay-title {
    font-size: 20px;
    margin-top: 38px;
    margin-bottom: 19px;
  }

  .table-scroll-wrapper {
    max-height: 500px;
  }

  .sticky-header th {
    padding: 9px 7px;
    font-size: 12px;
  }

  .sticky-header.second-row {
    top: 39px;
  }

  .budget-table td {
    padding: 8px 7px;
    font-size: 12px;
  }
}

/* Medium Desktop (1280px to 1599px) */
@media (min-width: 1280px) and (max-width: 1599px) {
  .amount-title {
    font-size: 21px;
    padding: 12px 19px;
  }

  .card-content {
    padding: 15px;
  }

  .charts-container {
    gap: 30px;
    margin-top: 30px;
    margin-bottom: 40px;
  }

  .chart-column {
    gap: 20px;
    max-width: 420px;
  }

  .chart-wrapper p {
    font-size: 19px;
    margin-bottom: 14px;
  }

  .chart-small canvas,
  .chart-medium canvas,
  .chart-large canvas {
    height: 250px !important;
  }

  .barangay-title {
    font-size: 21px;
    margin-top: 40px;
    margin-bottom: 20px;
  }

  .table-scroll-wrapper {
    max-height: 500px;
  }

  .sticky-header th {
    padding: 10px 7px;
    font-size: 12px;
  }

  .sticky-header.second-row {
    top: 40px;
  }

  .budget-table td {
    padding: 8px 7px;
    font-size: 12px;
  }
}

/* Large Desktop (1600px to 1919px) */
@media (min-width: 1600px) and (max-width: 1919px) {
  .amount-title {
    font-size: 22px;
    padding: 12px 20px;
  }

  .card-content {
    padding: 15px;
  }

  .charts-container {
    gap: 30px;
    margin-top: 30px;
    margin-bottom: 40px;
  }

  .chart-column {
    gap: 20px;
    max-width: 450px;
  }

  .chart-wrapper p {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .chart-small canvas,
  .chart-medium canvas,
  .chart-large canvas {
    height: 250px !important;
  }

  .barangay-title {
    font-size: 22px;
    margin-top: 40px;
    margin-bottom: 20px;
  }

  .table-scroll-wrapper {
    max-height: 500px;
  }

  .sticky-header th {
    padding: 10px 8px;
    font-size: 13px;
  }

  .sticky-header.second-row {
    top: 40px;
  }

  .budget-table td {
    padding: 8px;
    font-size: 13px;
  }
}

/* Extra Large Desktop (1920px and up) */
@media (min-width: 1920px) {
  .amount-title {
    font-size: 24px;
    padding: 15px 20px;
  }

  .card-content {
    padding: 20px;
  }

  .charts-container {
    gap: 35px;
    margin-top: 35px;
    margin-bottom: 45px;
  }

  .chart-column {
    gap: 25px;
    max-width: 500px;
  }

  .chart-wrapper p {
    font-size: 22px;
    margin-bottom: 18px;
  }

  .chart-small canvas,
  .chart-medium canvas,
  .chart-large canvas {
    height: 280px !important;
  }

  .barangay-title {
    font-size: 24px;
    margin-top: 45px;
    margin-bottom: 22px;
  }

  .table-scroll-wrapper {
    max-height: 600px;
  }

  .sticky-header th {
    padding: 12px 10px;
    font-size: 14px;
  }

  .sticky-header.second-row {
    top: 44px;
  }

  .budget-table td {
    padding: 10px;
    font-size: 14px;
  }
}
</style>
