<template>
  <div>
    <!-- <img src="nav.svg" class="emptyGif"> -->
    <img :src="logo" class="emptyGif">
  </div>
</template>

<script>
import logo from '@/assets/logo_images/logo.svg'

export default {
  name: 'DashboardAdmin',
  data() {
    return {
      logo: logo
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.emptyGif {
    display: block;
    width: 80%;
    padding-top: 120px;
    margin: 0 auto;
  }
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
