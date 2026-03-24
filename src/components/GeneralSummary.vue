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
              <q-select v-model="categoryValue" :options="categoryOptions" label="Category" placeholder="Category" dense
                outlined clearable @clear="onClearCategory" />
            </div>

            <!-- PARTNER -->
            <div class="filter-item">
              <q-select v-model="partnerValue" dense outlined :options="partnerOptions" label="Partner"
                placeholder="Partner" clearable @clear="onClearPartner" :disable="categoryValue == null" />
            </div>

            <!-- BARANGAY -->
            <div class="filter-item">
              <q-select v-model="barangayValue" :options="barangayOptions" label="Barangay" placeholder="Barangay" dense
                outlined clearable @clear="onClearBarangay" />
            </div>

            <!-- SECTOR -->
            <div class="filter-item">
              <q-select v-model="sectorValue" :options="sectorOptions" label="Sector" placeholder="Sector" dense
                outlined clearable @clear="onClearSector" />
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
        <div class="left-section" :style="{ width: sectionWidths.left + '%' }" ref="leftSection">
          <table class="data-table">
            <thead>
              <!-- Spacer row when no category - matches month header height -->
              <tr v-if="!categoryValue" class="month-headers">
                <th colspan="8" class="category-header">&nbsp;</th>
              </tr>
              <!-- Category header row - only show if category filter is applied -->
              <tr v-if="categoryValue" class="category-header-row">
                <th colspan="8" class="category-header">
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
                <th>SECTOR</th>
              </tr>
            </thead>
            <tbody v-if="loading">
              <tr>
                <td colspan="8" class="text-center q-pa-lg">
                  <q-spinner color="primary" size="50px" />
                </td>
              </tr>
            </tbody>
            <tbody v-else-if="filteredRows.length === 0">
              <tr>
                <td colspan="8" class="text-center q-pa-lg text-grey-6">
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
                  <td :rowspan="row.recordsInThisMonth">{{ row.sector || 'N/A' }}</td>
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

        <!-- RIGHT SECTION (Summary Records) -->
        <div class="right-section" :style="{ width: sectionWidths.right + '%' }" ref="rightSection">
          <div class="horizontal-scroll" ref="rightScroll">
            <table class="data-table">
              <thead>
                <!-- Summary period header row -->
                <tr class="month-headers">
                  <th
                    v-for="summaryPeriod in visibleMonths"
                    :key="summaryPeriod"
                    :colspan="getMonthColspan()"
                    class="month-header summary-period-header"
                  >
                    {{ summaryPeriod }}
                  </th>
                </tr>
                <!-- Column headers -->
                <tr>
                  <template v-for="summaryPeriod in visibleMonths" :key="`cols-${summaryPeriod}`">
                    <th>DATE ISSUED GL</th>
                    <th>CATEGORY</th>
                    <th>CLIENT'S NAME</th>
                    <th>GL NO.</th>
                    <th>GL AMOUNT</th>
                    <th>ISSUED BY</th>
                    <th>PARTNER</th>
                    <th>DATE ISSUED INVOICE</th>
                    <th>INVOICE NO.</th>
                    <th>INVOICE AMOUNT</th>
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
                  <template v-for="summaryPeriod in visibleMonths" :key="`${row.rowId}-${summaryPeriod}`">
                    <template v-if="row.monthlyRecords[monthMapping.get(summaryPeriod)]">
                      <td>{{ row.monthlyRecords[monthMapping.get(summaryPeriod)].dateIssuedGl }}</td>
                      <td>{{
                        row.monthlyRecords[monthMapping.get(summaryPeriod)].category }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(summaryPeriod)].clientName }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(summaryPeriod)].glNo }}</td>
                      <td>{{ formatCurrency(row.monthlyRecords[monthMapping.get(summaryPeriod)].glAmount) }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(summaryPeriod)].issuedBy }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(summaryPeriod)].partner }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(summaryPeriod)].invoiceDateIssued || '' }}</td>
                      <td>{{ row.monthlyRecords[monthMapping.get(summaryPeriod)].invoiceNo || '' }}</td>
                      <td>{{ formatOptionalCurrency(row.monthlyRecords[monthMapping.get(summaryPeriod)].invoiceAmount) }}</td>
                      <td></td>
                    </template>
                    <template v-else>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
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
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { api } from 'src/boot/axios'

const axios = api
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const rows = ref([])
const allPatients = ref([])
const loading = ref(false)
const dateRange = ref(null)

// Scroll sync refs
const leftSection = ref(null)
const rightSection = ref(null)
const rightScroll = ref(null)

let isSyncingLeft = false
let isSyncingRight = false

const syncScrollFromLeft = () => {
  if (isSyncingLeft) return
  isSyncingRight = true
  if (rightScroll.value) {
    rightScroll.value.scrollTop = leftSection.value.scrollTop
  }
  isSyncingRight = false
}

const syncScrollFromRight = () => {
  if (isSyncingRight) return
  isSyncingLeft = true
  if (leftSection.value) {
    leftSection.value.scrollTop = rightScroll.value.scrollTop
  }
  isSyncingLeft = false
}


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
const sectorValue = ref(null)

const allPartners = ref([])
const allPreferences = ref([])
const allSectors = ref([])

const STORAGE_KEYS = {
  DATE_RANGE: 'general_summary_date_range',
  CATEGORY: 'general_summary_category',
  PARTNER: 'general_summary_partner',
  BARANGAY: 'general_summary_barangay',
  SECTOR: 'general_summary_sector'
}

const columnWidths = ref({
  name: 300,
  address: 350
})

const sectionWidths = ref({
  left: 50,
  right: 50
})

const resizeState = ref({
  isResizing: false,
  column: null,
  startX: 0,
  startWidth: 0
})

const sectionResizeState = ref({
  isResizing: false,
  startX: 0,
  startLeftWidth: 0
})

const SUMMARY_DATE_FORMATS = ['DD/MM/YYYY', 'YYYY/MM/DD', 'YYYY-MM-DD', 'MM/DD/YYYY']

const parseSelectedDate = (value) => {
  if (!value) {
    return null
  }

  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value : null
  }

  if (value instanceof Date) {
    const parsedDate = dayjs(value)
    return parsedDate.isValid() ? parsedDate : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()

  for (const format of SUMMARY_DATE_FORMATS) {
    const parsedDate = dayjs(normalizedValue, format, true)
    if (parsedDate.isValid()) {
      return parsedDate
    }
  }

  const fallbackDate = dayjs(normalizedValue)
  return fallbackDate.isValid() ? fallbackDate : null
}

const selectedDateBounds = computed(() => {
  if (!dateRange.value) {
    return null
  }

  if (typeof dateRange.value === 'string') {
    const selectedDate = parseSelectedDate(dateRange.value)

    if (!selectedDate) {
      return null
    }

    return {
      fromDate: selectedDate,
      toDate: selectedDate
    }
  }

  const { from, to } = dateRange.value
  const fromDate = parseSelectedDate(from)

  if (!fromDate) {
    return null
  }

  const toDate = parseSelectedDate(to) || fromDate

  return {
    fromDate,
    toDate: toDate.isBefore(fromDate) ? fromDate : toDate
  }
})

const getSelectedYears = () => {
  if (!selectedDateBounds.value) {
    return [dayjs().format('YYYY')]
  }

  const years = []
  let currentYear = selectedDateBounds.value.fromDate.year()
  const endYear = selectedDateBounds.value.toDate.year()

  while (currentYear <= endYear) {
    years.push(String(currentYear))
    currentYear += 1
  }

  return years
}

const buildSummaryPeriodLabel = (year) => {
  if (!selectedDateBounds.value) {
    return `IN THE YEAR OF ${year}`
  }

  const yearStart = dayjs(`01/01/${year}`, 'DD/MM/YYYY')
  const yearEnd = dayjs(`31/12/${year}`, 'DD/MM/YYYY')
  const periodStart = selectedDateBounds.value.fromDate.year() === Number(year)
    ? selectedDateBounds.value.fromDate
    : yearStart
  const periodEnd = selectedDateBounds.value.toDate.year() === Number(year)
    ? selectedDateBounds.value.toDate
    : yearEnd

  if (periodStart.isSame(yearStart, 'day') && periodEnd.isSame(yearEnd, 'day')) {
    return `IN THE YEAR OF ${year}`
  }

  if (periodStart.isSame(periodEnd, 'month')) {
    return periodStart.format('MMMM YYYY').toUpperCase()
  }

  return `${periodStart.format('MMMM YYYY').toUpperCase()} - ${periodEnd.format('MMMM YYYY').toUpperCase()}`
}

const visibleMonths = computed(() => {
  return getSelectedYears().map(buildSummaryPeriodLabel)
})

const monthMapping = computed(() => {
  const mapping = new Map()

  getSelectedYears().forEach(year => {
    mapping.set(buildSummaryPeriodLabel(year), year)
  })

  return mapping
})

const partnerOptions = computed(() => {
  if (!categoryValue.value) {
    return [...new Set(allPartners.value.map(p => p.partner))].sort()
  }
  return allPartners.value
    .filter(p => p.category === categoryValue.value)
    .map(p => p.partner)
    .sort()
})

const sectorOptions = computed(() => {
  return allSectors.value.map(s => s.sector).sort()
})

const SUMMARY_PERIOD_COLUMN_COUNT = 11

const getMonthColspan = () => {
  return SUMMARY_PERIOD_COLUMN_COUNT
}

const totalColumns = computed(() => {
  return visibleMonths.value.length * getMonthColspan()
})

watch(categoryValue, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    partnerValue.value = null
  }
})

const saveFiltersToStorage = () => {
  sessionStorage.setItem(STORAGE_KEYS.DATE_RANGE, JSON.stringify(dateRange.value))
  sessionStorage.setItem(STORAGE_KEYS.CATEGORY, JSON.stringify(categoryValue.value))
  sessionStorage.setItem(STORAGE_KEYS.PARTNER, JSON.stringify(partnerValue.value))
  sessionStorage.setItem(STORAGE_KEYS.BARANGAY, JSON.stringify(barangayValue.value))
  sessionStorage.setItem(STORAGE_KEYS.SECTOR, JSON.stringify(sectorValue.value))
}

const loadFiltersFromStorage = () => {
  try {
    const savedDateRange = sessionStorage.getItem(STORAGE_KEYS.DATE_RANGE)
    const savedCategory = sessionStorage.getItem(STORAGE_KEYS.CATEGORY)
    const savedPartner = sessionStorage.getItem(STORAGE_KEYS.PARTNER)
    const savedBarangay = sessionStorage.getItem(STORAGE_KEYS.BARANGAY)
    const savedSector = sessionStorage.getItem(STORAGE_KEYS.SECTOR)

    if (savedDateRange) dateRange.value = JSON.parse(savedDateRange)
    if (savedCategory) categoryValue.value = JSON.parse(savedCategory)
    if (savedPartner) partnerValue.value = JSON.parse(savedPartner)
    if (savedBarangay) barangayValue.value = JSON.parse(savedBarangay)
    if (savedSector) sectorValue.value = JSON.parse(savedSector)
  } catch (error) {
    console.error('Error loading filters from storage:', error)
  }
}

watch([dateRange, categoryValue, partnerValue, barangayValue, sectorValue], () => {
  saveFiltersToStorage()
})

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

const calculateAge = (birthdate) => {
  if (!birthdate) return null
  const birth = dayjs(birthdate)
  if (!birth.isValid()) return null
  if (birth.isAfter(dayjs())) return null
  const age = dayjs().diff(birth, 'year')
  return age
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A'
  const num = parseFloat(amount)
  if (isNaN(num)) return 'N/A'
  return '₱' + num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatOptionalCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return ''
  const num = parseFloat(amount)
  if (isNaN(num)) return ''
  return 'â‚±' + num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatClientName = (clientData, patientName) => {
  if (!clientData || !clientData.firstname) {
    return 'SAME'
  }

  const parts = [
    clientData.lastname ? clientData.lastname + ',' : '',
    clientData.firstname,
    clientData.middlename,
    clientData.suffix
  ].filter(Boolean)

  return parts.join(' ')
}

const formatSector = (sectorIds, sectorsLookup) => {
  if (!sectorIds || !sectorIds.length || !sectorsLookup || !sectorsLookup.length) return 'N/A'
  const names = sectorIds
    .map(id => {
      const found = sectorsLookup.find(s => s.id === id)
      return found ? found.sector : null
    })
    .filter(Boolean)
  return names.length ? names.join(', ') : 'N/A'
}

const processPatientData = (rawData) => {
  const patientGroups = new Map()

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
          sector: formatSector(record.sector_ids, allSectors.value),
          barangay: record.barangay,
          sectorIds: record.sector_ids || [],
        },
        recordsByYear: new Map()
      })
    }

    const d = dayjs(record.date_issued)
    const yearKey = d.format('YYYY')

    if (!patientGroups.get(key).recordsByYear.has(yearKey)) {
      patientGroups.get(key).recordsByYear.set(yearKey, [])
    }

    patientGroups.get(key).recordsByYear.get(yearKey).push(record)
  })

  const allRows = []

  const sortedPatients = Array.from(patientGroups.entries()).sort(
    (a, b) => a[1].patientInfo.patientId - b[1].patientInfo.patientId
  )

  sortedPatients.forEach(([key, group]) => {
    const sortedYears = Array.from(group.recordsByYear.keys()).sort(
      (a, b) => Number(a) - Number(b)
    )

    const yearRecordsMap = new Map()

    sortedYears.forEach(yearKey => {
      const recordsInYear = group.recordsByYear.get(yearKey)
      recordsInYear.sort((a, b) => {
        const dateDifference = dayjs(a.date_issued).valueOf() - dayjs(b.date_issued).valueOf()

        if (dateDifference !== 0) {
          return dateDifference
        }

        return Number(a.gl_no ?? 0) - Number(b.gl_no ?? 0)
      })
      yearRecordsMap.set(yearKey, recordsInYear)
    })

    let maxRecordsInAnyYear = 0
    yearRecordsMap.forEach(records => {
      maxRecordsInAnyYear = Math.max(maxRecordsInAnyYear, records.length)
    })

    for (let rowIndex = 0; rowIndex < maxRecordsInAnyYear; rowIndex++) {
      const monthlyRecords = {}

      sortedYears.forEach(yearKey => {
        const recordsInYear = yearRecordsMap.get(yearKey)

        if (rowIndex < recordsInYear.length) {
          const record = recordsInYear[rowIndex]

          monthlyRecords[yearKey] = {
            dateIssuedGl: dayjs(record.date_issued).format('YYYY-MM-DD'),
            category: record.category,
            clientName: formatClientName({
              lastname: record.client_lastname,
              firstname: record.client_firstname,
              middlename: record.client_middlename,
              suffix: record.client_suffix
            }),
            glNo: record.gl_no,
            glAmount: record.issued_amount,
            issuedBy: record.issued_by,
            partner: record.partner,
            invoiceDateIssued: null,
            invoiceNo: null,
            invoiceAmount: record.category === 'HOSPITAL' ? record.hospital_bill : null
          }
        }
      })

      allRows.push({
        ...group.patientInfo,
        rowId: `patient-${group.patientInfo.patientId}-row-${rowIndex}`,
        monthlyRecords: monthlyRecords,
        isFirstInMonth: true,
        recordsInThisMonth: 1
      })
    }
  })

  return allRows
}

const filteredRows = computed(() => {
  let filtered = allPatients.value

  if (categoryValue.value) {
    filtered = filtered.filter(row => {
      return Object.values(row.monthlyRecords).some(
        record => record.category === categoryValue.value
      )
    })
  }

  if (partnerValue.value) {
    filtered = filtered.filter(row => {
      return Object.values(row.monthlyRecords).some(
        record => record.partner === partnerValue.value
      )
    })
  }

  if (barangayValue.value) {
    filtered = filtered.filter(row => row.barangay === barangayValue.value)
  }

  if (sectorValue.value) {
    filtered = filtered.filter(row => {
      if (!row.sectorIds || !row.sectorIds.length) return false
      const matchingSector = allSectors.value.find(s => s.sector === sectorValue.value)
      if (!matchingSector) return false
      return row.sectorIds.includes(matchingSector.id)
    })
  }

  return filtered
})

const fetchDropdownOptions = async () => {
  try {
    const [partnersRes, preferencesRes, sectorsRes] = await Promise.all([
      axios.get('/api/partners/all'),
      axios.get('/api/preferences/all'),
      axios.get('/api/sectors/all')
    ])
    allPartners.value = partnersRes.data
    allPreferences.value = preferencesRes.data
    allSectors.value = sectorsRes.data
  } catch (err) {
    console.error('Failed to fetch dropdown options:', err)
  }
}

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

    const dataPartners = [...new Set(res.data.map(r => ({ category: r.category, partner: r.partner })))]

    const mergedPartners = new Map()

    allPartners.value.forEach(p => {
      const key = `${p.category}-${p.partner}`
      mergedPartners.set(key, p)
    })

    dataPartners.forEach(p => {
      const key = `${p.category}-${p.partner}`
      if (!mergedPartners.has(key)) {
        mergedPartners.set(key, { category: p.category, partner: p.partner })
      }
    })

    allPartners.value = Array.from(mergedPartners.values())

    allPatients.value = processPatientData(res.data)
  } catch (err) {
    console.error('Failed to fetch patients:', err)
  } finally {
    loading.value = false
  }
}


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

const onClearDate = () => { dateRange.value = null }
const onClearCategory = () => { categoryValue.value = null; partnerValue.value = null }
const onClearPartner = () => { partnerValue.value = null }
const onClearBarangay = () => { barangayValue.value = null }
const onClearSector = () => { sectorValue.value = null }

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
  const relativeX = event.pageX - containerRect.left

  let newLeftPercent = (relativeX / containerWidth) * 100
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

const downloadCSV = () => {
  const rows = []

  if (categoryValue.value) {
    const categoryRow = [categoryValue.value]
    rows.push(categoryRow)
  }

  const monthHeaders = ['', '', '', '', '', '', '', '']
  visibleMonths.value.forEach(monthYear => {
    const colspan = getMonthColspan()
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
    'PREFERENCE',
    'SECTOR'
  ]

  visibleMonths.value.forEach(monthYear => {
    columnHeaders.push('DATE ISSUED GL')
    columnHeaders.push('CATEGORY')
    columnHeaders.push('CLIENT\'S NAME')
    columnHeaders.push('GL NO.')
    columnHeaders.push('GL AMOUNT')
    columnHeaders.push('ISSUED BY')
    columnHeaders.push('PARTNER')
    columnHeaders.push('DATE ISSUED INVOICE')
    columnHeaders.push('INVOICE NO.')
    columnHeaders.push('INVOICE AMOUNT')
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
      row.preference || 'N/A',
      row.sector || 'N/A'
    ]

    visibleMonths.value.forEach(monthYear => {
      const dataKey = monthMapping.value.get(monthYear)
      const record = row.monthlyRecords[dataKey]
      if (record) {
        dataRow.push(`\t${record.dateIssuedGl}`)
        dataRow.push(record.category)
        dataRow.push(record.clientName)
        dataRow.push(record.glNo)
        const glAmount = record.glAmount ? parseFloat(record.glAmount).toFixed(2) : '0.00'
        dataRow.push(`\t${glAmount}`)
        dataRow.push(record.issuedBy)
        dataRow.push(record.partner)
        dataRow.push(record.invoiceDateIssued ? `\t${record.invoiceDateIssued}` : '')
        dataRow.push(record.invoiceNo || '')
        const invoiceAmount = record.invoiceAmount ? parseFloat(record.invoiceAmount).toFixed(2) : ''
        dataRow.push(invoiceAmount ? `\t${invoiceAmount}` : '')
        dataRow.push('')
      } else {
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('-')
        dataRow.push('')
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

  if (categoryValue.value) filename += `-${categoryValue.value.toLowerCase()}`
  if (partnerValue.value) filename += `-${partnerValue.value.toLowerCase().replace(/\s+/g, '-')}`
  if (barangayValue.value) filename += `-${barangayValue.value.toLowerCase().replace(/\s+/g, '-')}`
  if (sectorValue.value) filename += `-${sectorValue.value.toLowerCase().replace(/\s+/g, '-')}`
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

onMounted(async () => {
  await fetchDropdownOptions()
  loadFiltersFromStorage()
  await fetchPatients()

  nextTick(() => {
    if (leftSection.value) {
      leftSection.value.addEventListener('scroll', syncScrollFromLeft)
    }
    if (rightScroll.value) {
      rightScroll.value.addEventListener('scroll', syncScrollFromRight)
    }
  })
})

onBeforeUnmount(() => {
  saveFiltersToStorage()
  if (leftSection.value) leftSection.value.removeEventListener('scroll', syncScrollFromLeft)
  if (rightScroll.value) rightScroll.value.removeEventListener('scroll', syncScrollFromRight)
})

const getPatientNumber = (patientId) => {
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
  min-width: 150px;
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

@media (max-width: 1400px) {
  .filter-item {
    min-width: 140px;
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

.data-table thead tr:last-child th {
  padding: 12px 16px;
  font-size: 12px;
  letter-spacing: 0.01em;
}

.data-table td {
  padding: 0 16px;
  height: 48px;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  font-size: 12px;
  box-sizing: border-box;
}

.data-table tbody tr {
  background-color: white;
  transition: background-color 0.2s;
  height: 48px;
}

.data-table tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.data-table tbody tr:hover {
  background-color: #f5f5f5;
}

.category-header-row th {
  padding: 10px 12px !important;
  font-size: 13px !important;
  font-weight: 700 !important;
}

.category-header {
  background-color: #ff9800 !important;
  color: white;
}

.month-headers th {
  font-size: 13px;
  font-weight: 700;
  padding: 10px 12px;
  color: white;
}

.summary-period-header {
  background-color: #4CAF50 !important;
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

.sticky-col {
  position: sticky;
  left: 0;
  background-color: white;
  z-index: 5;
  box-shadow: 2px 0 3px rgba(0, 0, 0, 0.08);
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

.text-center {
  text-align: center;
}

.q-pa-lg {
  padding: 24px;
}

.text-grey-6 {
  color: rgba(0, 0, 0, 0.54);
}

@media screen and (max-width: 1200px) {
  .filters-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 8px;
    align-items: end;
  }

  .filters-group {
    display: contents;
  }

  .filter-date {
    grid-column: 1 / -1;
  }

  .filter-item {
    min-width: 0;
  }

  .csv-button-wrapper {
    min-width: 0;
    margin-left: 0;
  }

  .csv-button {
    width: 100%;
    min-width: 0;
  }
}

@media screen and (max-width: 766px) {
  .filters-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8px;
    align-items: end;
  }

  .filters-group {
    display: contents;
  }

  .filter-date {
    grid-column: 1 / -1;
  }

  .filter-item {
    min-width: 0;
  }

  .csv-button-wrapper {
    min-width: 0;
    margin-left: 0;
  }

  .csv-button {
    width: 100%;
    min-width: 0;
  }
}

@media screen and (max-width: 480px) {

  /* FILTERS */
  .filters-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8px;
    align-items: end;
  }

  .filters-group {
    display: contents;
  }

  .filter-date {
    grid-column: 1 / -1;
  }

  .filter-item {
    min-width: 0;
  }

  .csv-button-wrapper {
    min-width: 0;
    margin-left: 130px;
  }

  .csv-button {
    width: 100%;
    min-width: 0;
  }

  /* TABLE CONTAINER — tall enough to show 5 full records */
  .table-container {
    height: 600px;
    /* 48px month header + 48px col header + (48px × 5 rows) × 2 sections */
    min-height: 600px;
    max-height: 600px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }

  .scrollable-wrapper {
    flex-direction: column;
    overflow: auto;
    flex: 1;
    min-height: 0;
  }

  .left-section {
    width: 100% !important;
    border-right: none;
    border-bottom: 3px solid #1f8f2e;
    overflow: auto;
    height: 400px;
    /* exactly: 48px + 48px header + 5 × 48px rows = 265px */
    min-height: 0;
    flex-shrink: 0;
  }

  .section-divider {
    display: none;
  }

  .right-section {
    width: 100% !important;
    overflow: auto;
    height: 400px;
    /* same as left */
    min-height: 0;
    flex-shrink: 0;
  }

  .horizontal-scroll {
    overflow: auto;
    height: 100%;
    min-height: 0;
  }

  /* TABLE FONT */
  .data-table {
    font-size: 11px;
  }

  .data-table thead tr:last-child th {
    padding: 8px 10px;
    font-size: 11px;
  }

  .data-table td {
    padding: 8px 10px;
    height: 48px;
    font-size: 11px;
  }
}
</style>
