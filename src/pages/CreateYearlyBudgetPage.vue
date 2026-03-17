<template>
    <YearlyBudgetField />
</template>
<script setup>
import YearlyBudgetField from 'src/components/YearlyBudgetField.vue';
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
