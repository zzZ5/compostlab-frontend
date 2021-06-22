<template>
  <div class="chartConfig-container">
    <sticky :z-index="10" class-name="sub-navbar draft">
      <el-button
        :loading="loading"
        style="margin-left: 10px"
        type="success"
        @click="submitForm"
      >
        Submit
      </el-button>
    </sticky>
    <div v-loading="loading" class="chartConfig-main-container">
      <el-form label-width="80px">
        <el-form-item
          style="margin-bottom: 40px"
          label-width="150px"
          label="Equipment:"
        >
          <el-tree
            ref="tree"
            style="margin-left: 10%"
            :data="equipment"
            :props="props"
            show-checkbox
          />
        </el-form-item>
        <el-form-item
          style="margin-bottom: 40px"
          label-width="150px"
          label="Datetime interval:"
        >
          <el-date-picker
            v-model="interval"
            style="margin-left: 10%"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="to"
            start-placeholder="begin time"
            end-placeholder="end time"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item
          style="margin-bottom: 40px"
          label-width="150px"
          label="Step:"
        >
          <el-input-number
            v-model="step"
            style="margin-left: 10%"
            :min="1"
            :max="99999"
            label="step"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { fetchExperiment } from '@/api/experiment'
import Sticky from '@/components/Sticky'

export default {
  name: 'ChartConfig',
  components: { Sticky },
  data() {
    return {
      props: {
        label: 'name',
        children: 'sensor',
        isLeaf: 'leaf'
      },
      pickerOptions: {
        shortcuts: [
          {
            text: 'last week',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: 'last month',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: 'last three month',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      loading: false,
      equipment: [],
      interval: [],
      step: 1,
      experimentId: '0',
      tempRoute: {}
    }
  },
  created() {
    this.experimentId = this.$route.params && this.$route.params.experimentId
    this.fetchData(this.experimentId)
    this.tempRoute = Object.assign({}, this.$route)
    this.setTagsViewTitle()
    this.setPageTitle()
  },
  methods: {
    fetchData(id) {
      this.loading = true
      fetchExperiment(id).then((response) => {
        this.interval.push(response.data.begin_time)
        this.interval.push(response.data.end_time)
        this.equipment = response.data.equipment
        this.loading = false
      })
    },
    getCheckedNodes() {
      return this.$refs.tree.getCheckedNodes(true)
    },
    submitForm() {
      const sensor = []
      this.getCheckedNodes().forEach((element) => {
        sensor.push(element.id)
      })
      this.$router.push({
        path: '/experiment/chart/' + this.experimentId,
        query: {
          sensor: sensor,
          interval: this.interval,
          step: this.step
        }
      })
      console.log(sensor)
    },
    setTagsViewTitle() {
      const title = 'Chart Config'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title} - ${this.experimentId}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Chart Config'
      document.title = `${title} - ${this.experimentId}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.chartConfig-container {
  position: relative;

  .chartConfig-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }
}
</style>
