<template>
  <experiment-list :owner="true" :user-id="userId" />
</template>

<script>
import ExperimentList from '../components/ExperimentList'

export default {
  name: 'CreatedExperiment',
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
