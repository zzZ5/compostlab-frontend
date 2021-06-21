<template>
  <div class="chart-container">
    <sticky :z-index="10" class-name="sub-navbar draft">
      <el-date-picker
        v-model="interval"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="to"
        start-placeholder="begin time"
        end-placeholder="end time"
        value-format="yyyy-MM-dd HH:mm:ss"
      />
      <el-input-number v-model="query.step" :min="1" :max="99999" label="step" />
      <el-button
        style="margin-left: 10px"
        :loading="loading"
        type="success"
        @click="submitQuery"
      >
        Submit
      </el-button>
    </sticky>
    <div class="chart-main-container">
      <div :id="id" :class="className" :style="{height:height,width:width}" />
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '../mixins/resize'
import { fetchData } from '@/api/equipment'
import Sticky from '@/components/Sticky' // 粘性header组件

export default {
  components: { Sticky },
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '200px'
    },
    height: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {
      chart: null,
      series: [],
      option: {
        legend: {
        },
        title: {
          text: ''
        },
        toolbox: {
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {},
            dataView: {}
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            animation: false
          },
          formatter(params) {
            let res = params[0].data[0] + '</br>'
            for (const i in params) {
              res += params[i].marker + params[i].seriesName + ': ' + params[i].data[1] + params[i].data[2] + '</br>'
            }
            return res
          }
        },
        grid: {
          show: true,
          containLabel: true
        },
        xAxis: {
          type: 'time',
          boundaryGap: false,
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true
          }
        },
        dataZoom: [{
          type: 'inside',
          realtime: true,
          start: 0,
          end: 100
        }, {
          start: 0,
          end: 100
        }]
      },
      pickerOptions: {
        shortcuts: [{
          text: 'last week',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: 'last month',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: 'last three month',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      loading: false,
      experimentId: '0',
      equipmentId: '0',
      interval: [],
      query: {
        experiment: '0',
        step: 1,
        count: undefined,
        begin_time: undefined,
        end_time: undefined
      },
      tempRoute: {}
    }
  },
  watch: {
    series(val) {
      if (val !== []) {
        this.chart.setOption({ series: val })
      }
    }
    // options: {
    //   handler(options) {
    //     this.chart.setOption(this.options)
    //   },
    //   deep: true
    // }
  },
  mounted() {
    this.initChart()
    this.fetchData()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  created() {
    this.experimentId = this.$route.query && this.$route.query.experimentId
    if (this.$route.query.begin_time && this.$route.query.end_time) {
      this.interval.push(this.$route.query.begin_time)
      this.interval.push(this.$route.query.end_time)
    }
    // this.query.step = this.$route.query && this.$route.query.step
    this.equipmentId = this.$route.params && this.$route.params.equipmentId
    this.query.experiment = this.experimentId
    this.tempRoute = Object.assign({}, this.$route)
    this.setTagsViewTitle()
    this.setPageTitle()
  },
  methods: {
    fetchData() {
      this.chart.showLoading()
      fetchData(this.equipmentId, this.query).then((response) => {
        const tempSeries = []
        response.data.forEach(element => {
          const series = {
            name: element.name,
            type: 'line',
            smooth: true,
            showSymbol: false,
            // hoverAnimation: false,
            data: []
          }
          element.data.forEach(i => {
            series.data.push([i.measured_time, i.value, element.unit])
          })
          tempSeries.push(series)
        })
        this.series = tempSeries
        this.chart.hideLoading()
      })
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption(this.option)
    },
    submitQuery() {
      this.loading = true
      this.query.begin_time = this.interval[0].toLocaleString()
      this.query.end_time = this.interval[1].toLocaleString()
      this.fetchData()
      this.loading = false
    },
    setTagsViewTitle() {
      const title = 'Equipment Chart'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title} - ${this.equipmentId}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Equipment Chart'
      document.title = `${title} - ${this.equipmentId}`
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.chart-container {
  position: relative;
  .chart-main-container {
    height: 90%;
  }
}
</style>
