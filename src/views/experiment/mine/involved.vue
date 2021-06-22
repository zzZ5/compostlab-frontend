<template>
  <experiment-list :user="true" :user-id="userId" />
</template>

<script>
import ExperimentList from '../components/ExperimentList'

export default {
  name: 'InvolvedExperiment',
  components: { ExperimentList },
  data() {
    return {
      userId: '0'
    }
  },
  created() {
    this.getUserId()
  },
  methods: {
    getUserId() {
      this.userId = this.$store.getters.user_id
    }
  }
}
</script>
