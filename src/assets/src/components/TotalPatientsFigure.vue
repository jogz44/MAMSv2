<template>
  <q-card class="dashboard-card">
    <q-card-section>
      <div class="totals-container">
        <!-- Total Patients (Left) -->
        <div class="total-left">
          <div class="total-item">
            <div class="amount-title">TOTAL PATIENTS</div>
            <div class="amount-titles">{{ totalPatients }}</div>
          </div>
        </div>

        <!-- Divider (Center) -->
        <div class="divider"></div>

        <!-- Total Amount Released (Right) -->
        <div class="total-right">
          <div class="total-item">
            <div class="amount-title2">TOTAL AMOUNT RELEASED</div>
            <div class="amount-titles2">{{ formatPeso(totalAmount) }}</div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { api } from 'src/boot/axios'

const axios = api
import { ref, onMounted } from 'vue'

const totalPatients = ref(0)
const totalAmount = ref(0)

const formatPeso = (amount) => {
  if (amount == null) return '₱0.00';
  return new Intl.NumberFormat('en-PH', { 
    style: 'currency', 
    currency: 'PHP', 
    minimumFractionDigits: 2 
  }).format(amount);
};

onMounted(() => {
  const getTotalPatientsAndAmount = async () => {
    try {
      const res = await axios.get('/api/total-patients-and-amount')
      totalPatients.value = res.data.totalPatients
      totalAmount.value = res.data.totalAmount
    } catch (err) {
      console.log(err)
    }
  }
  getTotalPatientsAndAmount()
})
</script>

<style scoped>
.dashboard-card {
  width: 100%;
  max-width: 650px; /* maintain your original max width */
  padding: 10px;
  background: #ffffff;
  border-radius: 12px;
  border: 2px solid grey;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  font-family: sans-serif;
  margin: 20px auto; /* center card */
  height: 128px; /* keep original height */
  box-sizing: border-box;
  margin-top: -26%;
  margin-left: 10px;
}

.totals-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  position: relative;
}

.total-left,
.total-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.total-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.amount-title {
  font-weight: 700;
  font-size: 15px;
  color: green;
}

.amount-title2 {
  font-weight: 700;
  font-size: 15px;
  color: green;
}

.amount-titles,
.amount-titles2 {
  font-weight: 700;
  font-size: 30px;
  color: rgb(153, 0, 0);
}

/* Vertical Divider */
.divider {
  width: 2px;
  background-color: #000;
  align-self: stretch;
  margin: 0 10px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .totals-container {
    flex-direction: column;
  }

  .divider {
    width: 80%;
    height: 2px;
    margin: 10px 0;
  }

  .total-left,
  .total-right {
    flex: 1 1 100%;
  }
}
</style>
