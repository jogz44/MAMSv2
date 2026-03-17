// src/composables/useGeneratePDF.js
import fontkit from '@pdf-lib/fontkit'
import regularFontUrl from 'src/assets/fonts/Gilroy-Medium.ttf?url'
import boldFontUrl    from 'src/assets/fonts/Gilroy-ExtraBold.ttf?url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { toWords } from 'number-to-words'

// ─── Page: half of long bond (8.5" x 6.5") ───────────────────────────────────
const PAGE_W = 612   // 8.5" × 72pt
const PAGE_H = 936   // 6.5" × 72pt
const ML     = 60    // margin left
const MR     = 60    // margin right
const USABLE = PAGE_W - ML - MR  // 540pt

// ─── Typography ───────────────────────────────────────────────────────────────
const SZ      = 14     // body font size (matches ~16.63pt Photoshop at screen res)
const SZ_BOLD = 14
const SZ_LBL  = 7   // small labels under lines
const LH      = 22    // line height between rows

// ─── Colors ──────────────────────────────────────────────────────────────────
const BLACK = rgb(0, 0, 0)
const GRAY  = rgb(0.45, 0.45, 0.45)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaySuffix(d) {
  if (d >= 11 && d <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][d % 10] ?? 'th'
}
function formatCurrency(val) {
  return Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })
}
function buildFullName({ first, middle, last, suffix }) {
  return [first, middle, last, suffix].filter(Boolean).join(' ')
}

// draw a horizontal underline
function line(page, x1, y, x2) {
  page.drawLine({
    start: { x: x1, y },
    end:   { x: x2, y },
    thickness: 0.8,
    color: BLACK
  })
}

// draw small italic-style label centered under a line segment
function lbl(page, text, x1, x2, y, font) {
  const w   = font.widthOfTextAtSize(text, SZ_LBL)
  const cx  = x1 + (x2 - x1) / 2 - w / 2

  page.drawText(text, { x: cx, y: y - 9, size: SZ_LBL, font, color: GRAY })
}

// draw text and return the x position after it
function txt(page, text, x, y, font, size = SZ) {
  page.drawText(text, { x, y, size, font, color: BLACK })
  return x + font.widthOfTextAtSize(text, size)
}

// ─── Main renderer ────────────────────────────────────────────────────────────
async function renderForm(fields, category) {
  const pdfDoc  = await PDFDocument.create()
    // ── Load custom fonts ──
    pdfDoc.registerFontkit(fontkit)
  const regularBytes = await fetch(regularFontUrl).then(r => r.arrayBuffer())
  const boldBytes    = await fetch(boldFontUrl).then(r => r.arrayBuffer())
  const regular = await pdfDoc.embedFont(regularBytes)
  const bold    = await pdfDoc.embedFont(boldBytes)

  const page = pdfDoc.addPage([PAGE_W, PAGE_H])

  // Y positions from top — tweak TOP to shift everything
  const TOP  = PAGE_H - 120   // top of first text line
  const R1   = TOP            // "This will serve..."  line 1
  const R2   = R1  - LH      // "guarantee ___"  line 2
  const R3   = R2  - LH - 4  // "from ___"       line 3
  const R4   = R3  - LH      // "to avail..."    line 4
  const R5   = R4  - LH - 2  // "___ will process the"  line 5
  const R6   = R5  - LH - 4    // "MEDICINE in the amount of ___"  line 6
  const R7   = R6  - LH - 4  // "___ (Php ___)"  line 7
  const R8   = R7  - LH - 14 // "Signed this..."  line 8


page.drawText(fields.glAndPartner, { x: 460, y: 860, size: SZ_BOLD, font: bold, color: BLACK  })
page.drawText(fields.issuedBy, {  x: 265, y: R8-72, size: 7, font: bold, color: BLACK  })

  // ── LINE 1: "This will serve as notification that the City Mayor's Office will honor and" ──
  let x = ML
  x = txt(page, "This will serve as notification that the  City Mayor's Office  will honor and", x, R1, regular)
  // x = txt(page, "City Mayor's Office", x, R1, bold)
  // x = txt(page, ' will honor and', x, R1, regular)

  // ── LINE 2: "guarantee ___[Patient Name]___ , ___[Age]___ , ___[Gender]___" ──
  x = ML
  x = txt(page, 'guarantee ', x, R2, regular)

  // Patient Name line
  const NAME_X1 = x
  const NAME_X2 = ML + 310
  line(page, NAME_X1, R2 - 2, NAME_X2)
  if (fields.fullName) {
    page.drawText(fields.fullName, { x: NAME_X1 + 2, y: R2 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, "Patient's Full Name", NAME_X1, NAME_X2, R2 - 2, regular)

  // comma
  x = NAME_X2 + 3
  x = txt(page, ' ,', x, R2, regular)

  // Age line
  const AGE_X1 = x + 4
  const AGE_X2 = AGE_X1 + 68
  line(page, AGE_X1, R2 - 2, AGE_X2)
  if (fields.age) {
    const aw = bold.widthOfTextAtSize(fields.age, SZ_BOLD)
    page.drawText(fields.age, { x: AGE_X1 + (68 - aw) / 2, y: R2 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, 'Age', AGE_X1, AGE_X2, R2 - 2, regular)

  // comma
  x = AGE_X2 + 3
  x = txt(page, ' ,', x, R2, regular)

  // Gender line — goes to right margin
  const GEN_X1 = x + 4
  const GEN_X2 = PAGE_W - MR
  line(page, GEN_X1, R2 - 2, GEN_X2)
  if (fields.sex) {
    page.drawText(fields.sex, { x: GEN_X1 + 2, y: R2 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, 'Gender', GEN_X1, GEN_X2, R2 - 2, regular)

  // ── LINE 3: "from ___[Address]___" ──
  x = ML
  x = txt(page, 'from ', x, R3, regular)
  const ADDR_X1 = x
  const ADDR_X2 = PAGE_W - MR
  line(page, ADDR_X1, R3 - 2, ADDR_X2)
  if (fields.address) {
    page.drawText(fields.address, { x: ADDR_X1 + 2, y: R3 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, 'House No., Street, Purok, Barangay, City, Province', ADDR_X1, ADDR_X2, R3 - 2, regular)

  // ── LINE 4: "to avail medical assistance." ──
  txt(page, 'to avail medical assistance.', ML, R4, regular)

  // ── LINE 5: "___[Client]___ will process the" ──
  const CLI_X1 = ML
  const CLI_X2 = ML + 340
  line(page, CLI_X1, R5 - 2, CLI_X2)
  if (fields.client) {
    page.drawText(fields.client, { x: CLI_X1 + 2, y: R5 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, "Client's Full Name/ Relationship with Patient", CLI_X1, CLI_X2, R5 - 2, regular)

  x = CLI_X2 + 6
  txt(page, 'will process the', x, R5, regular)

  // ── LINE 6: "MEDICINE in the amount of ___[Amount Words]___" ──
  x = ML
  x = txt(page, category, x, R6, bold)
  x = txt(page, ' in the amount of ', x, R6, regular)

  const AMW_X1 = x
  const AMW_X2 = PAGE_W - MR
  line(page, AMW_X1, R6 - 2, AMW_X2)
  if (fields.amountWords) {
    page.drawText(fields.amountWords, { x: AMW_X1 + 2, y: R6 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, 'Amount in Words', AMW_X1, AMW_X2, R6 - 2, regular)

  // ── LINE 7: "___  (Php ___)." ──
  const BLK_X1 = ML
  const BLK_X2 = ML + 170
  line(page, BLK_X1, R7 - 2, BLK_X2)

  x = BLK_X2 + 6
  x = txt(page, '(Php ', x, R7, regular)

  const PHP_X1 = x
  const PHP_X2 = PHP_X1 + 130
  line(page, PHP_X1, R7 - 2, PHP_X2)
  if (fields.amountNumbers) {
    page.drawText(fields.amountNumbers, { x: PHP_X1 + 2, y: R7 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, 'Amount in Numbers', PHP_X1, PHP_X2, R7 - 2, regular)

  x = PHP_X2 + 4
  txt(page, ').', x, R7, regular)

  // ── LINE 8: "Signed this ___ day of ___ 2026." ──
  x = ML
  x = txt(page, 'Signed this ', x, R8, regular)

  const DAY_X1 = x
  const DAY_X2 = x + 44
  line(page, DAY_X1, R8 - 2, DAY_X2)
  if (fields.day) {
    const dw = bold.widthOfTextAtSize(fields.day, SZ_BOLD)
    page.drawText(fields.day, { x: DAY_X1 + (44 - dw) / 2, y: R8 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, 'Date', DAY_X1, DAY_X2, R8 - 2, regular)

  x = DAY_X2 + 4
  x = txt(page, ' day of ', x, R8, regular)

  const MON_X1 = x
  const MON_X2 = x + 130
  line(page, MON_X1, R8 - 2, MON_X2)
  if (fields.month) {
    page.drawText(fields.month, { x: MON_X1 + 4, y: R8 + 2, size: SZ_BOLD, font: bold, color: BLACK })
  }
  lbl(page, 'Month', MON_X1, MON_X2, R8 - 2, regular)

  x = MON_X2 + 4
  txt(page, ' 2026.', x, R8, regular)

  return pdfDoc.save()
}

// ─── Field builder ────────────────────────────────────────────────────────────
function buildFields(formData) {
  const {
    firstName, middleName, lastName, suffix,
    houseAddress, barangay, city, province,
    isSelf, clientFirst, clientMiddle, clientLast, clientSuffix, relationship,
    issuedAmount, date, glNum, partner, age, sex, issuedBy
  } = formData

  const fullName    = buildFullName({ first: firstName, middle: middleName, last: lastName, suffix })
  const fullAddress = [houseAddress, barangay, city, province].filter(Boolean).join(', ')
  const client      = isSelf
    ? fullName
    : [
        buildFullName({ first: clientFirst, middle: clientMiddle, last: clientLast, suffix: clientSuffix }),
        relationship ? `/ ${relationship}` : ''
      ].filter(Boolean).join(' ')

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

// ─── Public composable ────────────────────────────────────────────────────────
export function useGeneratePDF() {
  async function generatePDF(formData, detailsOnly = false) {
    const fields   = buildFields(formData)
    const pdfBytes = await renderForm(fields, formData.category)
    const blob     = new Blob([pdfBytes], { type: 'application/pdf' })
    window.open(URL.createObjectURL(blob))
  }

  return { generatePDF }
}
