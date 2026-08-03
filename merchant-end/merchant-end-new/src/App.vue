<script setup lang="ts">
import { onMounted } from 'vue'
import { useShopStore } from '@/stores/shop'

const shop = useShopStore()

onMounted(() => {
  // 全局拉一次店铺状态，方便侧栏/订单页联动
  shop.fetchStatus()
})
</script>

<template>
  <router-view />
</template>