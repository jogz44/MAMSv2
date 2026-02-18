<template>
  <br />

  <div class="budget-table table-scroll">
    <div class="button-container">
      <q-btn
        label="Export as CSV"
        color="green"
        class="q-mb-md"
        icon="download"
        @click="exportCombinedCSV"
      />
    </div>
    <q-table
      :rows="summaryRows"
      :columns="columns"
      row-key="type"
      flat
      bordered
      :pagination.sync="pagination"
    >
      <!-- Custom header to match screenshot -->
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            colspan="2"
            class="main-header"
          >
            TABANG MEDIKAL ASSISTANCE ({{ currentYear }})
          </q-th>
          <q-th class="month-header">JANUARY</q-th>
          <q-th class="month-header">FEBRUARY</q-th>
          <q-th class="month-header">MARCH</q-th>
          <q-th class="month-header">APRIL</q-th>
          <q-th class="month-header">MAY</q-th>
          <q-th class="month-header">JUNE</q-th>
          <q-th class="month-header">JULY</q-th>
          <q-th class="month-header">AUG.</q-th>
          <q-th class="month-header">SEPT.</q-th>
          <q-th class="month-header">OCT.</q-th>
          <q-th class="month-header">NOV.</q-th>
          <q-th class="month-header">DEC.</q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-category="props">
        <td :class="{'category-cell': props.row.category}">
          <span v-if="props.row.category">{{ props.row.category }}</span>
        </td>
      </template>


      <!-- Format all month columns -->
      <template v-slot:body-cell-jan="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.jan) : props.row.jan }}
        </q-td>
      </template>
      <template v-slot:body-cell-feb="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.feb) : props.row.feb }}
        </q-td>
      </template>
      <template v-slot:body-cell-mar="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.mar) : props.row.mar }}
        </q-td>
      </template>
      <template v-slot:body-cell-apr="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.apr) : props.row.apr }}
        </q-td>
      </template>
      <template v-slot:body-cell-may="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.may) : props.row.may }}
        </q-td>
      </template>
      <template v-slot:body-cell-jun="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.jun) : props.row.jun }}
        </q-td>
      </template>
      <template v-slot:body-cell-jul="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.jul) : props.row.jul }}
        </q-td>
      </template>
      <template v-slot:body-cell-aug="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.aug) : props.row.aug }}
        </q-td>
      </template>
      <template v-slot:body-cell-sep="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.sep) : props.row.sep }}
        </q-td>
      </template>
      <template v-slot:body-cell-oct="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.oct) : props.row.oct }}
        </q-td>
      </template>
      <template v-slot:body-cell-nov="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.nov) : props.row.nov }}
        </q-td>
      </template>
      <template v-slot:body-cell-dec="props">
        <q-td :props="props">
          {{ props.row.type === 'Amount' ? '₱' + formatCurrency(props.row.dec) : props.row.dec }}
        </q-td>
      </template>
    </q-table>

    <br />

    <q-table
      :rows="tabangRows"
      :columns="columns2"
      row-key="type"
      flat
      bordered
      class="second-table"
      :pagination.sync="pagination"
    >
      <!-- Custom header for second table -->
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th class="second-table-main">TABANG MEDICAL</q-th>
          <q-th class="second-table-blue">{{ currentYear }} BUDGET</q-th>
          <q-th class="second-table-blue">SB#2</q-th>
          <q-th class="second-table-blue">TOTAL RELEASED</q-th>
          <q-th class="second-table-blue">REMAINING BAL.</q-th>
          <q-th class="second-table-blue">PAX</q-th>
        </q-tr>
      </template>

      <template v-slot:body-cell-budget="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.budget) }}
        </q-td>
      </template>
      <template v-slot:body-cell-sb="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.sb) }}
        </q-td>
      </template>
      <template v-slot:body-cell-totRel="props">
        <q-td :props="props">
          ₱{{ formatCurrency(props.row.totRel) }}
        </q-td>
      </template>
      <template v-slot:body-cell-remBal="props">
        <q-td :props="props" :class="props.row.remBal >= 0 ? 'positive-balance' : 'negative-balance'">
          ₱{{ formatCurrency(props.row.remBal) }}
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'

const axios = api
import { ref, computed, onMounted } from "vue";

function exportCombinedCSV() {
  // Prepare summary table CSV part
  const headers1 = columns.map((col) => col.label || col.name);
  const rows1 = summaryRows.value;
  const csvSummary = [
    headers1.join(","),
    ...rows1.map((row) =>
      columns
        .map((col) => {
          let cell = row[col.name];
          if (cell === null || cell === undefined) cell = "";
          else cell = cell.toString().replace(/"/g, '""');
          if (cell.includes(",") || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ].join("\n");

  // Prepare tabang table CSV part
  const headers2 = columns2.map((col) => col.label || col.name);
  const rows2 = tabangRows.value;
  const csvTabang = [
    "\n", // Add blank line for separation
    headers2.join(","),
    ...rows2.map((row) =>
      columns2
        .map((col) => {
          let cell = row[col.name];
          if (cell === null || cell === undefined) cell = "";
          else cell = cell.toString().replace(/"/g, '""');
          if (cell.includes(",") || cell.includes('"')) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ].join("\n");

  // Combine both CSV parts
  const combinedCSV = csvSummary + csvTabang;

  // Trigger download
  const blob = new Blob([combinedCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "combined-budget-tables.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '0.00'
  const num = parseFloat(value)
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const pagination = ref({
  page: 1,
  rowsPerPage: 6, // default rows per page
});

const allPatients = ref([]);
const issuedAmounts = ref([]);
const yearlyBudgets = ref([]);
const supplementaryBonuses = ref([]);

const currentYear = new Date().getFullYear().toString();

onMounted(async () => {
  try {
    const year = currentYear;

    // Fetch all patients
    const resPatients = await axios.get("/api/patients");
    allPatients.value = resPatients.data;

    // Fetch issued amounts
    const resIssued = await axios.get(
      "/api/issued-amounts-by-year",
      { params: { year } },
    );
    issuedAmounts.value = resIssued.data;

    // Fetch yearly budgets
    const resBudget = await axios.get(
      "/api/yearly-budget",
    );
    yearlyBudgets.value = resBudget.data;

    // Fetch supplementary bonuses
    const resSB = await axios.get(
      "/api/supplementary-bonus",
    );
    supplementaryBonuses.value = resSB.data;
  } catch (err) {
    console.error("Error fetching data:", err);
  }
});

const columns = [
  { name: "category", label: "", field: "category", align: "left" },
  { name: "type", label: "", field: "type", align: "left" },

  { name: "jan", label: "Jan", field: "jan", align: "center" },
  { name: "feb", label: "Feb", field: "feb", align: "center" },
  { name: "mar", label: "Mar", field: "mar", align: "center" },
  { name: "apr", label: "Apr", field: "apr", align: "center" },
  { name: "may", label: "May", field: "may", align: "center" },
  { name: "jun", label: "Jun", field: "jun", align: "center" },
  { name: "jul", label: "Jul", field: "jul", align: "center" },
  { name: "aug", label: "Aug", field: "aug", align: "center" },
  { name: "sep", label: "Sep", field: "sep", align: "center" },
  { name: "oct", label: "Oct", field: "oct", align: "center" },
  { name: "nov", label: "Nov", field: "nov", align: "center" },
  { name: "dec", label: "Dec", field: "dec", align: "center" },
];

const columns2 = [
  { name: "category", label: "TABANG MEDICAL", field: "category", align: "left" },

  { name: "budget", label: `${currentYear} BUDGET`, field: "budget", align: "center" },
  { name: "sb", label: "SB#2", field: "sb", align: "center" },
  { name: "totRel", label: "TOTAL RELEASED", field: "totRel", align: "center" },
  { name: "remBal", label: "REMAINING BAL.", field: "remBal", align: "center" },
  { name: "pax", label: "PAX", field: "pax", align: "center" },
];

const summaryRows = computed(() => {
  const initMonths = () => ({
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 0,
    may: 0,
    jun: 0,
    jul: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0,
  });

  // Start with zeroed counts and amounts
  const summary = {
    MEDICINE: { bene: initMonths(), amount: initMonths() },
    LABORATORY: { bene: initMonths(), amount: initMonths() },
    HOSPITAL: { bene: initMonths(), amount: initMonths() },
  };

  // Count beneficiaries from allPatients
  const year = currentYear;

  allPatients.value.forEach((p) => {
    const issuedYear = new Date(p.date_issued).getFullYear();
    if (issuedYear != year) return;

    const month = new Date(p.date_issued)
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase();

    const category = (p.category || "").toUpperCase();
    if (!summary[category]) return;

    summary[category].bene[month]++;
  });

  // Fill amounts from issuedAmounts API data
  for (const cat of ["MEDICINE", "LABORATORY", "HOSPITAL"]) {
    if (!issuedAmounts.value[cat]) continue;
    for (const month in issuedAmounts.value[cat]) {
      summary[cat].amount[month] = issuedAmounts.value[cat][month];
    }
  }

  return [
    { category: "MEDICINE", type: "Total Benefeciaries", ...summary.MEDICINE.bene },
    { category: "", type: "Amount", ...summary.MEDICINE.amount },

    { category: "LABORATORY", type: "Total Benefeciaries", ...summary.LABORATORY.bene },
    { category: "", type: "Amount", ...summary.LABORATORY.amount },

    { category: "HOSPITAL BILL", type: "Total Benefeciaries", ...summary.HOSPITAL.bene },
    { category: "", type: "Amount", ...summary.HOSPITAL.amount },
  ];
});

const tabangRows = computed(() => {
  const year = currentYear;

  const budget = yearlyBudgets.value.find((b) => b.year == year) || {};

  // Sum all supplementary bonuses for the year
  const sb = supplementaryBonuses.value
    .filter((s) => s.year == year)
    .reduce(
      (acc, s) => {
        acc.medicine += Number(s.medicine_supplementary_bonus || 0);
        acc.laboratory += Number(s.laboratory_supplementary_bonus || 0);
        acc.hospital += Number(s.hospital_supplementary_bonus || 0);
        return acc;
      },
      { medicine: 0, laboratory: 0, hospital: 0 },
    );

  // Helper: total released from issuedAmounts
  const getTotalReleased = (cat) => {
    const data = issuedAmounts.value[cat];
    if (!data) return 0;
    return Object.values(data).reduce((a, b) => a + Number(b), 0);
  };

  // Helper: pax count
  const getPax = (cat) => {
    return allPatients.value.filter(
      (p) =>
        (p.category || "").toUpperCase() === cat &&
        new Date(p.date_issued).getFullYear() == year,
    ).length;
  };

  const medReleased = getTotalReleased("MEDICINE");
  const labReleased = getTotalReleased("LABORATORY");
  const hosReleased = getTotalReleased("HOSPITAL");

  return [
    {
      category: "MEDICINE",
      budget: Number(budget.medicine_budget || 0),
      sb: sb.medicine,
      totRel: medReleased,
      remBal: Number(budget.medicine_budget || 0) + sb.medicine - medReleased,
      pax: getPax("MEDICINE"),
    },
    {
      category: "LABORATORY",
      budget: Number(budget.laboratory_budget || 0),
      sb: sb.laboratory,
      totRel: labReleased,
      remBal:
        Number(budget.laboratory_budget || 0) + sb.laboratory - labReleased,
      pax: getPax("LABORATORY"),
    },
    {
      category: "HOSPITAL BILL",
      budget: Number(budget.hospital_budget || 0),
      sb: sb.hospital,
      totRel: hosReleased,
      remBal: Number(budget.hospital_budget || 0) + sb.hospital - hosReleased,
      pax: getPax("HOSPITAL"),
    },
  ];
});
</script>

<style scoped>
.budget-table {
  width: 100%;
  overflow-x: auto;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-right: 8px;
  margin-top: 2%;
  background-color: #1f8f2e;
  padding: 20px;
  width: 100%;
  margin-bottom: -1%;
}

/* First table header styling */
.budget-table :deep(thead tr) {
  background: #c5c5c5;
}
.budget-table :deep(thead th) {
  color: #000000;
  font-weight: 700;
  text-align: center !important;
  padding: 8px 12px !important;
  font-size: 11px;
  border-bottom: 2px solid #7a7878;
}

.budget-table :deep(thead th.main-header) {
  color: #fffdfd;
  text-align: left !important;
  font-weight: 700;
  font-size: 13px;
  background: #1f8f2e;
}

.budget-table :deep(thead th.month-header) {
  background: #1f8f2e;
  color: #fffdfd;
  font-weight: 600;
  font-size: 13px;
}

/* Second table header styling */
.budget-table :deep(thead th.second-table-main) {
  background: #1f8f2e;
  color: #fffdfd;
  font-weight: 700;
  text-align: left !important;
  font-size: 15px;
  font-style: italic;
}

.budget-table :deep(thead th.second-table-blue) {
  background: #1f8f2e;
  color: #fffdfd;
  font-weight: 600;
  font-size: 13px;
}

/* Add border-bottom to ALL table cells */
.budget-table :deep(td) {
  text-align: center;
  vertical-align: middle;
  font-size: 12px;
  padding: 6px 8px;
  border-bottom: 1px solid #ddd;
}

.budget-table :deep(td:first-child) {
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.budget-table :deep(td:nth-child(2)) {
  text-align: left;
  padding-left: 12px;
  border-bottom: 1px solid #ddd;
}

.category-cell {
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

/* Thicker bottom border for Amount rows in first table */
.budget-table :deep(tbody tr:nth-child(2) td),
.budget-table :deep(tbody tr:nth-child(4) td),
.budget-table :deep(tbody tr:nth-child(6) td) {
  border-bottom: 2px solid #7a7878;
}

/* Remove border-bottom from second table body cells */
.budget-table .second-table :deep(tbody tr td) {
  border-bottom: none !important;
}

/* Conditional colors for Remaining Balance */
.budget-table :deep(.positive-balance) {
  color: #28a745 !important;
  font-weight: 600;
}

.budget-table :deep(.negative-balance) {
  color: #dc3545 !important;
  font-weight: 600;
}
</style>