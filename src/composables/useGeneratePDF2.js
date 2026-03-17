// src/composables/useGeneratePDF.js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { toWords } from 'number-to-words'


const PDF_TEMPLATES = {
  full:    { MEDICINE: '/mams/med.pdf',         LABORATORY: '/mams/lab.pdf',    HOSPITAL: '/mams/hosp.pdf' },
  details: { MEDICINE: '/mams/detailsonly.pdf', LABORATORY: '/mams/detailsonly.pdf', HOSPITAL: '/mams/detailsonly.pdf' }
}

const FIELD_LAYOUT = {
  MEDICINE: [
    { key: 'glAndPartner',  x: 610, y: 505, size: 14 },
    { key: 'fullName',      x: 200, y: 400 },
    { key: 'age',           x: 545, y: 375 },
    { key: 'sex',           x: 630, y: 375 },
    { key: 'address',       x: 120, y: 350 },
    { key: 'client',        x:  70, y: 300 },
    { key: 'amountWords',   x: 310, y: 270 },
    { key: 'amountNumbers', x: 340, y: 242, size: 14 },
    { key: 'day',           x: 170, y: 191 },
    { key: 'month',         x: 315, y: 191 },
    { key: 'issuedBy',      x: 340, y:  65 }
  ],
  LABORATORY: [
    { key: 'glAndPartner',  x: 600, y: 489, size: 14 },
    { key: 'fullName',      x: 160, y: 375 },
    { key: 'age',           x: 545, y: 375 },
    { key: 'sex',           x: 630, y: 375 },
    { key: 'address',       x: 120, y: 350 },
    { key: 'client',        x:  70, y: 300 },
    { key: 'amountWords',   x: 360, y: 270 },
    { key: 'amountNumbers', x: 340, y: 242, size: 14 },
    { key: 'day',           x: 170, y: 191 },
    { key: 'month',         x: 315, y: 191 },
    { key: 'issuedBy',      x: 340, y:  65 }
  ],
  HOSPITAL: [
    { key: 'glAndPartner',  x: 600, y: 489, size: 14 },
    { key: 'fullName',      x: 160, y: 375 },
    { key: 'age',           x: 545, y: 375 },
    { key: 'sex',           x: 630, y: 375 },
    { key: 'address',       x: 120, y: 350 },
    { key: 'client',        x:  70, y: 300 },
    { key: 'amountWords',   x: 360, y: 270 },
    { key: 'amountNumbers', x: 340, y: 242, size: 14 },
    { key: 'day',           x: 170, y: 191 },
    { key: 'month',         x: 315, y: 191 },
    { key: 'issuedBy',      x: 340, y:  65 }
  ]
}

function getDaySuffix (d) {
  if (d >= 11 && d <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][d % 10] ?? 'th'
}

function formatCurrency (val) {
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}

function buildFullName ({ first, middle, last, suffix }) {
  return [first, middle, last, suffix].filter(Boolean).join(' ')
}

function buildFields (formData) {
  const { firstName, middleName, lastName, suffix, houseAddress, barangay, city, province,
          isSelf, clientFirst, clientMiddle, clientLast, clientSuffix, relationship,
          issuedAmount, date, glNum, partner, age, sex, issuedBy } = formData

  const fullName   = buildFullName({ first: firstName, middle: middleName, last: lastName, suffix })
  const fullAddress = [houseAddress, barangay, city, province].filter(Boolean).join(', ')
  const client = isSelf
    ? fullName
    : [buildFullName({ first: clientFirst, middle: clientMiddle, last: clientLast, suffix: clientSuffix }),
       relationship ? `/ ${relationship}` : ''].filter(Boolean).join(' ')

  const parsedDate  = new Date(date)
  const dayNum      = parsedDate.getDate() + getDaySuffix(parsedDate.getDate())
  const monthName   = parsedDate.toLocaleString('default', { month: 'long' })
  const amountWords = toWords(parseInt(issuedAmount)).toUpperCase() + ' PESOS'

  return {
    glAndPartner:  `${glNum} / ${partner}`,
    fullName:      fullName.toUpperCase(),
    age:           String(age ?? ''),
    sex:           String(sex ?? '').toUpperCase(),
    address:       fullAddress.toUpperCase(),
    client:        client.toUpperCase(),
    amountWords,
    amountNumbers: formatCurrency(issuedAmount),
    day:           dayNum,
    month:         monthName.toUpperCase(),
    issuedBy:      String(issuedBy ?? '').toUpperCase()
  }
}

async function renderPDF (templatePath, category, fields) {

  const existingPdfBytes = await fetch(templatePath).then(r => r.arrayBuffer())
  const pdfDoc   = await PDFDocument.load(existingPdfBytes)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page     = pdfDoc.getPages()[0]
  page.setSize(page.getWidth(), 1200)
  page.translateContent(0, 605)

  for (const { key, x, y, size = 13 } of FIELD_LAYOUT[category]) {
    const value = fields[key]
    if (value == null || value === '') continue
    page.drawText(String(value), { x, y, size, color: rgb(0, 0, 0), font: boldFont })
  }

  return pdfDoc.save()
}

export function useGeneratePDF () {
  async function generatePDF (formData, detailsOnly = false) {
    const { category } = formData
    const templatePath = PDF_TEMPLATES[detailsOnly ? 'details' : 'full'][category]
    const fields       = buildFields(formData)
    const pdfBytes     = await renderPDF(templatePath, category, fields)
    const blob         = new Blob([pdfBytes], { type: 'application/pdf' })
    window.open(URL.createObjectURL(blob))
  }

  return { generatePDF }
}
