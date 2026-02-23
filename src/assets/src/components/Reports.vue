<template>
  <div
    class="toolbar-wrapper"
    :class="currentViewClass"
  >
    <div class="head">
      <span class="title">{{ titleText }}</span>

      <div class="tabs">
        <q-btn
          label="GENERAL SUMMARY"
          class="q-ml-lg tab-btn"
          @click="setView(GeneralSummary, 'GENERAL SUMMARY', 'general-summary-view')"
        />
        <q-btn
          label="BUDGET SUMMARY"
          class="q-ml-sm tab-btn"
          @click="setView(BudgetSummary, 'BUDGET SUMMARY', 'budget-summary-view')"
        />
      </div>
    </div>

    <br />

    <component :is="currentComponent" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

import GeneralSummary from './GeneralSummary.vue'
import BudgetSummary from './BudgetSummary.vue'

// defaults
const currentComponent = ref(GeneralSummary)
const titleText = ref('GENERAL SUMMARY')
const currentViewClass = ref('general-summary-view')

function setView(component, title, viewClass) {
  currentComponent.value = component
  titleText.value = title
  currentViewClass.value = viewClass
}
</script>

<style scoped>
/* ===============================
   SHARED STYLES
================================ */
.toolbar-wrapper {
  width: 100%;
}

.head {
  border-radius: 5px 5px 0 0;
  border: 2px solid grey;
  font-size: 33px;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: right;
background-color: #1f8f2e;
  width: 100%;
  padding: 5px 10px;
  margin-bottom: -73px;
}

.title {
  width: 400px;
}

.tabs {
  display: flex;
  margin-left: auto;
  padding: 10px 5px;
}

.tab-btn {
  background: #0aa64f;
  color: #ffffff;
  font-weight: 600;
}

/* ===============================
   GENERAL SUMMARY STYLES
   (edit freely)
================================ */
.general-summary-view {
  background-color: #f0fdf4;
}

.general-summary-view .head {
  background-color: #1f8f2e;
}

/* ===============================
   BUDGET SUMMARY STYLES
   (edit freely)
================================ */
.budget-summary-view {
  background-color: #fff7ed;
}

.budget-summary-view .head {
 background-color: #1f8f2e;
}
@media screen and (max-width: 480px) {
  .head {
    font-size: 20px;
    padding: 5px 8px;
    margin-bottom: -60px;
  }

  .title {
    width: auto;
    font-size: 18px;
  }

  .tabs {
    padding: 6px 4px;
    gap: 4px;
  }

  .tab-btn {
    font-size: 10px;
    padding: 4px 6px;
  }

  .tab-btn :deep(.q-btn__content) {
    font-size: 10px;
  }
}
</style>
