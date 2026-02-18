<template>
  <div>
    <!-- FILTERS -->
    <q-card flat bordered class="filter-card">
      <q-card-section class="q-pa-sm">
        <div class="filters-container">
          <!-- LEFT GROUP: Filters -->
          <div class="filters-group">
            <!-- DATE SEARCH -->
            <div class="filter-item filter-date">
              <div class="filter-label-wrapper">
                <span class="filter-label">Filter by Period:</span>
                <q-input class="filter-input" :model-value="formattedDate" outlined dense
                  placeholder="dd/mm/yyyy - dd/mm/yyyy" @clear="onClearDate" readonly clearable>
                  <template #append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover>
                        <q-date v-model="dateRange" range emit-immediately mask="DD/MM/YYYY">
                          <div class="row items-center justify-end q-pa-sm">
                            <q-btn label="Close" color="primary" flat v-close-popup />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- CATEGORY -->
            <div class="filter-item">
              <q-select v-model="categoryValue" :options="categoryOptions" label="Category" placeholder="Category"
                dense outlined clearable @clear="onClearCategory" />
            </div>

            <!-- PARTNER -->
            <div class="filter-item">
              <q-select v-model="partnerValue" dense outlined :options="partnerOptions" label="Partner"
                placeholder="Partner" clearable @clear="onClearPartner" :disable="categoryValue == null" />
            </div>

            <!-- BARANGAY -->
            <div class="filter-item">
              <q-select v-model="barangayValue" :options="barangayOptions" label="Barangay" placeholder="Barangay"
                dense outlined clearable @clear="onClearBarangay" />
            </div>
          </div>

          <!-- RIGHT GROUP: CSV Button -->
          <div class="csv-button-wrapper">
            <q-btn icon="download" label="Export as CSV" color="green" @click="downloadCSV"
              :disable="filteredRows.length === 0" no-caps class="csv-button" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE CONTAINER -->
    <div class="table-container">
      <div class="scrollable-wrapper">
        <!-- LEFT SECTION (Patient Info) -->
        <div class="left-section" :style="{ width: sectionWidths.left + '%' }">
          <table class="data-table">
            <thead>
              <!-- Spacer row when no category - matches month header height -->
              <tr v-if="!categoryValue" class="month-headers">
                <th colspan="7" class="category-header">&nbsp;</th>
              </tr>
              <!-- Category header row - only show if category filter is applied -->
              <tr v-if="categoryValue" class="category-header-row">
                <th colspan="7" class="category-header">
                  {{ categoryValue }}
                </th>
              </tr>
              <!-- Column headers -->
              <tr>
                <th class="sticky-col">NO.</th>
                <th class="resizable-col"
                  :style="{ width: columnWidths.name + 'px', minWidth: columnWidths.name + 'px', maxWidth: columnWidths.name + 'px' }">
                  <div class="resizable-header">
                    <span>PATIENT'S NAME</span>
                    <div class="resize-handle" @mousedown="startResize($event, 'name')"></div>
                  </div>
                </th>
                <th class="resizable-col"
                  :style="{ width: columnWidths.address + 'px', minWidth: columnWidths.address + 'px', maxWidth: columnWidths.address + 'px' }">
                  <div class="resizable-header">
                    <span>ADDRESS</span>
                    <div class="resize-handle" @mousedown="startResize($event, 'address')"></div>
                  </div>
                </th>
                <th>CONTACT NO.</th>
                <th>AGE</th>
                <th>SEX</th>
                <th>PREFERENCE</th>
              </tr>
            </thead>
            <tbody v-if="loading">
              <tr>
                <td colspan="7" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="50px" />
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="filteredRows.length === 0">
              <tr>
                <td colspan="7" class="text-center q-pa-lg text-grey-6">
                  No records found
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="row in filteredRows" :key="row.rowId">

                <!-- FIRST ROW IN MONTH: render merged patient cells -->
                <template v-if="row.isFirstInMonth">
                  <td class="sticky-col" :rowspan="row.recordsInThisMonth">
                    {{ getPatientNumber(row.patientId) }}
                  </td>

                  <td class="name-cell" :rowspan="row.recordsInThisMonth">
                    {{ row.name }}
                  </td>

                  <td class="address-cell" :rowspan="row.recordsInThisMonth">
                    {{ row.address }}
                  </td>

                  <td :rowspan="row.recordsInThisMonth">{{ row.phoneNumber || 'N/A' }}</td>
                  <td :rowspan="row.recordsInThisMonth">{{ row.age ?? 'N/A' }}</td>
                  <td :rowspan="row.recordsInThisMonth">{{ row.sex || 'N/A' }}</td>
                  <td :rowspan="row.recordsInThisMonth">{{ row.preference || 'N/A' }}</td>
                </template>

                <!-- FOLLOWING ROWS IN SAME MONTH: PLACEHOLDER CELLS -->
                <template v-else>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </template>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- DIVIDER (resizable) -->
        <div class="section-divider" @mousedown="startSectionResize">
          <div class="divider-line"></div>
        </div>

        <!-- RIGHT SECTION (Monthly Records) -->
        <div class="right-section" :style="{ width: sectionWidths.right + '%' }">
          <div class="horizontal-scroll">
            <table class="data-table">
              <thead>
                <!-- Month headers row -->
                <tr class="month-headers">
                  <th v-for="monthYear in visibleMonths" :key="monthYear" :colspan="getMonthColspan(monthYear)"
                    :class="`month-header month-${monthYear.split(' ')[0].toLowerCase()}`">
                    {{ monthYear }}
                  </th>
                </tr>
                <!-- Column headers -->
                <tr>
                  <template v-for="monthYear in visibleMonths" :key="`cols-${monthYear}`">
                    <th>GL NO.</th>
                    <th v-if="!categoryValue && !partnerValue">CATEGORY</th>
                    <th v-if="!partnerValue">PARTNER</th>
                    <th>CLIENT'S NAME</th>
                    <th>DATE ISSUED</th>
                    <th v-if="showHospitalBill">HOSPITAL BILL</th>
                    <th>AMOUNT</th>
                    <th>ISSUED BY</th>
                  </template>
                </tr>
              </thead>
              <tbody v-if="loading">
                <tr>
                  <td :colspan="totalColumns" class="text-center q-pa-lg">
                    <q-spinner color="primary" size="50px" />
                  </td>
                </tr>
              </tbody>
              <tbody v-else-if="filteredRows.length === 0">
                <tr>
                  <td :colspan="totalColumns" class="text-center q-pa-lg text-grey-6">
                    No records found
                  </td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr v-for="row in filteredRows" :key="row.rowId">
                  <template v-for="monthYear in visibleMonths" :key="`${row.glNum}-${monthYear}`">
                    <template v-if="row.monthlyRecords[monthMapping.get(monthYear)]">
                      <td>{{ row.monthlyRecords[monthMapping.get(monthYear)].glNo }}</td>
                      <td v-if="!categoryValue && !partnerValue">{{
                        row.monthlyRecords[monthMapping.get(monthYear)].category }}</td>
                      <td v-if="!partnerValue">{{ row.monthlyRecords[monthMapping.get(monthYear)].partner }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(monthYear)].clientName }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(monthYear)].dateIssued }}</td>
                      <td v-if="showHospitalBill">{{
                        formatCurrency(row.monthlyRecords[monthMapping.get(monthYear)].hospitalBill) }}</td>
                      <td>{{ formatCurrency(row.monthlyRecords[monthMapping.get(monthYear)].issuedAmount) }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(monthYear)].issuedBy }}</td>
                    </template>
                    <template v-else>
                      <td>-</td>
                      <td v-if="!categoryValue && !partnerValue">-</td>
                      <td v-if="!partnerValue">-</td>
                      <td>-</td>
                      <td>-</td>
                      <td v-if="showHospitalBill">-</td>
                      <td>-</td>
                      <td>-</td>
                    </template>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { api } from 'src/boot/axios'

const axios = api
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// Extend dayjs with customParseFormat plugin
dayjs.extend(customParseFormat)

const rows = ref([])
const allPatients = ref([])
const loading = ref(false)
const dateRange = ref(null)

const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const barangayOptions = [
  "APOKON", "BINCUNGAN", "BUSAON", "CANOCOTAN", "CUAMBOGAN", "LA FILIPINA", "LIBOGANON", "MADAUM",
  "MAGDUM", "MAGUGPO EAST", "MAGUGPO NORTH", "MAGUGPO POBLACION", "MAGUGPO SOUTH", "MAGUGPO WEST",
  "MANKILAM", "NEW BALAMBAN", "NUEVA FUERZA", "PAGSABANGAN", "PANDAPAN", "SAN AGUSTIN", "SAN ISIDRO",
  "SAN MIGUEL (CAMP 4)", "VISAYAN VILLAGE"
]

const categoryValue = ref(null)
const partnerValue = ref(null)
const barangayValue = ref(null)

// Storage keys
const STORAGE_KEYS = {
  DATE_RANGE: 'general_summary_date_range',
  CATEGORY: 'general_summary_category',
  PARTNER: 'general_summary_partner',
  BARANGAY: 'general_summary_barangay'
}

// Column widths for resizable columns
const columnWidths = ref({
  name: 300,
  address: 350
})

// Section widths (percentages) - resizable
const sectionWidths = ref({
  left: 50,
  right: 50
})

// Resize state
const resizeState = ref({
  isResizing: false,
  column: null,
  startX: 0,
  startWidth: 0
})

// Section resize state
const sectionResizeState = ref({
  isResizing: false,
  startX: 0,
  startLeftWidth: 0
})

const visibleMonths = computed(() => {
  // If date filter is applied, show the date range in header
  if (dateRange.value) {
    let fromDate, toDate

    if (typeof dateRange.value === 'string') {
      fromDate = toDate = dayjs(dateRange.value, 'DD/MM/YYYY')
    } else {
      const { from, to } = dateRange.value
      fromDate = dayjs(from, 'DD/MM/YYYY')
      toDate = to ? dayjs(to, 'DD/MM/YYYY') : fromDate
    }

    if (!fromDate.isValid()) {
      const currentYear = dayjs().format('YYYY')
      return [
        `JANUARY ${currentYear}`, `FEBRUARY ${currentYear}`, `MARCH ${currentYear}`,
        `APRIL ${currentYear}`, `MAY ${currentYear}`, `JUNE ${currentYear}`,
        `JULY ${currentYear}`, `AUGUST ${currentYear}`, `SEPTEMBER ${currentYear}`,
        `OCTOBER ${currentYear}`, `NOVEMBER ${currentYear}`, `DECEMBER ${currentYear}`
      ]
    }

    const monthYears = []
    let current = fromDate.clone().startOf('month')
    const end = toDate.clone().endOf('month')

    while (current.isBefore(end) || current.isSame(end, 'month')) {
      // Check if this is the first month or last month in the range
      const isFirstMonth = current.isSame(fromDate, 'month')
      const isLastMonth = current.isSame(toDate, 'month')

      let monthDisplay = ''

      if (isFirstMonth && isLastMonth) {
        // Single month with date range
        monthDisplay = `${fromDate.format('MMM DD, YYYY')} - ${toDate.format('MMM DD, YYYY')}`
      } else if (isFirstMonth) {
        // First month in range - show from date to end of month
        const endOfMonth = current.clone().endOf('month')
        monthDisplay = `${fromDate.format('MMM DD, YYYY')} - ${endOfMonth.format('MMM DD, YYYY')}`
      } else if (isLastMonth) {
        // Last month in range - show start of month to end date
        const startOfMonth = current.clone().startOf('month')
        monthDisplay = `${startOfMonth.format('MMM DD, YYYY')} - ${toDate.format('MMM DD, YYYY')}`
      } else {
        // Middle months - show full month
        monthDisplay = `${current.format('MMMM YYYY').toUpperCase()}`
      }

      monthYears.push(monthDisplay)
      current = current.add(1, 'month')
    }

    return monthYears
  }

  // No date filter - show all months for current year
  const currentYear = dayjs().format('YYYY')
  return [
    `JANUARY ${currentYear}`, `FEBRUARY ${currentYear}`, `MARCH ${currentYear}`,
    `APRIL ${currentYear}`, `MAY ${currentYear}`, `JUNE ${currentYear}`,
    `JULY ${currentYear}`, `AUGUST ${currentYear}`, `SEPTEMBER ${currentYear}`,
    `OCTOBER ${currentYear}`, `NOVEMBER ${currentYear}`, `DECEMBER ${currentYear}`
  ]
})

// Add this computed property for month mapping
const monthMapping = computed(() => {
  const mapping = new Map()

  if (dateRange.value) {
    let fromDate, toDate

    if (typeof dateRange.value === 'string') {
      fromDate = toDate = dayjs(dateRange.value, 'DD/MM/YYYY')
    } else {
      const { from, to } = dateRange.value
      fromDate = dayjs(from, 'DD/MM/YYYY')
      toDate = to ? dayjs(to, 'DD/MM/YYYY') : fromDate
    }

    if (fromDate.isValid()) {
      let current = fromDate.clone().startOf('month')
      const end = toDate.clone().endOf('month')

      while (current.isBefore(end) || current.isSame(end, 'month')) {
        const isFirstMonth = current.isSame(fromDate, 'month')
        const isLastMonth = current.isSame(toDate, 'month')

        let monthDisplay = ''

        if (isFirstMonth && isLastMonth) {
          monthDisplay = `${fromDate.format('MMM DD, YYYY')} - ${toDate.format('MMM DD, YYYY')}`
        } else if (isFirstMonth) {
          monthDisplay = `${fromDate.format('MMM DD, YYYY')} - ${current.endOf('month').format('MMM DD, YYYY')}`
        } else if (isLastMonth) {
          monthDisplay = `${current.startOf('month').format('MMM DD, YYYY')} - ${toDate.format('MMM DD, YYYY')}`
        } else {
          monthDisplay = `${current.format('MMMM YYYY').toUpperCase()}`
        }

        // Map the display format to the data storage format
        const dataKey = `${current.format('MMMM').toUpperCase()} ${current.format('YYYY')}`
        mapping.set(monthDisplay, dataKey)

        current = current.add(1, 'month')
      }
    }
  } else {
    // No date filter - map display to same format
    const currentYear = dayjs().format('YYYY')
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ]

    months.forEach(month => {
      const key = `${month} ${currentYear}`
      mapping.set(key, key)
    })
  }

  return mapping
})

// Computed: Partner options based on category
const partnerOptions = computed(() => {
  if (categoryValue.value === 'MEDICINE') return ['PHARMACITI', 'QURESS']
  if (categoryValue.value === 'LABORATORY') return ['PERPETUAL LAB', 'MEDILIFE', 'LEXAS', 'CITY MED']
  if (categoryValue.value === 'HOSPITAL') return ['TAGUM GLOBAL', 'CHRIST THE KING', 'MEDICAL MISSION', 'TMC']
  return []
})

// Computed: Show hospital bill column if category is HOSPITAL or no category filter
const showHospitalBill = computed(() => {
  return categoryValue.value === 'HOSPITAL' || categoryValue.value === null
})

// Computed: Get colspan for each month header
const getMonthColspan = (monthYear) => {
  let cols = 5 // GL NO., CLIENT'S NAME, DATE ISSUED, AMOUNT, ISSUED BY

  if (!categoryValue.value && !partnerValue.value) {
    cols += 1 // CATEGORY
  }

  if (!partnerValue.value) {
    cols += 1 // PARTNER
  }

  if (showHospitalBill.value) {
    cols += 1 // HOSPITAL BILL
  }

  return cols
}

// Computed: Total columns for empty state colspan
const totalColumns = computed(() => {
  return visibleMonths.value.length * getMonthColspan('JANUARY 2026')
})

// Watch category changes to reset partner
watch(categoryValue, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    partnerValue.value = null
  }
})

// Save filters to localStorage
const saveFiltersToStorage = () => {
  localStorage.setItem(STORAGE_KEYS.DATE_RANGE, JSON.stringify(dateRange.value))
  localStorage.setItem(STORAGE_KEYS.CATEGORY, JSON.stringify(categoryValue.value))
  localStorage.setItem(STORAGE_KEYS.PARTNER, JSON.stringify(partnerValue.value))
  localStorage.setItem(STORAGE_KEYS.BARANGAY, JSON.stringify(barangayValue.value))
}

// Load filters from localStorage
const loadFiltersFromStorage = () => {
  try {
    const savedDateRange = localStorage.getItem(STORAGE_KEYS.DATE_RANGE)
    const savedCategory = localStorage.getItem(STORAGE_KEYS.CATEGORY)
    const savedPartner = localStorage.getItem(STORAGE_KEYS.PARTNER)
    const savedBarangay = localStorage.getItem(STORAGE_KEYS.BARANGAY)

    if (savedDateRange) dateRange.value = JSON.parse(savedDateRange)
    if (savedCategory) categoryValue.value = JSON.parse(savedCategory)
    if (savedPartner) partnerValue.value = JSON.parse(savedPartner)
    if (savedBarangay) barangayValue.value = JSON.parse(savedBarangay)
  } catch (error) {
    console.error('Error loading filters from storage:', error)
  }
}

// Watch filters and save to localStorage
watch([dateRange, categoryValue, partnerValue, barangayValue], () => {
  saveFiltersToStorage()
})

// Save filters before component unmounts
onBeforeUnmount(() => {
  saveFiltersToStorage()
})

// Format date for display
const formattedDate = computed(() => {
  if (!dateRange.value) {
    return ''
  }

  if (typeof dateRange.value === 'string') {
    return dateRange.value
  }

  const { from, to } = dateRange.value
  if (from && !to) {
    return from
  }
  if (from && to) {
    return `${from} - ${to}`
  }
  return ''
})

// Calculate age from birthdate
const calculateAge = (birthdate) => {
  if (!birthdate) return null
  const birth = dayjs(birthdate)
  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null
  const age = dayjs().diff(birth, 'year')
  return age
}

// Format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A'
  const num = parseFloat(amount)
  if (isNaN(num)) return 'N/A'
  return '₱' + num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Format client name
const formatClientName = (clientData, patientName) => {
  if (!clientData || !clientData.firstname) {
    return 'SAME' // Same as patient
  }

  const parts = [
    clientData.lastname ? clientData.lastname + ',' : '',
    clientData.firstname,
    clientData.middlename,
    clientData.suffix
  ].filter(Boolean)

  return parts.join(' ')
}

const processPatientData = (rawData) => {
  const patientGroups = new Map()

  // 1. Group by patient
  rawData.forEach(record => {
    const key = record.patient_id

    if (!patientGroups.has(key)) {
      patientGroups.set(key, {
        patientInfo: {
          patientId: record.patient_id,
          name: [
            record.lastname ? record.lastname + ',' : '',
            record.firstname,
            record.middlename,
            record.suffix
          ].filter(Boolean).join(' '),
          address: [
            record.house_address,
            record.barangay,
            record.city,
            record.province
          ].filter(Boolean).join(', '),
          phoneNumber: record.phone_number,
          age: calculateAge(record.birthdate),
          sex: record.sex,
          preference: record.preference,
          barangay: record.barangay
        },
        recordsByMonth: new Map()
      })
    }

    const d = dayjs(record.date_issued)
    const monthYear = `${d.format('MMMM').toUpperCase()} ${d.format('YYYY')}`

    if (!patientGroups.get(key).recordsByMonth.has(monthYear)) {
      patientGroups.get(key).recordsByMonth.set(monthYear, [])
    }

    patientGroups.get(key).recordsByMonth.get(monthYear).push(record)
  })

  const allRows = []

  // 2. Sort patient groups by patient ID (ascending)
  const sortedPatients = Array.from(patientGroups.entries()).sort(
    (a, b) => a[1].patientInfo.patientId - b[1].patientInfo.patientId
  )

  // 3. Process each patient
  sortedPatients.forEach(([key, group]) => {
    // Sort months chronologically
    const sortedMonths = Array.from(group.recordsByMonth.keys()).sort(
      (a, b) => dayjs(a, 'MMMM YYYY') - dayjs(b, 'MMMM YYYY')
    )

    // Build a structure: for each month, get all records
    const monthRecordsMap = new Map()

    sortedMonths.forEach(monthYear => {
      const recordsInMonth = group.recordsByMonth.get(monthYear)
      // Sort records in this month by GL number (ascending)
      recordsInMonth.sort((a, b) => a.gl_no - b.gl_no)
      monthRecordsMap.set(monthYear, recordsInMonth)
    })

    // Find the maximum number of records in any single month for this patient
    let maxRecordsInAnyMonth = 0
    monthRecordsMap.forEach(records => {
      maxRecordsInAnyMonth = Math.max(maxRecordsInAnyMonth, records.length)
    })

    // Create rows equal to maxRecordsInAnyMonth
    for (let rowIndex = 0; rowIndex < maxRecordsInAnyMonth; rowIndex++) {
      const monthlyRecords = {}

      // For each month, get the record at rowIndex (if exists)
      sortedMonths.forEach(monthYear => {
        const recordsInMonth = monthRecordsMap.get(monthYear)

        if (rowIndex < recordsInMonth.length) {
          const record = recordsInMonth[rowIndex]

          monthlyRecords[monthYear] = {
            glNo: record.gl_no,
            category: record.category,
            partner: record.partner,
            clientName: formatClientName({
              lastname: record.client_lastname,
              firstname: record.client_firstname,
              middlename: record.client_middlename,
              suffix: record.client_suffix
            }),
            dateIssued: dayjs(record.date_issued).format('YYYY-MM-DD'),
            hospitalBill: record.category === 'HOSPITAL' ? record.hospital_bill : null,
            issuedAmount: record.issued_amount,
            issuedBy: record.issued_by
          }
        }
      })

      // Create a row - each row is a complete clone of patient info
      allRows.push({
        ...group.patientInfo,
        rowId: `patient-${group.patientInfo.patientId}-row-${rowIndex}`,
        monthlyRecords: monthlyRecords,
        isFirstInMonth: true, // Each row shows full patient info
        recordsInThisMonth: 1 // No rowspan needed
      })
    }
  })

  return allRows
}

// Computed: Filtered rows
const filteredRows = computed(() => {
  let filtered = allPatients.value

  // Apply category filter
  if (categoryValue.value) {
    filtered = filtered.filter(row => {
      // Check if patient has ANY record matching the category
      return Object.values(row.monthlyRecords).some(
        record => record.category === categoryValue.value
      )
    })
  }

  // Apply partner filter
  if (partnerValue.value) {
    filtered = filtered.filter(row => {
      // Check if patient has ANY record matching the partner
      return Object.values(row.monthlyRecords).some(
        record => record.partner === partnerValue.value
      )
    })
  }

  // Apply barangay filter
  if (barangayValue.value) {
    filtered = filtered.filter(row => row.barangay === barangayValue.value)
  }

  return filtered
})

// Fetch patients with optional date filter
const fetchPatients = async (dateFilter = null) => {
  loading.value = true
  try {
    let params = {}

    if (dateFilter) {
      if (typeof dateFilter === 'string') {
        params.date = dateFilter
      } else {
        const { from, to } = dateFilter
        if (from && to) {
          params.from = from
          params.to = to
        } else if (from) {
          params.date = from
        }
      }
    } else {
      const currentYear = dayjs().format('YYYY')
      params.from = `01/01/${currentYear}`
      params.to = `31/12/${currentYear}`
    }

    const res = await axios.get('/api/general-summary-records', { params })
    allPatients.value = processPatientData(res.data)
  } catch (err) {
    console.error('Failed to fetch patients:', err)
  } finally {
    loading.value = false
  }
}

// Watch for date range changes
watch(dateRange, async (newVal) => {
  if (!newVal) {
    fetchPatients()
    return
  }

  if (typeof newVal === 'string') {
    fetchPatients(newVal)
  } else {
    const { from, to } = newVal
    if (from && to) {
      fetchPatients({ from, to })
    } else if (from) {
      fetchPatients(from)
    }
  }
})

// Clear filters
const onClearDate = () => {
  dateRange.value = null
}

const onClearCategory = () => {
  categoryValue.value = null
  partnerValue.value = null
}

const onClearPartner = () => {
  partnerValue.value = null
}

const onClearBarangay = () => {
  barangayValue.value = null
}

// Column resize functions
const startResize = (event, column) => {
  event.preventDefault()
  resizeState.value = {
    isResizing: true,
    column: column,
    startX: event.pageX,
    startWidth: columnWidths.value[column]
  }

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const onResize = (event) => {
  if (!resizeState.value.isResizing) return

  const diff = event.pageX - resizeState.value.startX
  const newWidth = Math.max(150, resizeState.value.startWidth + diff)

  columnWidths.value[resizeState.value.column] = newWidth
}

const stopResize = () => {
  resizeState.value.isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Section resize functions
const startSectionResize = (event) => {
  event.preventDefault()
  sectionResizeState.value = {
    isResizing: true,
    startX: event.pageX,
    startLeftWidth: sectionWidths.value.left
  }

  document.addEventListener('mousemove', onSectionResize)
  document.addEventListener('mouseup', stopSectionResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const onSectionResize = (event) => {
  if (!sectionResizeState.value.isResizing) return

  const container = document.querySelector('.table-container')
  if (!container) return

  const containerRect = container.getBoundingClientRect()
  const containerWidth = containerRect.width

  // Calculate the mouse position relative to the container
  const relativeX = event.pageX - containerRect.left

  // Calculate new percentage (with constraints)
  let newLeftPercent = (relativeX / containerWidth) * 100

  // Constrain between 20% and 80%
  newLeftPercent = Math.max(20, Math.min(80, newLeftPercent))

  sectionWidths.value.left = newLeftPercent
  sectionWidths.value.right = 100 - newLeftPercent
}

const stopSectionResize = () => {
  sectionResizeState.value.isResizing = false
  document.removeEventListener('mousemove', onSectionResize)
  document.removeEventListener('mouseup', stopSectionResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Download CSV function
const downloadCSV = () => {
  const rows = []

  if (categoryValue.value) {
    const categoryRow = [categoryValue.value]
    rows.push(categoryRow)
  }

  const monthHeaders = ['', '', '', '', '', '', '']
  visibleMonths.value.forEach(monthYear => {
    const colspan = getMonthColspan(monthYear)
    monthHeaders.push(monthYear)
    for (let i = 1; i < colspan; i++) {
      monthHeaders.push('')
    }
  })
  rows.push(monthHeaders)

  const columnHeaders = [
    'NO.',
    'PATIENT\'S NAME',
    'ADDRESS',
    'CONTACT NO.',
    'AGE',
    'SEX',
    'PREFERENCE'
  ]

  visibleMonths.value.forEach(monthYear => {
    columnHeaders.push('GL NO.')
    if (!categoryValue.value && !partnerValue.value) {
      columnHeaders.push('CATEGORY')
    }
    if (!partnerValue.value) {
      columnHeaders.push('PARTNER')
    }
    columnHeaders.push('CLIENT\'S NAME')
    columnHeaders.push('DATE ISSUED')
    if (showHospitalBill.value) {
      columnHeaders.push('HOSPITAL BILL')
    }
    columnHeaders.push('AMOUNT')
    columnHeaders.push('ISSUED BY')
  })

  rows.push(columnHeaders)

  filteredRows.value.forEach((row, index) => {
    const dataRow = [
      index + 1,
      row.name,
      row.address,
      row.phoneNumber ? `\t${row.phoneNumber}` : 'N/A',
      row.age !== null ? row.age : 'N/A',
      row.sex || 'N/A',
      row.preference || 'N/A'
    ]

    visibleMonths.value.forEach(monthYear => {
      const dataKey = monthMapping.value.get(monthYear)
      const record = row.monthlyRecords[dataKey]
      if (record) {
        dataRow.push(record.glNo)
        if (!categoryValue.value && !partnerValue.value) {
          dataRow.push(record.category)
        }
        if (!partnerValue.value) {
          dataRow.push(record.partner)
        }
        dataRow.push(record.clientName)
        dataRow.push(`\t${record.dateIssued}`)
        if (showHospitalBill.value) {
          const hospitalBill = record.hospitalBill ? parseFloat(record.hospitalBill).toFixed(2) : '0.00'
          dataRow.push(`\t${hospitalBill}`)
        }
        const amount = record.issuedAmount ? parseFloat(record.issuedAmount).toFixed(2) : '0.00'
        dataRow.push(`\t${amount}`)
        dataRow.push(record.issuedBy)
      } else {
        dataRow.push('-')
        if (!categoryValue.value && !partnerValue.value) {
          dataRow.push('-')
        }
        if (!partnerValue.value) {
          dataRow.push('-')
        }
        dataRow.push('-')
        dataRow.push('-')
        if (showHospitalBill.value) {
          dataRow.push('-')
        }
        dataRow.push('-')
        dataRow.push('-')
      }
    })

    rows.push(dataRow)
  })

  const csvContent = '\uFEFF' + rows.map(row =>
    row.map(cell => {
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return '"' + cellStr.replace(/"/g, '""') + '"'
      }
      return cellStr
    }).join(',')
  ).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const today = dayjs().format('YYYY-MM-DD')
  let filename = `general-summary-${today}`

  if (categoryValue.value) {
    filename += `-${categoryValue.value.toLowerCase()}`
  }
  if (partnerValue.value) {
    filename += `-${partnerValue.value.toLowerCase().replace(/\s+/g, '-')}`
  }
  if (barangayValue.value) {
    filename += `-${barangayValue.value.toLowerCase().replace(/\s+/g, '-')}`
  }
  if (dateRange.value) {
    if (typeof dateRange.value === 'string') {
      filename += `-${dateRange.value.replace(/\//g, '-')}`
    } else if (dateRange.value.from && dateRange.value.to) {
      filename += `-${dateRange.value.from.replace(/\//g, '-')}_to_${dateRange.value.to.replace(/\//g, '-')}`
    }
  }

  filename += '.csv'

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  // Load saved filters first
  loadFiltersFromStorage()
  // Then fetch patients (the watch on dateRange will handle the filter)
  fetchPatients()
})

const getPatientNumber = (patientId) => {
  // Get unique patient IDs in the order they appear
  const seen = new Set()
  const uniquePatients = []

  for (const row of filteredRows.value) {
    if (!seen.has(row.patientId)) {
      seen.add(row.patientId)
      uniquePatients.push(row.patientId)
    }
  }

  return uniquePatients.indexOf(patientId) + 1
}
</script>

<style scoped>
.filter-card {
  margin-top: 50px;
  font-size: 33px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: right;
  background-color: #1f8f2e;
  width: 100%;
  margin-bottom: -20px;
}

.filter-card :deep(.q-field__control) {
  background-color: white !important;
}

.filter-card :deep(.q-field__native),
.filter-card :deep(.q-field__label) {
  color: #333 !important;
}

/* Responsive Filter Container */
.filters-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  width: 100%;
  justify-content: space-between;
}

.filters-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  flex: 1 1 auto;
  min-width: 0;
}

.filter-item {
  flex: 1 1 auto;
  min-width: 180px;
}

.filter-date {
  flex: 1.5 1 auto;
  min-width: 250px;
}

.csv-button-wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
  margin-left: auto;
}

.csv-button {
  white-space: nowrap;
  min-width: 180px;
}

.filter-label-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 12px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
}

.filter-input {
  width: 100%;
}

/* Responsive breakpoints */
@media (max-width: 1400px) {
  .filter-item {
    min-width: 160px;
  }

  .filter-date {
    min-width: 220px;
  }

  .csv-button {
    min-width: 160px;
  }
}

@media (max-width: 1200px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-group {
    width: 100%;
  }

  .filter-item {
    flex: 1 1 calc(50% - 6px);
    min-width: 0;
  }

  .filter-date {
    flex: 1 1 100%;
    min-width: 0;
  }

  .csv-button-wrapper {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }

  .csv-button {
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .filters-group {
    gap: 8px;
  }

  .filter-item {
    flex: 1 1 100%;
    min-width: 0;
  }

  .filter-date {
    flex: 1 1 100%;
  }

  .csv-button-wrapper {
    justify-content: stretch;
  }

  .csv-button {
    width: 100%;
    min-width: 0;
  }

  .filter-label {
    font-size: 11px;
  }
}

.table-container {
  width: 100%;
  margin-top: 20px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  height: calc(100vh - 250px);
  display: flex;
  flex-direction: column;
}

.scrollable-wrapper {
  display: flex;
  overflow: hidden;
  width: 100%;
  flex: 1;
  position: relative;
}

.left-section {
  flex-shrink: 0;
  overflow: auto;
  border-right: 2px solid #e0e0e0;
  position: relative;
  background: white;
}

.section-divider {
  width: 8px;
  background: #e0e0e0;
  cursor: col-resize;
  position: relative;
  flex-shrink: 0;
  z-index: 20;
  transition: background-color 0.2s;
}

.section-divider:hover {
  background: #1f8f2e;
}

.section-divider .divider-line {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 40px;
  background: white;
  border-radius: 1px;
}

.right-section {
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  background: white;
}

.horizontal-scroll {
  overflow: auto;
  height: 100%;
}

.data-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 12px;
  background: white;
}

.data-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th {
  background-color: #1f8f2e;
  color: #ffffff;
  text-align: center;
  font-weight: 600;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}

/* Column headers (not month or category headers) */
.data-table thead tr:last-child th {
  padding: 12px 16px;
  font-size: 12px;
  letter-spacing: 0.01em;
}

.data-table td {
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  font-size: 12px;
}

.data-table tbody tr {
  background-color: white;
  transition: background-color 0.2s;
}

.data-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
}

/* Category header row */
.category-header-row th {
  padding: 10px 12px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
}

.category-header {
  background-color: #ff9800 !important;
  color: white;
}

/* Month headers with different colors */
.month-headers th {
  font-size: 13px;
  font-weight: 700;
  padding: 10px 12px;
  color: white;
}

.month-spacer {
  background-color: #1f8f2e !important;
  color: transparent !important;
}

.month-january {
  background-color: #4CAF50 !important;
}

.month-february {
  background-color: #FF5722 !important;
}

.month-march {
  background-color: #9C27B0 !important;
}

.month-april {
  background-color: #2196F3 !important;
}

.month-may {
  background-color: #FFC107 !important;
  color: #333 !important;
}

.month-june {
  background-color: #795548 !important;
}

.month-july {
  background-color: #E91E63 !important;
}

.month-august {
  background-color: #00BCD4 !important;
}

.month-september {
  background-color: #FF9800 !important;
}

.month-october {
  background-color: #607D8B !important;
}

.month-november {
  background-color: #3F51B5 !important;
}

.month-december {
  background-color: #F44336 !important;
}

/* Sticky first column */
.sticky-col {
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 5;
  box-shadow: 2px 0 3px rgba(0, 0, 0, 0.08);
  /* Ensure rowspan cells expand properly */
  vertical-align: middle !important;
}

.sticky-col[rowspan] {
  border-bottom: 2px solid rgba(0, 0, 0, 0.12) !important;
}

.data-table tbody tr:nth-child(even) .sticky-col {
  background-color: #fafafa;
}

.data-table tbody tr:hover .sticky-col {
  background-color: #f5f5f5;
}

/* Cell widths */
.resizable-col {
  position: relative;
}

.resizable-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: col-resize;
  user-select: none;
  background: transparent;
  z-index: 10;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.resize-handle:active {
  background: rgba(255, 255, 255, 0.3);
}

.name-cell {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name-cell[rowspan] {
  vertical-align: middle !important;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12) !important;
}

.address-cell {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-cell[rowspan] {
  vertical-align: middle !important;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12) !important;
}

/* Scrollbar styling - moved higher in the container */
.left-section::-webkit-scrollbar,
.horizontal-scroll::-webkit-scrollbar,
.right-section::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

.left-section::-webkit-scrollbar-track,
.horizontal-scroll::-webkit-scrollbar-track,
.right-section::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.left-section::-webkit-scrollbar-thumb,
.horizontal-scroll::-webkit-scrollbar-thumb,
.right-section::-webkit-scrollbar-thumb {
  background: #1f8f2e;
  border-radius: 5px;
}

.left-section::-webkit-scrollbar-thumb:hover,
.horizontal-scroll::-webkit-scrollbar-thumb:hover,
.right-section::-webkit-scrollbar-thumb:hover {
  background: #166921;
}

.left-section::-webkit-scrollbar-corner,
.horizontal-scroll::-webkit-scrollbar-corner,
.right-section::-webkit-scrollbar-corner {
  background: transparent;
}

/* Loading and empty state styling */
.text-center {
  text-align: center;
}

.q-pa-lg {
  padding: 24px;
}

.text-grey-6 {
  color: rgba(0, 0, 0, 0.54);
}
</style>