<template>
  <div class="experimentDetail-container">
    <div class="experimentDetail-main-container">
      <el-row v-loading="loading" :gutter="20" style="margin-top: 50px">
        <el-col v-for="row in list" :key="row.id" :span="6" style="min-width: 200px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <div v-if="experimentId==='0'">
                <b> {{ row.name }} </b>
                <small style="padding-left: 5px">({{ row.abbreviation }})</small>
                <el-tag size="small" style="margin-left: 15px"> {{ row.type }} </el-tag>
              </div>
              <div v-else>
                <router-link :to="{path:'/sensor/detail/' + row.id, query:{experimentId:experimentId}}" class="link-type">
                  <span class="link-type">
                    <b> {{ row.name }} </b>
                  </span>
                </router-link>
                <el-dropdown trigger="click" style="float: right; padding-top: 0px" @command="handleCommand">
                  <span class="el-dropdown-link">
                    <el-button
                      plain
                      type="text"
                      style="float: right; padding: 3px 5px"
                      icon="el-icon-more"
                    />
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="{command:'chart', sensorId: row.id}">Chart</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <small style="padding-left: 5px">({{ row.abbreviation }})</small>
                <el-tag size="small" style="margin-left: 15px"> {{ row.type }} </el-tag>
              </div>
            </div>
            <div class="text item">
              <span>{{ row.descript }}</span>
              <el-divider />
              <small>
                <div style="margin-bottom:5px">
                  <b>key: </b>
                  <span> {{ row.key }} </span>
                </div>
              </small>

              <small>
                <div style="margin-bottom:5px">
                  <b>Latest data:</b>
                  <span> {{ row.data_latest.value }} </span>
                  <span> {{ row.data_latest.unit }} </span>
                </div>
                <div>
                  <b>Time</b>
                  <span> {{ row.data_latest.measured_time }} </span>
                </div>
              </small>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { fetchEquipment } from '@/api/equipment'

export default {
  name: 'EquipmentDetail',
  components: {},
  data() {
    return {
      experimentId: '0',
      equipmentId: '0',
      list: [],
      loading: false,
      tempRoute: {}
    }
  },
  computed: {},
  created() {
    this.experimentId = this.$route.query && this.$route.query.experimentId
    this.equipmentId = this.$route.params && this.$route.params.equipmentId
    this.fetchData(this.equipmentId)
    this.tempRoute = Object.assign({}, this.$route)
    this.setTagsViewTitle()
    this.setPageTitle()
  },
  methods: {
    handleCommand(command) {
      if (command.command === 'chart') {
        this.$router.push({ path: '/sensor/chart/' + command.sensorId, query: { experimentId: this.experimentId }})
      }
    },
    fetchData(id) {
      this.loading = true
      fetchEquipment(id).then((response) => {
        this.list = response.data.sensor
        this.loading = false
      })
    },
    setTagsViewTitle() {
      const title = 'Equipment Detail'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title} - ${this.equipmentId}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Equipment Detail'
      document.title = `${title} - ${this.equipmentId}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.experimentDetail-container {
  position: relative;

  .experimentDetail-main-container {
    padding: 0px 45px 20px 50px;
  }
}
.box-card {
  margin-bottom: 10px;
}
</style>
