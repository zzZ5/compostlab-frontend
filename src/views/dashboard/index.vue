<template>
  <div class="dashboard-container">
    <component :is="currentRole" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import activeDashboard from './active'

export default {
  name: 'Dashboard',
  components: { adminDashboard, activeDashboard },
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    // 判断是否为管理员，不同身份进入不同的界面
    if (!this.roles.includes('admin')) {
      this.currentRole = 'activeDashboard'
    }
  }
}
</script>
