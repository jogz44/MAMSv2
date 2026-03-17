<template>
  <div class="relative-position">

    <q-btn to="/budget-table" icon="close" flat round text-color="red" size="large" class="absolute-top-right"
      style="z-index: 1; margin-top: -20px; margin-right: -20px;" />

    <AddSupplementaryBonusField />

  </div>
</template>

<script setup>
import AddSupplementaryBonusField from 'src/components/AddSupplementaryBonusField.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const data = JSON.parse(sessionStorage.getItem('user'))
const role = data.ROLE
const router = useRouter()

onMounted(() => {
  if (role !== 'HEAD' && role !== 'ADMIN') {
    router.push('/error')
  }
})
</script>
