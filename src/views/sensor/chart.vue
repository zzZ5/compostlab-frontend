<template>
  <div class="chart-container">
    <sensor-chart height="100%" width="100%" />
  </div>
</template>

<script>
import SensorChart from './components/SensorChart'

export default {
  name: 'SensorChart',
  components: { SensorChart }
}
</script>

<style scoped>
.chart-container{
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>

