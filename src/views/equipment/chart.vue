<template>
  <div class="chart-container">
    <equipment-chart height="100%" width="100%" />
  </div>
</template>

<script>
import EquipmentChart from './components/EquipmentChart'

export default {
  name: 'EquipmentChart',
  components: { EquipmentChart }
}
</script>

<style scoped>
.chart-container{
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>

