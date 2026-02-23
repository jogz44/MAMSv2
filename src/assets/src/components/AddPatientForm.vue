<template>
  <div>
    <!-- HEADER BANNER -->
    <div class="form-header">
      <div class="form-title">Patient's Info.</div>
    </div>

    <!-- FORM CARD -->
    <div class="form-card">
      <q-form ref="patientForm" class="form-body">
        <div class="row-1">
          <div class="category">
            <label>Category <span>*</span></label>
            <q-select v-model="categoryValue" :options="categoryOptions" label="Category" placeholder="Category" dense
              outlined :rules="[val => !!val || 'This field is required']" />
          </div>
        </div>

        <h6 class="section-title">Patient Form</h6>

        <div class="grid-4">
          <!-- LAST NAME -->
          <div class="field">
            <label>Last Name <span>*</span></label>
            <q-input v-model="lastNameValue" placeholder="Last Name" dense outlined
              :rules="[val => !!val || 'This field is required']" @update:model-value="onLastNameChange"
              @focus="lastNameFocused = true" @blur="onLastNameBlur">
              <template v-slot:append v-if="searchingPatients">
                <q-spinner color="primary" size="20px" />
              </template>
            </q-input>
            <div v-if="showPatientDropdown && lastNameFocused && filteredSearchResults.length > 0"
              class="patient-dropdown">
              <div class="dropdown-header">
                <q-icon name="info" size="xs" color="blue" class="q-mr-xs" />
                <span>{{ filteredSearchResults.length }} patient(s) found - Click to select</span>
              </div>
              <q-scroll-area style="height: 300px;">
                <q-list separator>
                  <q-item v-for="patient in filteredSearchResults" :key="patient.patient_id" clickable
                    :disable="patient.same_category_ineligible"
                    @click="selectPatientFromDropdown(patient)"
                    :class="{
                      'dropdown-patient-item': true,
                      'patient-eligible': patient.eligible,
                      'patient-ineligible-same-category': patient.same_category_ineligible,
                      'patient-ineligible-other-category': !patient.eligible && !patient.same_category_ineligible
                    }">
                    <q-item-section>
                      <q-item-label class="patient-name-dropdown">{{ formatPatientName(patient) }}</q-item-label>
                      <q-item-label caption class="patient-details-dropdown">
                        <div class="detail-row-dropdown">
                          <span><strong>ID:</strong> {{ patient.patient_id }}</span>
                          <span><strong>Sex:</strong> {{ patient.sex || 'N/A' }}</span>
                        </div>
                        <div class="detail-row-dropdown">
                          <span><strong>Birthdate:</strong> {{ patient.birthdate ? formatDate(patient.birthdate) : 'N/A' }}</span>
                          <span><strong>Age:</strong> {{ patient.birthdate ? calculateAgeFromDate(patient.birthdate) : 'N/A' }}</span>
                        </div>
                        <div class="detail-row-dropdown"><span><strong>Address:</strong> {{ formatAddress(patient) }}</span></div>
                        <div class="detail-row-dropdown"><span><strong>Phone Number:</strong> {{ formatPhoneNumber(patient.phone_number) }}</span></div>
                        <div class="detail-row-dropdown" v-if="patient.last_issued_at">
                          <span><strong>Latest GL:</strong> {{ patient.gl_no }}</span>
                          <span><strong>Issued:</strong> {{ formatDate(patient.last_issued_at) }}</span>
                        </div>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <div class="eligibility-badge-container-dropdown">
                        <q-badge v-if="patient.eligible" color="green" class="eligibility-badge-dropdown">
                          <q-icon name="check_circle" size="xs" class="q-mr-xs" />ELIGIBLE
                        </q-badge>
                        <q-badge v-else-if="patient.same_category_ineligible" color="red" class="eligibility-badge-dropdown">
                          <q-icon name="block" size="xs" class="q-mr-xs" />SAME CATEGORY
                        </q-badge>
                        <q-badge v-else color="orange" class="eligibility-badge-dropdown">
                          <q-icon name="warning" size="xs" class="q-mr-xs" />OTHER CATEGORY
                        </q-badge>
                        <div v-if="!patient.eligible && patient.eligibility_date" class="eligibility-info-dropdown">
                          <small>Eligible: {{ formatDate(patient.eligibility_date) }}</small>
                          <small :class="patient.same_category_ineligible ? 'text-red' : 'text-orange'">
                            {{ patient.days_remaining }} days remaining
                          </small>
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>
            </div>
          </div>

          <!-- FIRST NAME -->
          <div class="field">
            <label>First Name <span>*</span></label>
            <q-input v-model="firstNameValue" dense outlined placeholder="First Name"
              :rules="[val => !!val || 'This field is required']" @update:model-value="onFirstNameChange"
              @focus="firstNameFocused = true" @blur="onFirstNameBlur">
              <template v-slot:append v-if="searchingPatients">
                <q-spinner color="primary" size="20px" />
              </template>
            </q-input>
            <div v-if="showPatientDropdown && firstNameFocused && filteredSearchResults.length > 0"
              class="patient-dropdown">
              <div class="dropdown-header">
                <q-icon name="info" size="xs" color="blue" class="q-mr-xs" />
                <span>{{ filteredSearchResults.length }} patient(s) found - Click to select</span>
              </div>
              <q-scroll-area style="height: 300px;">
                <q-list separator>
                  <q-item v-for="patient in filteredSearchResults" :key="patient.patient_id" clickable
                    :disable="patient.same_category_ineligible"
                    @click="selectPatientFromDropdown(patient)"
                    :class="{
                      'dropdown-patient-item': true,
                      'patient-eligible': patient.eligible,
                      'patient-ineligible-same-category': patient.same_category_ineligible,
                      'patient-ineligible-other-category': !patient.eligible && !patient.same_category_ineligible
                    }">
                    <q-item-section>
                      <q-item-label class="patient-name-dropdown">{{ formatPatientName(patient) }}</q-item-label>
                      <q-item-label caption class="patient-details-dropdown">
                        <div class="detail-row-dropdown">
                          <span><strong>ID:</strong> {{ patient.patient_id }}</span>
                          <span><strong>Sex:</strong> {{ patient.sex || 'N/A' }}</span>
                        </div>
                        <div class="detail-row-dropdown">
                          <span><strong>Birthdate:</strong> {{ patient.birthdate ? formatDate(patient.birthdate) : 'N/A' }}</span>
                          <span><strong>Age:</strong> {{ patient.birthdate ? calculateAgeFromDate(patient.birthdate) : 'N/A' }}</span>
                        </div>
                        <div class="detail-row-dropdown"><span><strong>Address:</strong> {{ formatAddress(patient) }}</span></div>
                        <div class="detail-row-dropdown"><span><strong>Phone Number:</strong> {{ formatPhoneNumber(patient.phone_number) }}</span></div>
                        <div class="detail-row-dropdown" v-if="patient.last_issued_at">
                          <span><strong>Latest GL:</strong> {{ patient.gl_no }}</span>
                          <span><strong>Issued:</strong> {{ formatDate(patient.last_issued_at) }}</span>
                        </div>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <div class="eligibility-badge-container-dropdown">
                        <q-badge v-if="patient.eligible" color="green" class="eligibility-badge-dropdown">
                          <q-icon name="check_circle" size="xs" class="q-mr-xs" />ELIGIBLE
                        </q-badge>
                        <q-badge v-else-if="patient.same_category_ineligible" color="red" class="eligibility-badge-dropdown">
                          <q-icon name="block" size="xs" class="q-mr-xs" />SAME CATEGORY
                        </q-badge>
                        <q-badge v-else color="orange" class="eligibility-badge-dropdown">
                          <q-icon name="warning" size="xs" class="q-mr-xs" />OTHER CATEGORY
                        </q-badge>
                        <div v-if="!patient.eligible && patient.eligibility_date" class="eligibility-info-dropdown">
                          <small>Eligible: {{ formatDate(patient.eligibility_date) }}</small>
                          <small :class="patient.same_category_ineligible ? 'text-red' : 'text-orange'">
                            {{ patient.days_remaining }} days remaining
                          </small>
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>
            </div>
          </div>

          <!-- MIDDLE NAME -->
          <div class="field">
            <label>Middle Name</label>
            <q-input v-model="middleNameValue" dense outlined placeholder="Middle Name"
              @update:model-value="onMiddleNameChange" @focus="middleNameFocused = true" @blur="onMiddleNameBlur">
              <template v-slot:append v-if="searchingPatients">
                <q-spinner color="primary" size="20px" />
              </template>
            </q-input>
            <div v-if="showPatientDropdown && middleNameFocused && filteredSearchResults.length > 0"
              class="patient-dropdown">
              <div class="dropdown-header">
                <q-icon name="info" size="xs" color="blue" class="q-mr-xs" />
                <span>{{ filteredSearchResults.length }} patient(s) found - Click to select</span>
              </div>
              <q-scroll-area style="height: 300px;">
                <q-list separator>
                  <q-item v-for="patient in filteredSearchResults" :key="patient.patient_id" clickable
                    :disable="patient.same_category_ineligible"
                    @click="selectPatientFromDropdown(patient)"
                    :class="{
                      'dropdown-patient-item': true,
                      'patient-eligible': patient.eligible,
                      'patient-ineligible-same-category': patient.same_category_ineligible,
                      'patient-ineligible-other-category': !patient.eligible && !patient.same_category_ineligible
                    }">
                    <q-item-section>
                      <q-item-label class="patient-name-dropdown">{{ formatPatientName(patient) }}</q-item-label>
                      <q-item-label caption class="patient-details-dropdown">
                        <div class="detail-row-dropdown">
                          <span><strong>ID:</strong> {{ patient.patient_id }}</span>
                          <span><strong>Sex:</strong> {{ patient.sex || 'N/A' }}</span>
                        </div>
                        <div class="detail-row-dropdown">
                          <span><strong>Birthdate:</strong> {{ patient.birthdate ? formatDate(patient.birthdate) : 'N/A' }}</span>
                          <span><strong>Age:</strong> {{ patient.birthdate ? calculateAgeFromDate(patient.birthdate) : 'N/A' }}</span>
                        </div>
                        <div class="detail-row-dropdown"><span><strong>Address:</strong> {{ formatAddress(patient) }}</span></div>
                        <div class="detail-row-dropdown"><span><strong>Phone Number:</strong> {{ formatPhoneNumber(patient.phone_number) }}</span></div>
                        <div class="detail-row-dropdown" v-if="patient.last_issued_at">
                          <span><strong>Latest GL:</strong> {{ patient.gl_no }}</span>
                          <span><strong>Issued:</strong> {{ formatDate(patient.last_issued_at) }}</span>
                        </div>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                      <div class="eligibility-badge-container-dropdown">
                        <q-badge v-if="patient.eligible" color="green" class="eligibility-badge-dropdown">
                          <q-icon name="check_circle" size="xs" class="q-mr-xs" />ELIGIBLE
                        </q-badge>
                        <q-badge v-else-if="patient.same_category_ineligible" color="red" class="eligibility-badge-dropdown">
                          <q-icon name="block" size="xs" class="q-mr-xs" />SAME CATEGORY
                        </q-badge>
                        <q-badge v-else color="orange" class="eligibility-badge-dropdown">
                          <q-icon name="warning" size="xs" class="q-mr-xs" />OTHER CATEGORY
                        </q-badge>
                        <div v-if="!patient.eligible && patient.eligibility_date" class="eligibility-info-dropdown">
                          <small>Eligible: {{ formatDate(patient.eligibility_date) }}</small>
                          <small :class="patient.same_category_ineligible ? 'text-red' : 'text-orange'">
                            {{ patient.days_remaining }} days remaining
                          </small>
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>
            </div>
          </div>

          <div class="field">
            <label>Suffix</label>
            <q-input v-model="suffixValue" dense outlined placeholder="Suffix"
              @update:model-value="checkForPatientEdits" />
          </div>
        </div>

        <div class="grid-bio">
          <div class="field">
            <label>Birthdate <span>*</span></label>
            <q-input v-model="birthdateValue" dense outlined placeholder="DD/MM/YYYY"
              :rules="[val => !!val || 'This field is required']" @update:model-value="checkForPatientEdits"
              mask="##/##/####">
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="birthdateValue" mask="DD/MM/YYYY" emit-immediately :options="dateOptions">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="field">
            <label>Age</label>
            <q-input v-model="ageValue" dense outlined placeholder="Auto-calculated" readonly />
          </div>

          <div class="field">
            <label>Sex <span>*</span></label>
            <q-select v-model="sexValue" dense outlined :options="options[0]" label="Sex"
              :rules="[val => !!val || 'This field is required']" @update:model-value="checkForPatientEdits" />
          </div>

          <div class="field">
            <label>Preference</label>
            <q-select v-model="preferenceValue" :options="dynamicPreferences.map(p => p.preference)" label="Preference"
              dense outlined @update:model-value="checkForPatientEdits" />
          </div>

          <div class="field sector-field">
            <label>Sector</label>
            <div class="sector-container">
              <div v-if="dynamicSectors.length === 0" class="text-grey-6 text-caption q-pa-sm">No sectors available</div>
              <q-checkbox v-for="sector in dynamicSectors" :key="sector.id" :val="sector.id" v-model="selectedSectorIds"
                :label="sector.sector" dense @update:model-value="checkForPatientEdits" />
            </div>
          </div>
        </div>

        <div class="grid-5">
          <div class="field">
            <label>Province</label>
            <q-input v-model="provinceValue" :hint="'Cannot be edited!'" :persistent-hint="true" dense outlined disable />
          </div>
          <div class="field">
            <label>City</label>
            <q-input v-model="cityValue" :hint="'Cannot be edited!'" :persistent-hint="true" dense outlined disable />
          </div>
          <div class="field">
            <label>Barangay <span>*</span></label>
            <q-select v-model="barangayValue" :options="options[2]" dense outlined
              :rules="[val => !!val || 'This field is required']" @update:model-value="checkForPatientEdits" />
          </div>
          <div class="field">
            <label>House Address <span>*</span></label>
            <q-input v-model="houseAddressValue" dense outlined :rules="[val => !!val || 'This field is required']"
              @update:model-value="checkForPatientEdits" />
          </div>
          <div class="field">
            <label>Phone Number <span>*</span></label>
            <q-input v-model="phoneNumberValue" dense outlined placeholder="09XXXXXXXXX" :rules="[validatePhoneNumber]"
              @update:model-value="onPhoneNumberChange" maxlength="11" hint="Format: 09XXXXXXXXX (11 digits)"
              :persistent-hint="true" @keypress="onPhoneNumberKeyPress" />
          </div>
        </div>

        <div class="section-banner">Transaction Details</div>

        <div class="grid-3">
          <div class="field">
            <label>Partner <span>*</span></label>
            <q-select v-model="partnerValue" dense outlined :options="partnerOptions"
              :rules="[val => !!val || 'This field is required']" :disable="categoryValue == null"
              :hint="categoryValue == null ? 'Must select a category before selecting a partner!' : ''"
              :persistent-hint="categoryValue == null" />
          </div>
          <div class="field" v-if="categoryValue == 'HOSPITAL'">
            <label>Hospital Bill <span>*</span></label>
            <q-input type="text" dense outlined v-model="hospitalBillDisplay" @update:model-value="onHospitalBillInput"
              @blur="finalizeHospitalBill" placeholder="0.00" :rules="[val => !!val || 'This field is required']" />
          </div>
          <div class="field">
            <label>Issued Amount <span>*</span></label>
            <q-input type="text" dense outlined v-model="issuedAmountDisplay" @update:model-value="onIssuedAmountInput"
              @blur="finalizeIssuedAmount" placeholder="0.00" :rules="[val => !!val || 'This field is required']" />
          </div>
        </div>

        <q-checkbox v-model="isChecked" class="checkbox" label="Patient is same as client?" />

        <div v-if="!isChecked">
          <div class="section-banner">Client's Name</div>
          <div class="grid-4">
            <div class="field">
              <label>Last Name <span>*</span></label>
              <q-input v-model="clientLastNameValue" dense outlined placeholder="Last Name"
                :rules="[val => !!val || 'This field is required']" />
            </div>
            <div class="field">
              <label>First Name <span>*</span></label>
              <q-input v-model="clientFirstNameValue" dense outlined placeholder="First Name"
                :rules="[val => !!val || 'This field is required']" />
            </div>
            <div class="field">
              <label>Middle Name</label>
              <q-input v-model="clientMiddleNameValue" dense outlined placeholder="Middle Name" />
            </div>
            <div class="field">
              <label>Suffix</label>
              <q-input v-model="clientSuffixValue" dense outlined placeholder="Suffix" />
            </div>
          </div>
          <div class="field full">
            <label>Relationship to patient <span>*</span></label>
            <q-input v-model="relationshipValue" dense outlined placeholder="Relationship to patient"
              :rules="[val => !!val || 'This field is required']" />
          </div>
        </div>

        <div class="actions">
          <q-btn class="btn-cancel" icon="close" label="CLOSE" @click="showCancelDialog = true" dense />
          <q-btn class="btn-save" icon="save" label="SAVE" @click="handleSaveClick" dense />
          <q-btn class="btn-print" icon="print" label="SAVE AND PRINT" @click="handleSaveAndPrintClick" dense />
        </div>
      </q-form>

      <!-- INSUFFICIENT FUNDS -->
      <q-dialog v-model="showInsufficientFundsDialog" persistent>
        <q-card style="width: 500px;">
          <q-card-section class="bg-orange-6 text-white">
            <div class="text-h6"><q-icon name="warning" size="sm" class="q-mr-sm" />Insufficient Funds Warning</div>
          </q-card-section>
          <q-card-section>
            <div class="text-subtitle1 q-mb-md">You do not have enough funds for this transaction.</div>
            <q-banner class="bg-orange-1 text-orange-9 q-mb-md">
              <template v-slot:avatar><q-icon name="account_balance_wallet" color="orange" /></template>
              <div>
                <div class="text-weight-bold text-red">Current Balance: ₱{{ formatCurrency(projectedBalance) }}</div>
              </div>
            </q-banner>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelInsufficientFunds" />
            <q-btn label="PROCEED ANYWAY" icon="check" unelevated class="dialog-cancel-btn"
              @click="proceedWithInsufficientFunds" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- PREVIOUS CATEGORIES WARNING DIALOG -->
      <q-dialog v-model="showPreviousCategoriesDialog" persistent>
        <q-card style="width: 520px;">
          <q-card-section class="bg-orange-7 text-white">
            <div class="text-h6">
              <q-icon name="history" size="sm" class="q-mr-sm" />Previous Issuances Found
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-subtitle1 q-mb-md">
              This patient has existing guarantee letters under other categories that are not yet eligible for re-issuance.
            </div>
            <q-list bordered separator>
              <q-item v-for="item in previousCategoriesData" :key="item.category">
                <q-item-section>
                  <q-item-label class="text-weight-bold text-orange-9">{{ item.category }}</q-item-label>
                  <q-item-label caption>
                    <div><strong>GL No:</strong> {{ item.gl_no }}</div>
                    <div><strong>Issued:</strong> {{ formatDate(item.issued_at) }}</div>
                    <div><strong>Eligible from:</strong> {{ formatDate(item.eligibility_date) }}</div>
                    <div class="text-orange-8"><strong>{{ item.days_remaining }} days remaining</strong></div>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="orange">
                    <q-icon name="schedule" size="xs" class="q-mr-xs" />NOT YET ELIGIBLE
                  </q-badge>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="text-body2 text-grey-8 q-mt-md">
              You may still proceed since this transaction is under a different category
              (<strong>{{ categoryValue }}</strong>).
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn label="GO BACK" icon="arrow_back" unelevated class="dialog-goback-btn"
              @click="cancelPreviousCategories" />
            <q-btn label="PROCEED" icon="check" unelevated class="dialog-cancel-btn"
              @click="proceedPreviousCategories" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!--CONFIRM DETAILS-->
      <q-dialog v-model="showConfirmDetailsDialog" persistent>
        <q-card style="width: 700px; max-width: 800px; max-height: 90vh; display: flex; flex-direction: column;">
          <q-card-section class="bg-blue-6 text-white" style="flex-shrink: 0;">
            <div class="text-h6"><q-icon name="info" size="sm" class="q-mr-sm" />Confirm Patient Information</div>
          </q-card-section>

          <q-card-section style="flex: 1; overflow-y: auto;">
            <div class="text-subtitle1 q-mb-md">Please review the patient information before proceeding.</div>

            <!-- Existing patient WITH edits: show side-by-side comparison -->
            <div v-if="selectedBrowserPatient && browserPatientEdited">
              <q-banner class="bg-orange-1 text-orange-9 q-mb-md">
                <template v-slot:avatar><q-icon name="warning" color="orange" /></template>
                You have modified the patient information. Please confirm the changes.
              </q-banner>
              <div class="comparison-container">
                <div class="patient-info-box">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm text-blue-8">
                    <q-icon name="history" size="sm" class="q-mr-xs" />Original Patient Information:
                  </div>
                  <div class="info-grid">
                    <div class="info-item">
                      <strong>Name:</strong> {{ selectedBrowserPatient.lastname }}, {{ selectedBrowserPatient.firstname }}
                      <span v-if="selectedBrowserPatient.middlename"> {{ selectedBrowserPatient.middlename }}</span>
                      <span v-if="selectedBrowserPatient.suffix"> {{ selectedBrowserPatient.suffix }}</span>
                    </div>
                    <div class="info-item"><strong>Patient ID:</strong> {{ selectedBrowserPatient.patient_id }}</div>
                    <div class="info-item"><strong>Birthdate:</strong> {{ selectedBrowserPatient.birthdate ? formatDate(selectedBrowserPatient.birthdate) : 'N/A' }}</div>
                    <div class="info-item"><strong>Sex:</strong> {{ selectedBrowserPatient.sex || 'N/A' }}</div>
                    <div class="info-item"><strong>Preference:</strong> {{ selectedBrowserPatient.preference || 'N/A' }}</div>
                    <div class="info-item"><strong>Sector:</strong> {{ originalSectorValue }}</div>
                    <div class="info-item info-item-full"><strong>Address:</strong> {{ formatAddress(selectedBrowserPatient) }}</div>
                    <div class="info-item"><strong>Phone Number:</strong> {{ formatPhoneNumber(selectedBrowserPatient.phone_number) }}</div>
                  </div>
                </div>
                <div class="comparison-arrow"><q-icon name="arrow_downward" size="lg" color="orange" /></div>
                <div class="patient-info-box highlight-changes">
                  <div class="text-subtitle2 text-weight-bold q-mb-sm text-orange-8">
                    <q-icon name="edit" size="sm" class="q-mr-xs" />New Patient Information:
                  </div>
                  <div class="info-grid">
                    <div class="info-item">
                      <strong>Name:</strong> {{ lastNameValue }}, {{ firstNameValue }}
                      <span v-if="middleNameValue"> {{ middleNameValue }}</span>
                      <span v-if="suffixValue"> {{ suffixValue }}</span>
                    </div>
                    <div class="info-item"><strong>Patient ID:</strong> {{ selectedBrowserPatient.patient_id }} (unchanged)</div>
                    <div class="info-item"><strong>Birthdate:</strong> {{ birthdateValue ? formatDate(convertToMySQLDate(birthdateValue)) : 'N/A' }}</div>
                    <div class="info-item"><strong>Sex:</strong> {{ sexValue || 'N/A' }}</div>
                    <div class="info-item"><strong>Preference:</strong> {{ preferenceValue || 'N/A' }}</div>
                    <div class="info-item"><strong>Sector:</strong> {{ sectorValue }}</div>
                    <div class="info-item info-item-full"><strong>Address:</strong> {{ houseAddressValue }}, {{ barangayValue }}, {{ cityValue }}, {{ provinceValue }}</div>
                    <div class="info-item"><strong>Phone Number:</strong> {{ formatPhoneNumber(phoneNumberValue) }}</div>
                  </div>
                </div>
              </div>
              <q-banner class="bg-blue-1 text-blue-9 q-mt-md">
                <template v-slot:avatar><q-icon name="info" color="blue" /></template>
                Updating this patient will affect Patient ID {{ selectedBrowserPatient?.patient_id }} for all future records.
              </q-banner>
            </div>

            <!-- New patient OR existing patient with NO edits: plain details -->
            <div v-else>
              <div class="patient-info-box">
                <div class="text-subtitle2 text-weight-bold q-mb-sm text-blue-8">
                  <q-icon name="person" size="sm" class="q-mr-xs" />Patient Information:
                </div>
                <div class="info-grid">
                  <div class="info-item info-item-full">
                    <strong>Name:</strong> {{ lastNameValue }}, {{ firstNameValue }}
                    <span v-if="middleNameValue"> {{ middleNameValue }}</span>
                    <span v-if="suffixValue"> {{ suffixValue }}</span>
                  </div>
                  <div class="info-item" v-if="selectedBrowserPatient"><strong>Patient ID:</strong> {{ selectedBrowserPatient.patient_id }}</div>
                  <div class="info-item"><strong>Birthdate:</strong> {{ birthdateValue ? formatDate(convertToMySQLDate(birthdateValue)) : 'N/A' }}</div>
                  <div class="info-item"><strong>Age:</strong> {{ calculateAgeFromBirthdate(birthdateValue) }}</div>
                  <div class="info-item"><strong>Sex:</strong> {{ sexValue || 'N/A' }}</div>
                  <div class="info-item"><strong>Preference:</strong> {{ preferenceValue || 'N/A' }}</div>
                  <div class="info-item"><strong>Sector:</strong> {{ sectorValue }}</div>
                  <div class="info-item info-item-full">
                    <strong>Address:</strong> {{ houseAddressValue }}, {{ barangayValue }}, {{ cityValue }}, {{ provinceValue }}
                  </div>
                  <div class="info-item"><strong>Phone Number:</strong> {{ formatPhoneNumber(phoneNumberValue) }}</div>
                </div>
              </div>
            </div>

            <!-- Transaction details (always shown) -->
            <div class="patient-info-box q-mt-md">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-green-8">
                <q-icon name="receipt" size="sm" class="q-mr-xs" />Transaction Details:
              </div>
              <div class="info-grid">
                <div class="info-item"><strong>Category:</strong> {{ categoryValue }}</div>
                <div class="info-item"><strong>Partner:</strong> {{ partnerValue }}</div>
                <div class="info-item" v-if="categoryValue === 'HOSPITAL'"><strong>Hospital Bill:</strong> ₱{{ formatCurrency(hospitalBillValue) }}</div>
                <div class="info-item"><strong>Issued Amount:</strong> ₱{{ formatCurrency(issuedAmountValue) }}</div>
              </div>
            </div>

            <!-- Client info (always shown) -->
            <div v-if="!isChecked" class="patient-info-box q-mt-md">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-purple-8">
                <q-icon name="person_outline" size="sm" class="q-mr-xs" />Client Information:
              </div>
              <div class="info-grid">
                <div class="info-item info-item-full">
                  <strong>Client Name:</strong> {{ clientLastNameValue }}, {{ clientFirstNameValue }}
                  <span v-if="clientMiddleNameValue"> {{ clientMiddleNameValue }}</span>
                  <span v-if="clientSuffixValue"> {{ clientSuffixValue }}</span>
                </div>
                <div class="info-item info-item-full"><strong>Relationship to Patient:</strong> {{ relationshipValue }}</div>
              </div>
            </div>
            <div v-else class="patient-info-box q-mt-md">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-purple-8">
                <q-icon name="person_outline" size="sm" class="q-mr-xs" />Client Information:
              </div>
              <div class="info-grid">
                <div class="info-item info-item-full"><strong>Client:</strong> Same as patient</div>
              </div>
            </div>
          </q-card-section>

          <q-separator style="flex-shrink: 0;" />
          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md" style="flex-shrink: 0;">
            <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelConfirmDetails" />
            <q-btn label="PROCEED" icon="check" unelevated class="dialog-cancel-btn" @click="proceedConfirmDetails" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!--FINAL SAVE CONFIRMATION -->
      <q-dialog v-model="showFinalSaveDialog" persistent>
        <q-card style="width: 350px">
          <q-card-section>
            <div class="text-h6">Save Changes?</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            Are you sure you want to save these changes?
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn"
              @click="showFinalSaveDialog = false; pendingAction = null" />
            <q-btn label="SAVE" icon="check" unelevated class="dialog-cancel-btn" @click="confirmFinalSave"
              :loading="areYouSureLoading" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- CANCEL CONFIRMATION DIALOG -->
      <q-dialog v-model="showCancelDialog">
        <q-card style="width: 350px">
          <q-card-section>
            <div class="text-h6">Close Form?</div>
          </q-card-section>
          <q-card-section class="q-pt-none">Are you sure you want to close? All unsaved changes will be lost.</q-card-section>
          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn unelevated icon="close" label="NO" class="dialog-goback-btn" v-close-popup />
            <q-btn unelevated icon="check" label="YES" class="dialog-cancel-btn" @click="handleCancel" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- EXISTING PATIENTS DIALOG -->
      <q-dialog v-model="showExistingDialog" persistent>
        <q-card style="width: 600px; max-width: 700px;">
          <q-card-section class="bg-blue-6 text-white">
            <div class="text-h6"><q-icon name="info" size="sm" class="q-mr-sm" />Existing Patients Found</div>
          </q-card-section>
          <q-card-section>
            <div class="text-subtitle1 q-mb-md">One or more patients with the same name already exist in the system.</div>
            <q-banner class="bg-blue-1 text-blue-9 q-mb-md">
              <template v-slot:avatar><q-icon name="help_outline" color="blue" /></template>
              Please choose whether to link this record to an existing patient or create a new patient entry.
            </q-banner>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Existing Patient(s):</div>
            <q-list bordered separator class="q-mb-md">
              <q-item v-for="patient in existingPatients" :key="patient.patient_id" clickable
                @click="selectedExistingPatient = patient"
                :active="selectedExistingPatient && selectedExistingPatient.patient_id === patient.patient_id"
                active-class="bg-blue-1">
                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ patient.lastname }}, {{ patient.firstname }}
                    <span v-if="patient.middlename"> {{ patient.middlename }}</span>
                    <span v-if="patient.suffix"> {{ patient.suffix }}</span>
                  </q-item-label>
                  <q-item-label caption>Patient ID: {{ patient.patient_id }}</q-item-label>
                  <q-item-label caption v-if="patient.gl_numbers">GL Numbers: {{ patient.gl_numbers }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon v-if="selectedExistingPatient && selectedExistingPatient.patient_id === patient.patient_id"
                    name="check_circle" color="blue" size="sm" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-separator />
          <q-card-section class="q-pt-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Choose an Action:</div>
            <div class="options-grid">
              <div class="option-card" @click="selectedAction = 'existing'"
                :class="{ 'option-selected': selectedAction === 'existing', 'option-disabled': !selectedExistingPatient }">
                <q-icon name="link" size="md" color="blue" />
                <div class="option-title">Use Existing Patient</div>
                <div class="option-description">
                  Link this record to the selected patient above. This will add a new GL record under the same Patient ID.
                  <span v-if="!selectedExistingPatient" class="text-red"> (Please select a patient first)</span>
                </div>
              </div>
              <div class="option-card" @click="selectedAction = 'new'"
                :class="{ 'option-selected': selectedAction === 'new' }">
                <q-icon name="person_add" size="md" color="green" />
                <div class="option-title">Create New Patient</div>
                <div class="option-description">Create a completely new patient with a new Patient ID. Use this if this is actually a different person.</div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md dialog-actions-sticky">
            <q-btn label="CANCEL" icon="close" unelevated class="dialog-goback-btn" @click="cancelExistingDialog" />
            <q-btn label="PROCEED" icon="check" unelevated class="dialog-cancel-btn"
              :disable="!selectedAction || (selectedAction === 'existing' && !selectedExistingPatient)"
              @click="proceedWithAction" :loading="actionLoading" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- PRINT CHOICE DIALOG -->
      <q-dialog v-model="showPrintChoiceDialog" persistent>
        <q-card style="width: 420px;">
          <q-card-section class="bg-green-7 text-white">
            <div class="text-h6"><q-icon name="print" size="sm" class="q-mr-sm" />Choose Print Type</div>
          </q-card-section>
          <q-card-section class="q-pt-md">
            <div class="text-subtitle1 q-mb-md">Record saved! What would you like to print?</div>
            <div class="options-grid">
              <div class="option-card" @click="printDetailsOnly">
                <q-icon name="article" size="md" color="green-7" />
                <div class="option-title">Details Only</div>
                <div class="option-description">Print just the patient details slip ({{ categoryValue?.toLowerCase() }}details).</div>
              </div>
              <div class="option-card" @click="printFullForm">
                <q-icon name="description" size="md" color="blue-7" />
                <div class="option-title">Entire Form</div>
                <div class="option-description">Print the complete guarantee letter form with all sections.</div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-px-md q-pb-md q-pt-md">
            <q-btn label="SKIP PRINTING" icon="close" unelevated class="dialog-goback-btn"
              @click="showPrintChoiceDialog = false; router.push('/patient-records')" />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </div>
</template>

<script setup>
import { api } from 'src/boot/axios'
const axios = api
import { ref, computed, onMounted } from 'vue'
import { date, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { toWords } from 'number-to-words'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

const router = useRouter()
const $q = useQuasar()

// ── OPTIONS ──
const categoryOptions = ['MEDICINE', 'LABORATORY', 'HOSPITAL']
const dynamicSectors = ref([])
const dynamicPreferences = ref([])
const dynamicPartners = ref([])
const preferenceOptions = computed(() => dynamicPreferences.value.map(p => p.preference))
const options = [
  ['MALE', 'FEMALE'],
  preferenceOptions,
  ["APOKON", "BINCUNGAN", "BUSAON", "CANOCOTAN", "CUAMBOGAN", "LA FILIPINA",
    "LIBOGANON", "MADAUM", "MAGDUM", "MAGUGPO EAST", "MAGUGPO NORTH",
    "MAGUGPO POBLACION", "MAGUGPO SOUTH", "MAGUGPO WEST", "MANKILAM",
    "NEW BALAMBAN", "NUEVA FUERZA", "PAGSABANGAN", "PANDAPAN", "SAN AGUSTIN",
    "SAN ISIDRO", "SAN MIGUEL (CAMP 4)", "VISAYAN VILLAGE"]
]
const selectedSectorIds = ref([])

const fetchDropdownOptions = async () => {
  try {
    const res = await axios.get('/api/all')
    dynamicPreferences.value = res.data.preferences
    dynamicPartners.value = res.data.partners
    dynamicSectors.value = res.data.sectors
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Failed to load dropdown options', position: 'top' })
  }
}
onMounted(() => { fetchDropdownOptions() })

// ── FORM REFS ──
const pdfLoading = ref(false)
const patientForm = ref(null)
const categoryValue = ref(null)
const lastNameValue = ref(null)
const firstNameValue = ref(null)
const middleNameValue = ref(null)
const suffixValue = ref(null)
const birthdateValue = ref(null)
const ageValue = computed(() => {
  if (!birthdateValue.value) return null
  const birth = dayjs(birthdateValue.value, 'DD/MM/YYYY', true)
  if (!birth.isValid() || birth.isAfter(dayjs())) return null
  return dayjs().diff(birth, 'year')
})
const sexValue = ref(null)
const preferenceValue = ref(null)
const isChecked = ref(false)
const provinceValue = ref('Davao del Norte')
const cityValue = ref('Tagum City')
const barangayValue = ref(null)
const houseAddressValue = ref(null)
const phoneNumberValue = ref(null)
const partnerValue = ref(null)
const hospitalBillValue = ref(null)
const issuedByValue = ref(JSON.parse(localStorage.getItem('user')).USERNAME)
const glNum = ref(null)
const clientLastNameValue = ref(null)
const clientFirstNameValue = ref(null)
const clientMiddleNameValue = ref(null)
const clientSuffixValue = ref(null)
const relationshipValue = ref(null)
const dateToday = ref(null)

// ── SEARCH REFS ──
const showPatientDropdown = ref(false)
const searchingPatients = ref(false)
const patientSearchResults = ref([])
const lastNameFocused = ref(false)
const firstNameFocused = ref(false)
const middleNameFocused = ref(false)
const searchDebounceTimer = ref(null)
const activeSearchField = ref(null)
const selectedBrowserPatient = ref(null)
const originalBrowserPatient = ref(null)
const usedBrowserPatient = ref(false)
const browserPatientEdited = ref(false)

// ── DIALOG REFS ──
const showInsufficientFundsDialog = ref(false)
const showPreviousCategoriesDialog = ref(false)
const showConfirmDetailsDialog = ref(false)
const showFinalSaveDialog = ref(false)
const showPrintChoiceDialog = ref(false)  // NEW: shown after save when printing
const showCancelDialog = ref(false)
const showExistingDialog = ref(false)

const actionLoading = ref(false)
const areYouSureLoading = ref(false)
const pendingAction = ref(null)
const projectedBalance = ref(0)
const existingPatients = ref([])
const selectedExistingPatient = ref(null)
const selectedAction = ref(null)
const previousCategoriesData = ref(null)  // NEW

const partnerOptions = computed(() => {
  if (!categoryValue.value) return []
  return dynamicPartners.value.filter(p => p.category === categoryValue.value).map(p => p.partner)
})

// ── AMOUNT FORMATTING ──
const hospitalBillDisplay = ref('')
const issuedAmountDisplay = ref('')
const issuedAmountValue = ref(null)

function formatWithLiveCommas(value) {
  let cleaned = value.replace(/[^\d.]/g, '')
  const dotIndex = cleaned.indexOf('.')
  if (dotIndex !== -1) cleaned = cleaned.slice(0, dotIndex + 1) + cleaned.slice(dotIndex + 1).replace(/\./g, '')
  const [integer, decimal] = cleaned.split('.')
  const formattedInteger = (integer || '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const display = decimal !== undefined ? `${formattedInteger}.${decimal.slice(0, 2)}` : formattedInteger
  return { display, numeric: parseFloat(cleaned) || 0 }
}
const onHospitalBillInput = (value) => { const { display, numeric } = formatWithLiveCommas(value); hospitalBillDisplay.value = display; hospitalBillValue.value = numeric }
const finalizeHospitalBill = () => {
  if (!hospitalBillDisplay.value) return
  const num = parseFloat(hospitalBillDisplay.value.replace(/,/g, ''))
  if (isNaN(num)) return
  hospitalBillDisplay.value = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  hospitalBillValue.value = num
}
const onIssuedAmountInput = (value) => { const { display, numeric } = formatWithLiveCommas(value); issuedAmountDisplay.value = display; issuedAmountValue.value = numeric }
const finalizeIssuedAmount = () => {
  if (!issuedAmountDisplay.value) return
  const num = parseFloat(issuedAmountDisplay.value.replace(/,/g, ''))
  if (isNaN(num)) return
  issuedAmountDisplay.value = num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  issuedAmountValue.value = num
}

// ── PHONE ──
const normalizePhoneNumber = (value) => {
  if (!value) return null
  let cleaned = value.replace(/\D/g, '')
  if (!cleaned.startsWith('09') || cleaned.length !== 11) return null
  return cleaned
}
const validatePhoneNumber = (value) => {
  if (!value) return 'Phone number is required'
  return normalizePhoneNumber(value) ? true : 'Invalid phone number. Must be 11 digits starting with 09'
}
const onPhoneNumberChange = (value) => {
  if (value) {
    const cleaned = value.replace(/\D/g, '')
    phoneNumberValue.value = cleaned
    const normalized = normalizePhoneNumber(cleaned)
    if (normalized) phoneNumberValue.value = normalized
  }
  checkForPatientEdits()
}
const onPhoneNumberKeyPress = (event) => { if ((event.which || event.keyCode) < 48 || (event.which || event.keyCode) > 57) event.preventDefault() }
const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A'
  return phone.length === 11 ? `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}` : phone
}

// ── SEARCH COMPUTED ──
// Adds same_category_ineligible flag: patient is ineligible AND their last GL was under the current category
const filteredSearchResults = computed(() => {
  const searchField = activeSearchField.value
  let searchValue = searchField === 'lastname' ? lastNameValue.value : searchField === 'firstname' ? firstNameValue.value : middleNameValue.value
  if (!searchValue || searchValue.trim().length < 2) return []
  const query = searchValue.toLowerCase().trim()
  return patientSearchResults.value
    .filter(p => {
      if (searchField === 'lastname') return (p.lastname || '').toLowerCase().startsWith(query)
      if (searchField === 'firstname') return (p.firstname || '').toLowerCase().startsWith(query)
      if (searchField === 'middlename') return (p.middlename || '').toLowerCase().startsWith(query)
      return false
    })
    .map(p => ({
      ...p,
      // Hard-blocked if ineligible AND the last GL was under the same category being issued
      same_category_ineligible: !p.eligible && p.last_category === categoryValue.value
    }))
    .sort((a, b) => {
      // Eligible first
      if (a.eligible && !b.eligible) return -1
      if (!a.eligible && b.eligible) return 1
      // Among ineligibles: other-category (selectable/orange) before same-category (blocked/red)
      if (!a.same_category_ineligible && b.same_category_ineligible) return -1
      if (a.same_category_ineligible && !b.same_category_ineligible) return 1
      return a.lastname.localeCompare(b.lastname)
    })
})

const sectorValue = computed(() => {
  if (!selectedSectorIds.value.length) return 'N/A'
  return dynamicSectors.value.filter(s => selectedSectorIds.value.includes(s.id)).map(s => s.sector).join(', ')
})

const originalSectorValue = computed(() => {
  const ids = originalBrowserPatient.value?.sector_ids || []
  if (!ids.length) return 'N/A'
  return dynamicSectors.value.filter(s => ids.includes(s.id)).map(s => s.sector).join(', ')
})

// ── HELPERS ──
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0.00'
  const num = parseFloat(amount)
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const formatDate = (dateString) => dateString ? dayjs(dateString).format('MMMM DD, YYYY') : 'N/A'
const calculateDaysRemaining = (eligibilityDate) => dayjs(eligibilityDate).startOf('day').diff(dayjs().startOf('day'), 'days')
const formatAddress = (patient) => [patient.house_address, patient.barangay, patient.city, patient.province].filter(Boolean).join(', ') || 'N/A'
const calculateAgeFromDate = (dateString) => {
  if (!dateString) return null
  const birthDate = new Date(dateString), today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}
const convertToMySQLDate = (dateString) => {
  if (!dateString) return null
  if (dateString.includes('-') && dateString.split('-').length === 3) return dateString
  const parts = dateString.split('/')
  if (parts.length !== 3) return null
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
}
const convertFromMySQLDate = (dateString) => {
  if (!dateString) return null
  const d = new Date(dateString)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
const formatPatientName = (patient) => {
  const parts = [patient.lastname, patient.firstname, patient.middlename, patient.suffix].filter(Boolean)
  return parts.length === 0 ? 'N/A' : `${parts[0]}, ${parts.slice(1).join(' ')}`
}
const calculateAgeFromBirthdate = (birthdateString) => {
  if (!birthdateString) return 'N/A'
  let birthDate
  if (birthdateString.includes('/')) { const p = birthdateString.split('/'); birthDate = new Date(`${p[2]}-${p[1]}-${p[0]}`) }
  else birthDate = new Date(birthdateString)
  if (isNaN(birthDate.getTime())) return 'N/A'
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

// ── SEARCH HANDLERS ──
const handleNameSearch = (value) => {
  if (searchDebounceTimer.value) clearTimeout(searchDebounceTimer.value)
  if (!value || value.trim().length < 2) { showPatientDropdown.value = false; patientSearchResults.value = []; return }
  searchDebounceTimer.value = setTimeout(async () => { await searchPatients(value) }, 300)
}
const onLastNameChange = (value) => { activeSearchField.value = 'lastname'; handleNameSearch(value) }
const onFirstNameChange = (value) => { activeSearchField.value = 'firstname'; handleNameSearch(value); checkForPatientEdits() }
const onMiddleNameChange = (value) => { activeSearchField.value = 'middlename'; handleNameSearch(value); checkForPatientEdits() }
const onLastNameBlur = () => { setTimeout(() => { lastNameFocused.value = false; if (!usedBrowserPatient.value) showPatientDropdown.value = false }, 200) }
const onFirstNameBlur = () => { setTimeout(() => { firstNameFocused.value = false; if (!usedBrowserPatient.value) showPatientDropdown.value = false }, 200) }
const onMiddleNameBlur = () => { setTimeout(() => { middleNameFocused.value = false; if (!usedBrowserPatient.value) showPatientDropdown.value = false }, 200) }

const searchPatients = async (query) => {
  if (!query || query.trim().length < 2) return
  searchingPatients.value = true
  try {
    const res = await axios.get('/api/patients/all-with-eligibility')
    patientSearchResults.value = res.data
    showPatientDropdown.value = true
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Failed to search patients', position: 'top' })
  } finally {
    searchingPatients.value = false
  }
}

// ── PATIENT SELECTION ──
// Same-category ineligibles are hard-blocked (disabled in template).
// Other-category ineligibles are allowed — they show orange in the dropdown and will
// trigger the previousCategoriesData warning dialog during the save flow.
const selectPatientFromDropdown = (patient) => {
  // Guard: same_category_ineligible should already be disabled in the template,
  // but we double-check here just in case.
  if (patient.same_category_ineligible) return

  selectedBrowserPatient.value = patient
  originalBrowserPatient.value = { ...patient }
  showPatientDropdown.value = false
  usedBrowserPatient.value = true
  browserPatientEdited.value = false

  lastNameValue.value = patient.lastname
  firstNameValue.value = patient.firstname
  middleNameValue.value = patient.middlename
  suffixValue.value = patient.suffix
  birthdateValue.value = convertFromMySQLDate(patient.birthdate)
  sexValue.value = patient.sex
  preferenceValue.value = patient.preference
  provinceValue.value = patient.province || 'Davao del Norte'
  cityValue.value = patient.city || 'Tagum City'
  barangayValue.value = patient.barangay
  houseAddressValue.value = patient.house_address
  phoneNumberValue.value = patient.phone_number
  selectedSectorIds.value = patient.sector_ids || []

  if (!patient.eligible) {
    $q.notify({
      type: 'warning',
      message: 'Patient is not yet eligible under their previous category but can still be issued under a different category.',
      position: 'top',
      timeout: 4000
    })
  } else {
    $q.notify({ type: 'positive', message: 'Patient information loaded. Fill in the remaining details.', position: 'top' })
  }
}

const dateOptions = (d) => d <= new Date().toISOString().split('T')[0].replace(/-/g, '/')

const checkForPatientEdits = () => {
  if (!usedBrowserPatient.value || !originalBrowserPatient.value) return
  browserPatientEdited.value =
    lastNameValue.value !== originalBrowserPatient.value.lastname ||
    firstNameValue.value !== originalBrowserPatient.value.firstname ||
    (middleNameValue.value || null) !== (originalBrowserPatient.value.middlename || null) ||
    (suffixValue.value || null) !== (originalBrowserPatient.value.suffix || null) ||
    birthdateValue.value !== convertFromMySQLDate(originalBrowserPatient.value.birthdate) ||
    sexValue.value !== originalBrowserPatient.value.sex ||
    (preferenceValue.value || null) !== (originalBrowserPatient.value.preference || null) ||
    barangayValue.value !== originalBrowserPatient.value.barangay ||
    houseAddressValue.value !== originalBrowserPatient.value.house_address ||
    JSON.stringify([...selectedSectorIds.value].sort()) !== JSON.stringify([...(originalBrowserPatient.value.sector_ids || [])].sort())
}

// ── DIALOG FLOW ──
// Order: Budget Check → Previous Categories Warning → Confirm Details → Final Save

const runBudgetCheck = async () => {
  try {
    const res = await axios.post('/api/validate-transfer', {
      year: new Date().getFullYear(),
      category: categoryValue.value,
      amount: parseFloat(issuedAmountValue.value || 0)
    })
    if (!res.data.success) {
      projectedBalance.value = res.data.breakdown.remaining
      showInsufficientFundsDialog.value = true
    } else {
      // Budget OK — move to next step
      await checkPreviousCategories()
    }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to check budget', position: 'top' })
  }
}

// Step 1b: Insufficient funds handlers
const cancelInsufficientFunds = () => {
  showInsufficientFundsDialog.value = false
  pendingAction.value = null
}
const proceedWithInsufficientFunds = async () => {
  showInsufficientFundsDialog.value = false
  // Continue to next step even though funds are low
  await checkPreviousCategories()
}

// Step 2: Check if the selected patient has non-eligible issuances in OTHER categories.
// Runs whenever a patient was selected from the browser dropdown.
// Passes exclude_category so the backend doesn't return the category we're currently issuing
// (that case is already enforced at the dropdown level via same_category_ineligible).
const checkPreviousCategories = async () => {
  if (selectedBrowserPatient.value) {
    try {
      const res = await axios.get(
        `/api/patients/${selectedBrowserPatient.value.patient_id}/previous-categories`,
        { params: { exclude_category: categoryValue.value } }
      )
      const nonEligible = res.data

      if (nonEligible && nonEligible.length > 0) {
        previousCategoriesData.value = nonEligible
        showPreviousCategoriesDialog.value = true
        return  // Pause here — user must acknowledge before continuing
      }
    } catch (err) {
      // Surface the error visibly instead of silently swallowing it
      console.error('Failed to fetch previous categories:', err)
      $q.notify({ type: 'negative', message: 'Failed to check previous category issuances. Please try again.', position: 'top' })
      return
    }
  }
  // No previous category issues (or brand-new patient) — go straight to confirm details
  showConfirmDetailsDialog.value = true
}

// Step 2 handlers
const cancelPreviousCategories = () => {
  showPreviousCategoriesDialog.value = false
  previousCategoriesData.value = null
  pendingAction.value = null
}
const proceedPreviousCategories = () => {
  showPreviousCategoriesDialog.value = false
  showConfirmDetailsDialog.value = true
}

// Step 3: Confirm Details handlers
const cancelConfirmDetails = () => {
  showConfirmDetailsDialog.value = false
  pendingAction.value = null
}
const proceedConfirmDetails = () => {
  showConfirmDetailsDialog.value = false
  showFinalSaveDialog.value = true
}

// Step 4: Final save confirmation
const confirmFinalSave = async () => {
  showFinalSaveDialog.value = false
  areYouSureLoading.value = true
  try { await doSubmit() } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to save patient record', position: 'top' })
  } finally { areYouSureLoading.value = false }
}

// Step 5: Print choice (only shown when pendingAction === 'print')
const printDetailsOnly = async () => {
  showPrintChoiceDialog.value = false
  await generatePDF(true)
  router.push('/patient-records')
}
const printFullForm = async () => {
  showPrintChoiceDialog.value = false
  await generatePDF(false)
  router.push('/patient-records')
}

const doSubmit = async () => {
  if (selectedBrowserPatient.value) {
    await submitForm(selectedBrowserPatient.value.patient_id, browserPatientEdited.value)
  } else if (selectedExistingPatient.value) {
    await submitForm(selectedExistingPatient.value.patient_id)
  } else {
    await submitForm(null)
  }
}

const checkExistingPatients = async (isPrint = false) => {
  if (!lastNameValue.value || !firstNameValue.value) return
  pendingAction.value = isPrint ? 'print' : 'save'
  await runBudgetCheck()
}

const proceedWithAction = async () => {
  if (!selectedAction.value) return
  actionLoading.value = true
  try {
    if (selectedAction.value === 'existing') await checkEligibilityAndProceed(selectedExistingPatient.value.patient_id)
    else if (selectedAction.value === 'new') { showExistingDialog.value = false; await runBudgetCheck() }
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Operation failed', position: 'top' })
  } finally { actionLoading.value = false }
}

const checkEligibilityAndProceed = async (patientId) => {
  try {
    const res = await axios.post('/api/patients/check-eligibility-by-id', { patient_id: patientId })
    if (!res.data.eligible) {
      showExistingDialog.value = false
      // This patient is ineligible under their latest category — since we're in the
      // existing dialog flow (not the browser dropdown), still block them here.
      $q.notify({
        type: 'negative',
        message: `Patient is not yet eligible. Eligible from: ${formatDate(res.data.eligibility_date)} (${res.data.days_remaining} days remaining).`,
        position: 'top',
        timeout: 6000
      })
      return
    }
    showExistingDialog.value = false
    await runBudgetCheck()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Failed to check eligibility', position: 'top' })
  }
}

const cancelExistingDialog = () => {
  showExistingDialog.value = false
  selectedExistingPatient.value = null
  selectedAction.value = null
  pendingAction.value = null
}
const handleCancel = () => { showCancelDialog.value = false; router.push('/patient-records') }

const handleSaveClick = async () => {
  const isValid = await patientForm.value.validate()
  if (!isValid) { $q.notify({ type: 'negative', message: 'Please fill in all required fields', position: 'top' }); return }
  await checkExistingPatients(false)
}
const handleSaveAndPrintClick = async () => {
  const isValid = await patientForm.value.validate()
  if (!isValid) { $q.notify({ type: 'negative', message: 'Please fill in all required fields', position: 'top' }); return }
  await checkExistingPatients(true)
}

const submitForm = async (patientId = null, updatePatientInfo = false) => {
  dateToday.value = date.formatDate(new Date(), 'YYYY-MM-DD')
  const mysqlBirthdate = convertToMySQLDate(birthdateValue.value)
  if (!mysqlBirthdate) { $q.notify({ type: 'negative', message: 'Invalid birthdate format', position: 'top' }); return }

  const formData = new FormData()
  formData.append('category', categoryValue.value)
  formData.append('lastname', lastNameValue.value)
  formData.append('firstname', firstNameValue.value)
  formData.append('middlename', middleNameValue.value || '')
  formData.append('suffix', suffixValue.value || '')
  formData.append('sector_ids', JSON.stringify(selectedSectorIds.value))
  formData.append('birthdate', mysqlBirthdate)
  formData.append('sex', sexValue.value)
  formData.append('preference', preferenceValue.value || '')
  formData.append('is_checked', isChecked.value ? 1 : 0)
  formData.append('issued_at', dateToday.value)
  formData.append('province', provinceValue.value)
  formData.append('city', cityValue.value)
  formData.append('barangay', barangayValue.value)
  formData.append('house_address', houseAddressValue.value)
  formData.append('phone_number', phoneNumberValue.value || '')
  formData.append('partner', partnerValue.value)
  formData.append('hospital_bill', hospitalBillValue.value || 0)
  formData.append('issued_amount', issuedAmountValue.value)
  formData.append('issued_by', issuedByValue.value)
  formData.append('client_lastname', clientLastNameValue.value || '')
  formData.append('client_firstname', clientFirstNameValue.value || '')
  formData.append('client_middlename', clientMiddleNameValue.value || '')
  formData.append('client_suffix', clientSuffixValue.value || '')
  formData.append('relationship', relationshipValue.value || '')
  formData.append('performed_by', issuedByValue.value)
  if (patientId) { formData.append('patient_id', patientId); if (updatePatientInfo) formData.append('update_patient_info', '1') }

  try {
    const res = await axios.post('/api/patients', formData)
    glNum.value = res.data.gl_no
    $q.notify({ type: 'positive', message: 'Patient record saved successfully', position: 'top' })
    if (pendingAction.value === 'print') {
      // Show print choice dialog — user picks details-only or full form
      showPrintChoiceDialog.value = true
    } else {
      router.push('/patient-records')
    }
  } catch (err) {
    console.error('Failed to save patient:', err)
    if (err.response?.status === 422 && err.response.data.error) {
      $q.notify({ type: 'negative', message: err.response.data.error, position: 'top', timeout: 5000 })
    } else {
      $q.notify({ type: 'negative', message: 'Failed to save patient record', position: 'top' })
    }
  }
}

const generatePDF = async (detailsOnly = false) => {
  pdfLoading.value = true
  try {
    const fullFormMap   = { MEDICINE: '/med.pdf',        LABORATORY: '/lab.pdf',        HOSPITAL: '/hosp.pdf' }
    // const detailsMap  = { MEDICINE: '/meddetails.pdf', LABORATORY: '/labdetails.pdf', HOSPITAL: '/hospdetails.pdf' }
    const detailsMap  = { MEDICINE: '/detailsonly.pdf', LABORATORY: '/detailsonly.pdf', HOSPITAL: '/detailsonly.pdf' }
    const pdfFile = detailsOnly ? detailsMap[categoryValue.value] : fullFormMap[categoryValue.value]
    const existingPdfBytes = await fetch(pdfFile).then(res => res.arrayBuffer())
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const amountWords = toWords(parseInt(issuedAmountValue.value)).toUpperCase() + ' PESOS'
    const page = pdfDoc.getPages()[0]
    page.setSize(page.getWidth(), 1200)
    page.translateContent(0, 605)
    const parsedDate = new Date(dateToday.value)
    const dayNum = parsedDate.getDate() + getDaySuffix(parsedDate.getDate())
    const monthName = parsedDate.toLocaleString('default', { month: 'long' })
    const fullNameValue = lastNameValue.value + ', ' + firstNameValue.value +
      (middleNameValue.value ? ' ' + middleNameValue.value : '') + (suffixValue.value ? ' ' + suffixValue.value : '')
    const fullAddressValue = houseAddressValue.value + ', ' + barangayValue.value + ', ' + cityValue.value + ', ' + provinceValue.value
    const clientValue = isChecked.value ? fullNameValue :
      clientLastNameValue.value + ', ' + clientFirstNameValue.value +
      (clientMiddleNameValue.value ? ' ' + clientMiddleNameValue.value : '') +
      (clientSuffixValue.value ? ' ' + clientSuffixValue.value : '') +
      ' / ' + (relationshipValue.value ? ' ' + relationshipValue.value : '')

    const draw = (text, x, y, size = 13) => page.drawText(text, { x, y, size, color: rgb(0, 0, 0), font: boldFont })
    draw(glNum.value + ' / ' + partnerValue.value, 600, 489, 14)
    draw(fullNameValue.toUpperCase(), 160, 375)
    if (ageValue.value !== null) draw(String(ageValue.value), 545, 375)
    draw(sexValue.value.toUpperCase(), 630, 375)
    draw(fullAddressValue.toUpperCase(), 120, 350)
    draw(clientValue.toUpperCase(), 70, 300)
    draw(amountWords, categoryValue.value === 'MEDICINE' ? 310 : 360, 270)
    draw(formatCurrency(issuedAmountValue.value), 340, 242, 14)
    draw(dayNum, 170, 191)
    draw(monthName.toUpperCase(), 315, 191)
    draw(issuedByValue.value.toUpperCase(), 340, 65)

    const blob = new Blob([await pdfDoc.save()], { type: 'application/pdf' })
    window.open(URL.createObjectURL(blob))
    $q.notify({ type: 'positive', message: 'PDF generated successfully', position: 'top' })
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to generate PDF', position: 'top' })
  } finally {
    pdfLoading.value = false
  }
}

function getDaySuffix(day) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) { case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd'; default: return 'th' }
}
</script>

<style scoped>
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1f8f2e;
  padding: 12px 24px;
  margin-bottom: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.form-title {
  font-size: 40px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
}

.page-wrapper {
  padding: 24px;
  background: #f5f5f5;
}

.form-card {
  margin: auto;
  background: #ffffff;
  border: 1px solid #989b98;
  border-radius: 0 0 8px 8px;
  padding: 24px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
}

.section-title {
  margin: 15px 0 10px;
  font-weight: 600;
}

.section-banner {
  background-color: #1f8f2e;
  color: white;
  font-size: 24px;
  font-weight: 700;
  padding: 12px 20px;
  border-radius: 4px;
  margin: 24px -24px 20px -24px;
  display: flex;
  align-items: center;
}

div.category {
  margin-top: 20px;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

label span {
  color: red;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: -14px;
}

.grid-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: -14px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.row-1 {
  max-width: 300px;
  margin-bottom: 14px;
}

.field {
  position: relative;
  margin-bottom: 12px;
}

.field.full {
  grid-column: 1 / -1;
}

.patient-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #2196f3;
  border-radius: 4px;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow: hidden;
}

.dropdown-header {
  background: #e3f2fd;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
  border-bottom: 1px solid #bbdefb;
  display: flex;
  align-items: center;
}

.dropdown-patient-item {
  padding: 12px;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

/* Eligible: normal hover */
.dropdown-patient-item.patient-eligible:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}

/* Same-category ineligible: hard blocked, greyed out */
.dropdown-patient-item.patient-ineligible-same-category {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: #fafafa;
}

/* Other-category ineligible: selectable, orange tint */
.dropdown-patient-item.patient-ineligible-other-category {
  cursor: pointer;
  background-color: #fff8e1;
  border-left: 3px solid #ff9800;
}

.dropdown-patient-item.patient-ineligible-other-category:hover {
  background-color: #fff3cd;
}

.patient-name-dropdown {
  font-size: 14px;
  font-weight: 600;
  color: #1f8f2e;
  margin-bottom: 4px;
}

.patient-details-dropdown {
  font-size: 11px;
  color: #666;
}

.detail-row-dropdown {
  display: flex;
  gap: 12px;
  margin-bottom: 2px;
}

.detail-row-dropdown span {
  color: #666;
}

.eligibility-badge-container-dropdown {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.eligibility-badge-dropdown {
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.eligibility-info-dropdown {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 9px;
  color: #666;
  margin-top: 2px;
}

.patient-info-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.patient-info-box.highlight-changes {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

.comparison-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comparison-arrow {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  font-size: 13px;
  color: #333;
}

.info-item strong {
  color: #1f8f2e;
}

.info-item-full {
  grid-column: 1 / -1;
}

:deep(.q-field--outlined .q-field__control) {
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  box-shadow: none !important;
}

:deep(.q-field__control:before),
:deep(.q-field__control:after) {
  display: none !important;
}

:deep(.q-field__native),
:deep(.q-field__input),
:deep(input) {
  outline: none !important;
  box-shadow: none !important;
  padding: 6px 10px;
  font-weight: 500;
}

:deep(.q-field--focused .q-field__control) {
  border-color: #9e9e9e !important;
  box-shadow: none !important;
}

:deep(.q-field--readonly .q-field__control) {
  background-color: #ededed;
  border-color: #cfcfcf;
}

:deep(.q-field--disabled .q-field__control) {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
  color: #9e9e9e;
}

:deep(.q-checkbox) {
  margin-top: -20px;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 24px;
}

.actions .q-btn {
  font-weight: 600;
  font-size: 14px;
  padding: 4px 12px;
  color: white;
}

.btn-cancel {
  background: #ff3b3b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save {
  background: #0aa64f;
}

.btn-print {
  background: #0aa64f;
}

.actions .q-btn .q-icon {
  margin-right: 6px;
}

.centered-icon {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-cancel-btn {
  background: #0aa64f !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-goback-btn {
  background: #ff3b3b !important;
  color: white !important;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 4px;
}

.dialog-cancel-btn .q-icon,
.dialog-goback-btn .q-icon {
  margin-right: 6px;
}

.dialog-actions-sticky {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e0e0e0;
  z-index: 10;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.option-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-card:hover {
  border-color: #0aa64f;
  background-color: #f5f5f5;
}

.option-selected {
  border-color: #0aa64f;
  background-color: #e8f5e9;
  border-width: 3px;
}

.option-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.option-disabled:hover {
  border-color: #e0e0e0;
  background-color: transparent;
}

.option-title {
  font-weight: 700;
  font-size: 16px;
  color: #1f8f2e;
}

.option-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.grid-bio {
  display: grid;
  grid-template-columns: 1.2fr 0.6fr 0.8fr 1fr 2fr;
  gap: 16px;
  margin-bottom: -14px;
  align-items: start;
}

.sector-field {
  grid-column: 5;
}

.sector-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 8px 10px;
  background-color: #f3f3f3;
  border: 1px solid #bdbdbd;
  border-radius: 3px;
  min-height: 36px;
  align-items: center;
}

:deep(.sector-container .q-checkbox) {
  margin-top: 0;
}

:deep(.sector-container .q-checkbox__label) {
  font-size: 13px;
  font-weight: 500;
}
@media screen and (max-width: 716px) {
  .form-header {
    padding: 8px 16px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-card {
    padding: 16px;
  }

  .section-banner {
    font-size: 16px;
    padding: 8px 16px;
    margin: 16px -16px 12px -16px;
  }

  .section-title {
    font-size: 14px;
  }

  .row-1 {
    max-width: 100%;
  }

  .grid-4 {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .grid-5 {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .grid-3 {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .grid-bio {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .sector-field {
    grid-column: 1 / -1;
  }

.actions {
  flex-direction: row;
  gap: 8px;
}

.actions .q-btn {
  flex: 1;
  width: auto;
}

  .patient-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    z-index: 9999;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item-full {
    grid-column: 1;
  }
}
@media screen and (max-width: 480px) {
  .form-header {
    padding: 8px 16px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-card {
    padding: 16px;
  }

  .section-banner {
    font-size: 16px;
    padding: 8px 16px;
    margin: 16px -16px 12px -16px;
  }

  .section-title {
    font-size: 14px;
  }

  .row-1 {
    max-width: 100%;
  }

  .grid-4 {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .grid-5 {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .grid-3 {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .grid-bio {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .sector-field {
    grid-column: 1 / -1;
  }

  .actions {
    flex-direction: row;
    gap: 8px;
  }

  .actions .q-btn {
    flex: 1;
    width: auto;
  }

  .patient-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    z-index: 9999;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item-full {
    grid-column: 1;
  }
}
</style>