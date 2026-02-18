<template>
  <div class="dashboard-container">

    <!-- CATEGORY CARDS -->
    <div class="dashboard-row">
      <div
        class="dashboard-card enhanced-card"
        v-for="item in categories"
        :key="item.name"
      >

        <!-- HEADER -->
        <div class="card-header enhanced-header">
          <q-icon :name="item.icon" size="22px" />
          <span>{{ item.name }}</span>
        </div>

        <!-- BODY -->
        <div class="card-body">

          <div class="card-row">
            <div class="label">BUDGET</div>
            <div class="value highlight-value">
              {{ formatPeso(item.totalBudget) }}
            </div>
          </div>
          <div class="divider"></div>

          <div class="card-row">
            <div class="label">NO. OF PATIENTS</div>
            <div class="value patient-value">
              {{ item.totalPatients }}
            </div>
          </div>
          <div class="divider"></div>

          <div class="card-row">
            <div class="label">AMOUNT RELEASED</div>
            <div class="value highlight-value">
              {{ formatPeso(item.totalReleased) }}
            </div>
          </div>
          <div class="divider"></div>

          <div class="remaining" :class="{ negative: item.remaining < 0 }">
            <div class="label remaining-label">REMAINING BALANCE</div>
            <div class="value remaining-value">
              {{ formatPeso(item.remaining) }}
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- TOTAL PATIENTS & AMOUNT CARD -->
    <q-card class="totals-card">
      <div class="totals-container">
        <div class="total-left">
          <!-- HEADER -->
          <div class="totals-header">TOTAL PATIENTS CATERED</div>
          <div class="total-item">
            <div class="amount-titles">{{ totalPatients }}</div>
          </div>
        </div>

        <div class="vertical-divider"></div>

        <div class="total-right">
          <!-- HEADER -->
          <div class="totals-header">TOTAL AMOUNT RELEASED</div>
          <div class="total-item">
            <div class="amount-titles2">{{ formatPeso(totalAmount) }}</div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- MONTHLY CHART -->
    <q-card class="chart-card">
      <!-- HEADER -->
      <div class="chart-header">MONTHLY CATERED PATIENTS</div>

      <q-card-section class="text-center">
        <div class="chart-container">
          <canvas ref="monthlyCateredPatients"></canvas>
        </div>
      </q-card-section>
    </q-card>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

const axios = api
import { Chart } from 'chart.js/auto'

const categories = ref([
  { name: 'MEDICINE', icon: 'medication', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 },
  { name: 'LABORATORY', icon: 'science', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 },
  { name: 'HOSPITAL', icon: 'local_hospital', totalBudget: 0, totalPatients: 0, totalReleased: 0, remaining: 0 }
])

const totalPatients = ref(0)
const totalAmount = ref(0)
const monthlyCateredPatients = ref(null)

const formatPeso = (amount) => {
  if (amount == null) return '₱0.00'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount)
}

onMounted(async () => {
  try {

    const categoryRes = await axios.get('/api/category-cards')
    categories.value[0] = { ...categories.value[0], ...categoryRes.data.medicineData }
    categories.value[1] = { ...categories.value[1], ...categoryRes.data.laboratoryData }
    categories.value[2] = { ...categories.value[2], ...categoryRes.data.hospitalData }

    const totalsRes = await axios.get('/api/total-patients-and-amount')
    totalPatients.value = totalsRes.data.totalPatients
    totalAmount.value = totalsRes.data.totalAmount

    const monthlyRes = await axios.get('/api/monthly-patients')

    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    const dataMedicine = months.map(m => monthlyRes.data.monthlyCounts.Medicine[m] ?? 0)
    const dataLaboratory = months.map(m => monthlyRes.data.monthlyCounts.Laboratory[m] ?? 0)
    const dataHospital = months.map(m => monthlyRes.data.monthlyCounts.Hospital[m] ?? 0)

    new Chart(monthlyCateredPatients.value, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [
          { label: 'Medicine', data: dataMedicine, borderColor: '#0318fc', borderWidth: 2 },
          { label: 'Laboratory', data: dataLaboratory, borderColor: '#fbff00', borderWidth: 2 },
          { label: 'Hospital', data: dataHospital, borderColor: '#ff0000', borderWidth: 2 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })

  } catch (err) {
    console.error(err)
  }
})
</script>

<style scoped>

/* CONTAINER */
.dashboard-container {
  width: 70%;
  max-width: 90%;
  padding: 10px;
  box-sizing: border-box;
  margin: 0 auto 1%;
}

/* CATEGORY GRID */
.dashboard-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-bottom: 24px;
}

/* CATEGORY CARD */
.enhanced-card {
  border-radius: 14px;
  border: 2px solid grey;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  text-align: center;
  overflow: hidden;
  padding: 0;
  transition: transform 0.2s ease;
}

/* HEADER */
.enhanced-header {
  padding: 10px;
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

/* BODY */
.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ROW */
.card-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* LABEL */
.label {
  font-size: 13px;
  font-weight: 700;
  background-color: green;
  padding: 4px;
  border-radius: 4px;
  color: white;
  width: 100%;
  max-width: 200px;
  text-align: center;
  box-sizing: border-box;
}

/* VALUE */
.value {
  font-size: 20px;
  font-weight: 600;
  color: #23424b;
}

/* PATIENT VALUE */
.patient-value {
  font-size: 20px;
  font-weight: 600;
}

/* DIVIDER */
.divider {
  border-top: 2px solid #ddd;
  margin: 4px 0;
}

/* REMAINING */
.remaining {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.remaining-label {
  color: #000000;
  font-weight: 700;
  background-color: transparent;
  padding: 0;
}

.remaining-value {
  font-size: 20px;
  font-weight: 900;
  color: #2e7d32;
}

.negative .remaining-value {
  color: #db001d;
}

/* TOTAL CARD */
.totals-card {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  margin-bottom: 24px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
}

.totals-container {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

.total-left,
.total-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.totals-header {
  padding: 16px;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  text-align: center;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  flex: 1;
}

.amount-titles,
.amount-titles2 {
  font-weight: 700;
  font-size: 30px;
  color: #2e7d32;
}

.vertical-divider {
  width: 2px;
  background-color: #000;
  align-self: stretch;
}

/* CHART CARD */
.chart-card {
  border-radius: 14px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  box-sizing: border-box;
  overflow: hidden;
  padding: 0;
  margin-bottom: -8.5%;
  margin-top: 2%;
}

.chart-header {
  padding: 16px;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  text-align: center;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.chart-container {
  height: 280px;
  position: relative;
  padding: 16px;
}

/* Extra Small Mobile (320px to 480px) */
@media (max-width: 480px) {
  .dashboard-container {
    padding: 8px;
    width: 95%;
  }

  .dashboard-row {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .enhanced-card {
    border-radius: 10px;
  }

  .enhanced-header {
    font-size: 13px;
    padding: 8px;
    gap: 6px;
  }

  .card-body {
    padding: 10px;
    gap: 8px;
  }

  .label {
    font-size: 10px;
    max-width: 160px;
    padding: 3px;
  }

  .value,
  .patient-value {
    font-size: 14px;
  }

  .remaining-value {
    font-size: 20px;
  }

  .divider {
    margin: 2px 0;
  }

  .totals-card {
    border-radius: 10px;
    margin-bottom: 12px;
  }

  .totals-container {
    flex-direction: column;
  }

  .vertical-divider {
    display: none;
  }

  .totals-header {
    font-size: 12px;
    padding: 8px;
  }

  .total-item {
    padding: 12px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 18px;
  }

  .chart-card {
    border-radius: 10px;
    margin-bottom: 0;
    margin-top: 1%;
  }

  .chart-header {
    font-size: 12px;
    padding: 8px;
  }

  .chart-container {
    height: 180px;
    padding: 10px;
  }
}

/* Small Mobile (481px to 599px) */
@media (min-width: 481px) and (max-width: 599px) {
  .dashboard-container {
    padding: 9px;
    width: 95%;
  }

  .dashboard-row {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }

  .enhanced-card {
    border-radius: 11px;
  }

  .enhanced-header {
    font-size: 14px;
    padding: 9px;
    gap: 7px;
  }

  .card-body {
    padding: 12px;
    gap: 9px;
  }

  .label {
    font-size: 11px;
    max-width: 170px;
  }

  .value,
  .patient-value {
    font-size: 16px;
  }

  .remaining-value {
    font-size: 14px;
  }

  .totals-card {
    border-radius: 11px;
    margin-bottom: 14px;
  }

  .totals-container {
    flex-direction: column;
  }

  .vertical-divider {
    display: none;
  }

  .totals-header {
    font-size: 13px;
    padding: 9px;
  }

  .total-item {
    padding: 14px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 20px;
  }

  .chart-card {
    border-radius: 11px;
  }

  .chart-header {
    font-size: 13px;
    padding: 9px;
  }

  .chart-container {
    height: 200px;
    padding: 12px;
  }
}

/* Tablet Portrait (600px to 767px) */
@media (min-width: 600px) and (max-width: 767px) {
  .dashboard-container {
    padding: 10px;
    width: 90%;
  }

  .dashboard-row {
    grid-template-columns: 1fr;
    gap: 14px;
    margin-bottom: 16px;
  }

  .enhanced-card {
    border-radius: 12px;
  }

  .enhanced-header {
    font-size: 15px;
    padding: 9px;
    gap: 8px;
  }

  .card-body {
    padding: 13px;
    gap: 10px;
  }

  .label {
    font-size: 11px;
    max-width: 180px;
  }

  .value,
  .patient-value {
    font-size: 17px;
  }

  .remaining-value {
    font-size: 15px;
  }

  .totals-card {
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .totals-header {
    font-size: 14px;
    padding: 12px;
  }

  .total-item {
    padding: 16px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 24px;
  }

  .chart-card {
    border-radius: 12px;
  }

  .chart-header {
    font-size: 14px;
    padding: 12px;
  }

  .chart-container {
    height: 220px;
    padding: 13px;
  }
}

/* Tablet Landscape (768px to 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard-container {
    padding: 10px;
    width: 85%;
  }

  .dashboard-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 18px;
  }

  .enhanced-card {
    border-radius: 13px;
  }

  .enhanced-header {
    font-size: 16px;
    padding: 9px;
    gap: 8px;
  }

  .card-body {
    padding: 14px;
    gap: 10px;
  }

  .label {
    font-size: 11px;
    max-width: 185px;
  }

  .value,
  .patient-value {
    font-size: 18px;
  }

  .remaining-value {
    font-size: 16px;
  }

  .totals-card {
    border-radius: 13px;
    margin-bottom: 18px;
  }

  .totals-header {
    font-size: 14px;
    padding: 13px;
  }

  .total-item {
    padding: 17px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 26px;
  }

  .chart-card {
    border-radius: 13px;
  }

  .chart-header {
    font-size: 14px;
    padding: 13px;
  }

  .chart-container {
    height: 240px;
    padding: 14px;
  }
}

/* Small Desktop (1024px to 1279px) */
@media (min-width: 1024px) and (max-width: 1279px) {
  .dashboard-container {
    padding: 10px;
    width: 80%;
  }

  .dashboard-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-bottom: 20px;
  }

  .enhanced-card {
    border-radius: 13px;
  }

  .enhanced-header {
    font-size: 17px;
    padding: 10px;
    gap: 9px;
  }

  .card-body {
    padding: 15px;
    gap: 11px;
  }

  .label {
    font-size: 12px;
    max-width: 190px;
  }

  .value,
  .patient-value {
    font-size: 19px;
  }

  .remaining-value {
    font-size: 17px;
  }

  .totals-card {
    border-radius: 13px;
    margin-bottom: 20px;
  }

  .totals-header {
    font-size: 15px;
    padding: 14px;
  }

  .total-item {
    padding: 18px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 28px;
  }

  .chart-card {
    border-radius: 13px;
  }

  .chart-header {
    font-size: 15px;
    padding: 14px;
  }

  .chart-container {
    height: 260px;
    padding: 15px;
  }
}

/* Medium Desktop (1280px to 1599px) */
@media (min-width: 1280px) and (max-width: 1599px) {
  .dashboard-container {
    padding: 10px;
    width: 75%;
  }

  .dashboard-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 22px;
  }

  .enhanced-card {
    border-radius: 14px;
  }

  .enhanced-header {
    font-size: 18px;
    padding: 10px;
    gap: 10px;
  }

  .card-body {
    padding: 16px;
    gap: 12px;
  }

  .label {
    font-size: 13px;
    max-width: 200px;
  }

  .value,
  .patient-value {
    font-size: 20px;
  }

  .remaining-value {
    font-size: 18px;
  }

  .totals-card {
    border-radius: 14px;
    margin-bottom: 22px;
  }

  .totals-header {
    font-size: 16px;
    padding: 15px;
  }

  .total-item {
    padding: 19px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 30px;
  }

  .chart-card {
    border-radius: 14px;
  }

  .chart-header {
    font-size: 16px;
    padding: 15px;
  }

  .chart-container {
    height: 270px;
    padding: 16px;
  }
}

/* Large Desktop (1600px to 1919px) */
@media (min-width: 1600px) and (max-width: 1919px) {
  .dashboard-container {
    padding: 10px;
    width: 70%;
  }

  .dashboard-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
    margin-bottom: 24px;
  }

  .enhanced-card {
    border-radius: 14px;
  }

  .enhanced-header {
    font-size: 18px;
    padding: 10px;
    gap: 10px;
  }

  .card-body {
    padding: 16px;
    gap: 12px;
  }

  .label {
    font-size: 13px;
    max-width: 200px;
  }

  .value,
  .patient-value {
    font-size: 20px;
  }

  .remaining-value {
    font-size: 18px;
  }

  .totals-card {
    border-radius: 14px;
    margin-bottom: 24px;
  }

  .totals-header {
    font-size: 16px;
    padding: 16px;
  }

  .total-item {
    padding: 20px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 30px;
  }

  .chart-card {
    border-radius: 14px;
  }

  .chart-header {
    font-size: 16px;
    padding: 16px;
  }

  .chart-container {
    height: 280px;
    padding: 16px;
  }
}

/* Extra Large Desktop (1920px and up) */
@media (min-width: 1920px) {
  .dashboard-container {
    padding: 12px;
    width: 70%;
  }

  .dashboard-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
    margin-bottom: 26px;
  }

  .enhanced-card {
    border-radius: 15px;
  }

  .enhanced-header {
    font-size: 19px;
    padding: 11px;
    gap: 11px;
  }

  .card-body {
    padding: 17px;
    gap: 13px;
  }

  .label {
    font-size: 14px;
    max-width: 210px;
  }

  .value,
  .patient-value {
    font-size: 22px;
  }

  .remaining-value {
    font-size: 20px;
  }

  .totals-card {
    border-radius: 15px;
    margin-bottom: 26px;
  }

  .totals-header {
    font-size: 17px;
    padding: 17px;
  }

  .total-item {
    padding: 22px;
  }

  .amount-titles,
  .amount-titles2 {
    font-size: 34px;
  }

  .chart-card {
    border-radius: 15px;
  }

  .chart-header {
    font-size: 17px;
    padding: 17px;
  }

  .chart-container {
    height: 320px;
    padding: 17px;
  }
}

</style>
