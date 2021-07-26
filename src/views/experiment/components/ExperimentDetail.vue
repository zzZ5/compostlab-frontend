<template>
  <div class="experimentDetail-container">
    <sticky :z-index="10" class-name="sub-navbar draft">
      <el-button
        type="success"
        style="margin-left: 10px"
        :style="{ display: display.operateHeader }"
        @click="handleSelect('selectAll')"
      >
        Select All
      </el-button>
      <el-button
        type="primary"
        style="margin-left: 10px"
        :style="{ display: display.operateHeader }"
        @click="handleSelect('confirm')"
      >
        Confirm
      </el-button>
      <el-button
        style="margin-left: 10px"
        :style="{ display: display.operateHeader }"
        @click="handleSelect('cancel')"
      >
        Cancel
      </el-button>

      <el-button
        type="primary"
        style="margin-left: 10px"
        :style="{ display: display.mainHeader }"
        @click="handleOperate"
      >
        Operate
      </el-button>
      <el-button
        style="margin-left: 10px"
        :style="{ display: display.mainHeader }"
        @click="handleDraw"
      >
        Draw
      </el-button>
    </sticky>
    <div v-loading class="experimentDetail-main-container">
      <el-row v-loading="loading" :gutter="20" style="margin-top: 50px">
        <el-col v-for="row in list" :key="row.id" :span="6" style="min-width: 200px">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <el-checkbox
                v-model="cmd.equipment"
                :label="row.id"
                :style="{ display: display.checkbox }"
              >
                <span />
              </el-checkbox>
              <router-link
                :to="{
                  path: '/equipment/detail/' + row.id,
                  query: {
                    experimentId: experimentId,
                    begin_time: begin_time,
                    end_time: end_time,
                  },
                }"
                class="link-type"
              >
                <span class="link-type">
                  <b> {{ row.name }} </b></span>
              </router-link>
              <el-dropdown
                trigger="click"
                style="float: right; padding-top: 0px"
                @command="handleCommand"
              >
                <span class="el-dropdown-link">
                  <el-button
                    plain
                    type="text"
                    style="float: right; padding: 3px 5px"
                    icon="el-icon-more"
                  />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :command="{
                      command: 'chart',
                      equipmentId: row.id,
                      begin_time: begin_time,
                      end_time: end_time,
                    }"
                  >Chart</el-dropdown-item>
                  <el-dropdown-item
                    :command="{
                      command: 'cmd',
                      cmd: 'reset',
                      equipmentId: row.id,
                    }"
                  >Reset</el-dropdown-item>

                  <el-dropdown-item>
                    <el-dropdown
                      trigger="hover"
                      placement="right-start"
                      @command="handleCommand"
                    >
                      <span class="el-dropdown-link">
                        Heater<i class="el-icon-arrow-right el-icon--right" />
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                          :command="{
                            command: 'heater',
                            heater: 'on',
                            equipmentId: row.id,
                          }"
                        >On</el-dropdown-item>
                        <el-dropdown-item
                          :command="{
                            command: 'heater',
                            heater: 'off',
                            equipmentId: row.id,
                          }"
                        >Off</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <small style="padding-left: 5px">({{ row.abbreviation }})</small>
              <el-tag size="small" style="margin-left: 15px">
                {{ row.type }}
              </el-tag>
            </div>
            <div class="text item">
              <span>Sensors:</span>
              <div v-for="sensor in row.sensor" :key="sensor.id">
                <div style="margin: 6px 20px">
                  <router-link
                    :to="{
                      path: '/sensor/detail/' + sensor.id,
                      query: { experimentId: experimentId },
                    }"
                    class="link-type"
                  >
                    <span class="link-type">
                      <b> {{ sensor.name }} </b></span>
                  </router-link>
                  <small
                    style="padding-left: 5px"
                  >({{ sensor.abbreviation }})</small>
                  <el-tag size="small" type="success" style="margin-left: 10px">
                    {{ sensor.type }}
                  </el-tag>
                </div>
              </div>
            </div>
            <el-divider />
            <small> {{ row.descript }} </small>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog title="Command" :visible.sync="dialogFormVisible">

      <json-editor ref="jsonEditor" v-model="cmd" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel </el-button>
        <el-button type="primary" @click="confirmCmd"> Confirm </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import Sticky from '@/components/Sticky' // 粘性header组件
import { fetchExperiment } from '@/api/experiment'
import JsonEditor from '@/components/JsonEditor'
import { publicCmd as equipmentCmd } from '@/api/equipment'
import { publicCmd as experimentCmd } from '@/api/experiment'

export default {
  name: 'ExperimentDetail',
  components: { Sticky, JsonEditor },
  data() {
    return {
      cmd: {
        equipment: []
      },
      experimentId: '0',
      begin_time: '',
      operateHeader: 'none',
      end_time: '',
      list: [],
      loading: false,
      tempRoute: {},
      display: {
        checkbox: 'none',
        mainHeader: 'inline',
        operateHeader: 'none'
      },
      dialogFormVisible: false
    }
  },
  computed: {},
  created() {
    this.experimentId = this.$route.params && this.$route.params.experimentId
    this.fetchData(this.experimentId)
    this.tempRoute = Object.assign({}, this.$route)
    this.setTagsViewTitle()
    this.setPageTitle()
  },
  methods: {
    handleCommand(command) {
      if (command.command === 'chart') {
        this.$router.push({
          path: '/equipment/chart/' + command.equipmentId,
          query: {
            experimentId: this.experimentId,
            interval: [this.begin_time, this.end_time]
          }
        })
      } else {
        const data = { experiment: this.experimentId }
        if (command.command === 'cmd') {
          data['cmd'] = command.cmd
        } else if (command.command === 'heater') {
          data['heater'] = command.heater
        }
        equipmentCmd(command.equipmentId, data).then((response) => {
          this.$notify({
            // title: "Success",
            message: response.message,
            type: 'success',
            duration: 2000
          })
        })
      }
    },
    handleSelect(cmd) {
      if (cmd === 'cancel') {
        this.cmd.equipment = []
        this.display.checkbox = 'none'
        this.display.mainHeader = 'inline'
        this.display.operateHeader = 'none'
      } else if (cmd === 'selectAll') {
        this.cmd.equipment = this.list.map(item => item.id)
      } else if (cmd === 'confirm') {
        this.dialogFormVisible = true
      }
    },
    confirmCmd() {
      this.dialogFormVisible = false
      experimentCmd(this.experimentId, JSON.parse(this.cmd)).then((response) => {
        this.$notify({
          // title: "Success",
          message: response.message,
          type: 'success',
          duration: 2000
        })
      })
    },
    handleOperate() {
      this.display.checkbox = 'inline'
      this.display.mainHeader = 'none'
      this.display.operateHeader = 'inline'
    },
    handleDraw() {
      this.$router.push({ path: '/experiment/config/' + this.experimentId })
    },
    fetchData(id) {
      this.loading = true
      fetchExperiment(id).then((response) => {
        this.list = response.data.equipment
        this.begin_time = response.data.begin_time
        this.end_time = response.data.end_time
        this.loading = false
      })
    },
    setTagsViewTitle() {
      const title = 'Experiment Detail'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title} - ${this.experimentId}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Experiment Detail'
      document.title = `${title} - ${this.experimentId}`
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
