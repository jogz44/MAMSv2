<template>
  <q-card class="dashboard-card">
    <q-card-section class="text-center">
      <div class="text-h5 text-green-8 q-mb-sm amount-title">BARANGAY RECORDS</div>
      <div class="table-container">
        <q-table class="budget-table" :rows="rows" row-key="num" flat bordered dense :pagination="{ rowsPerPage: 0 }"
          virtual-scroll :virtual-scroll-sticky-size-start="48">
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
    </q-card-section>
  </q-card>
</template>

<script setup>
import { api } from 'src/boot/axios'

const axios = api
import { ref, onMounted } from 'vue'


const rows = ref([]) // start empty
onMounted(() => {
  const getBarangayData = async () => {
    try {
      const res = await axios.get('/api/barangay-records')

      // Now res.data is already the array
      rows.value = res.data.map((item, index) => ({
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
    } catch (err) {
      console.error('Failed to fetch barangay data:', err)
    }
  }

  getBarangayData()
})

const formatPeso = (amount) => {
  if (amount == null) return '₱0.00';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
};
</script>

<style scoped>
.dashboard-card {
  flex: 0 0 830px;
  /* width of table card */
  padding: 30px;
  height: 375px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(79, 78, 78, 0.334);
  font-family: Arial, sans-serif;
  font-size: 14px;
  margin-left: 15px;
  border: 2px solid grey;
  margin-top: 2%;
}

.amount-title {
  font-weight: 700;
  margin-bottom: 30px;

}

.table-container {
  height: 50px;
  overflow-y: auto;
}

.sticky-header {
  position: sticky;
  top: 1;
  background: white;
  z-index: 5;
}

/* Second header row goes below the first */
.sticky-header.second-row {
  top: 28px;
  /* height of first header row */
}

/* Optional: subtle separation */
.sticky-header th {
  border-bottom: 1px solid #ccc;
}

:deep(thead tr) {
  display: table-row;
}

:deep(.sticky-header) {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

:deep(.sticky-header.second-row) {
  top: 28px;
}

:deep(.sticky-header th) {
  background: #1f8f2e;
  /* Quasar green-8 */
  color: white;
  font-weight: 700;
  border-bottom: 1px solid #1b5e20;
  text-align: center;
}

.budget-table {
  overflow-y: auto;
}
</style>
