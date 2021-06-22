<template>
  <experiment-edit :is-edit="true" />
</template>

<script>
import ExperimentEdit from './components/ExperimentEdit'

export default {
  name: 'EditExperiment',
  components: { ExperimentEdit }
}
</script>
