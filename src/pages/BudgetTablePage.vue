<template>
    <div class="container">
        <InitialBudgetTable />
        <SupplementaryBudgetTable />

    </div>
</template>

<script setup>
import SupplementaryBudgetTable from 'src/components/SupplementaryBudgetTable.vue';
import TransferBudgetTable from 'src/components/TransferBudgetTable.vue';
import InitialBudgetTable from 'src/components/InitialBudgetTable.vue';

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

<style scoped>
.container {
    margin-top: 20px;
    margin-left: 50px;
    margin-right: 50px;
    border: 2px solid #b5b5b5;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.08);
    border-radius: 6px;
    background: #ffffff;
}

@media (max-width: 768px) {
    .container {
        margin: 10px;
        border: none;
        box-shadow: none;
    }
}
</style>
