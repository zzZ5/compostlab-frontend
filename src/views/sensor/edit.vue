<template>
  <sensor-edit :is-edit="true" />
</template>

<script>
import SensorEdit from './components/SensorEdit'

export default {
  name: 'EditSensor',
  components: { SensorEdit }
}
</script>
