<template>
  <experiment-list :review="true" />
</template>

<script>
import ExperimentList from './components/ExperimentList'

export default {
  name: 'ReviewExperiment',
  components: { ExperimentList }
}
</script>
