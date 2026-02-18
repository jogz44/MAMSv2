<template>
  <q-card class="dashboard-card">
    <q-card-section class="text-center">
      <div class="amount-title">MONTHLY CATERED PATIENTS</div>

      <div class="chart-container">
        <canvas ref="monthlyCateredPatients"></canvas>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js/auto'
import { api } from 'src/boot/axios'

const axios = api

Chart.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
)

const monthlyCateredPatients = ref(null)

onMounted(async () => {
  try {
    const res = await axios.get('/api/monthly-patients')

    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    const dataMedicine = months.map(m => res.data.monthlyCounts.Medicine[m] ?? 0)
    const dataLaboratory = months.map(m => res.data.monthlyCounts.Laboratory[m] ?? 0)
    const dataHospital = months.map(m => res.data.monthlyCounts.Hospital[m] ?? 0)

    new Chart(monthlyCateredPatients.value, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [
          { label: 'Medicine', data: dataMedicine, borderColor: '#0318fc', pointBackgroundColor: '#0318fc', borderWidth: 2 },
          { label: 'Laboratory', data: dataLaboratory, borderColor: '#fbff00', pointBackgroundColor: '#fbff00', borderWidth: 2 },
          { label: 'Hospital', data: dataHospital, borderColor: '#ff0000', pointBackgroundColor: '#ff0000', borderWidth: 2 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    })
  } catch (err) {
    console.error(err)
  }
})
</script>

<style scoped>
/* CARD */
.dashboard-card {
  width: 100%;
  max-width: 900px;
  margin: 12px auto;
  padding: 8px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  font-family: Arial, sans-serif;
}

/* TITLE */
.amount-title {
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 10px;
}

/* CHART WRAPPER */
.chart-container {
  position: relative;
  width: 100%;
  height: 280px;
}

/* CANVAS */
canvas {
  width: 100% !important;
  height: 100% !important;
}

/* 📱 MOBILE */
@media (max-width: 600px) {
  .amount-title {
    font-size: 16px;
  }

  .chart-container {
    height: 220px;
  }
}

/* 💻 LARGE SCREENS */
@media (min-width: 1400px) {
  .chart-container {
    height: 340px;
  }
}
</style>
