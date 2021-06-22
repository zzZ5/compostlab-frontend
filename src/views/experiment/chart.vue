<template>
  <div class="chart-container">
    <experiment-chart height="100%" width="100%" />
  </div>
</template>

<script>
import ExperimentChart from './components/ExperimentChart'

export default {
  name: 'LineChart',
  components: { ExperimentChart }
}
</script>

<style scoped>
.chart-container{
  position: relative;
  width: 100%;
  height: calc(100vh - 84px);
}
</style>

