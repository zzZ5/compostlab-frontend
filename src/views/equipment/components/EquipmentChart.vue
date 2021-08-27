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
      <el-input-number
        v-model="query.step"
        :min="1"
        :max="99999"
        label="step"
      />
      <el-button
        style="margin-left: 10px"
        type="primary"
        :loading="loading"
        @click="handleDialog"
      >
        Custom Option
      </el-button>
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
      <div
        :id="id"
        :class="className"
        :style="{ height: height, width: width }"
      />
    </div>

    <el-dialog title="Option" :visible.sync="dialogFormVisible">
      <div slot="title" class="header-title">
        <span>
          <span style="font-size: 22px">Option  </span>
          <el-link
            type="primary"
            href="https://echarts.apache.org/zh/option.html"
            target="_blank"
          >参考文档</el-link>
        </span>
      </div>
      <json-editor ref="jsonEditor" v-model="tempOption" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel </el-button>
        <el-button type="primary" @click="handleCustom"> Confirm </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '../mixins/resize'
import { fetchData } from '@/api/equipment'
import JsonEditor from '@/components/JsonEditor'
import Sticky from '@/components/Sticky' // 粘性header组件

export default {
  naem: 'EquipmentChart',
  components: { Sticky, JsonEditor },
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
        legend: {},
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
              res +=
                params[i].marker +
                params[i].seriesName +
                ': ' +
                params[i].data[1] +
                params[i].data[2] +
                '</br>'
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
        dataZoom: [
          {
            type: 'inside',
            realtime: true,
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100
          }
        ]
      },
      tempOption: {},
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
      dialogFormVisible: false,
      loading: false,
      experimentId: '0',
      equipmentId: '0',
      interval: [],
      query: {
        experiment: '0',
        step: 60,
        count: undefined,
        begin_time: undefined,
        end_time: undefined
      },
      tempRoute: {}
    }
  },
  watch: {
    // 监控series的变化，并根据变化更新图表。
    series(val) {
      if (val !== []) {
        this.chart.setOption({ series: val })
      }
    }
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
    // 获取图表初始参数。
    this.experimentId = this.$route.query && this.$route.query.experimentId
    // this.interval = this.$route.query && this.$route.query.interval
    // this.query.step = this.$route.query && this.$route.query.step
    this.equipmentId = this.$route.params && this.$route.params.equipmentId
    this.query.experiment = this.experimentId
    this.tempRoute = Object.assign({}, this.$route)
    this.setTagsViewTitle()
    this.setPageTitle()
    this.tempOption = this.option
  },
  methods: {
    fetchData() {
      this.chart.showLoading()
      fetchData(this.equipmentId, this.query).then((response) => {
        const tempSeries = [
          {},
          {
            type: 'custom',
            name: 'error',
            itemStyle: {
              normal: {
                borderWidth: 1.5
              }
            },
            renderItem: this.renderItem,
            encode: {
              x: 0,
              y: [1, 2]
            },
            data: [],
            z: 100
          }]
        const element = response.data
        this.interval = [element.begin_time, element.end_time]
        const series = {
          name: element.abbreviation,
          type: 'line',
          smooth: true,
          showSymbol: false,
          // hoverAnimation: false,
          data: []
        }
        element.data.forEach((i) => {
          series.data.push([i[0], i[1], element.unit])
        })
        tempSeries[0] = series

        tempSeries[1].data = element.data

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
    handleDialog() {
      this.dialogFormVisible = true
    },
    handleCustom() {
      this.option = JSON.parse(this.tempOption)
      this.chart.setOption(this.option)
      this.dialogFormVisible = false
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
    },
    renderItem(params, api) {
      var xValue = api.value(0)
      var highPoint = api.coord([xValue, api.value(2)])
      var lowPoint = api.coord([xValue, api.value(3)])
      var halfWidth = api.size([1, 0])[0] * 0.1
      var style = api.style({
        stroke: api.visual('color'),
        fill: null
      })

      return {
        type: 'group',
        children: [{
          type: 'line',
          transition: ['shape'],
          shape: {
            x1: highPoint[0] - halfWidth, y1: highPoint[1],
            x2: highPoint[0] + halfWidth, y2: highPoint[1]
          },
          style: style
        }, {
          type: 'line',
          transition: ['shape'],
          shape: {
            x1: highPoint[0], y1: highPoint[1],
            x2: lowPoint[0], y2: lowPoint[1]
          },
          style: style
        }, {
          type: 'line',
          transition: ['shape'],
          shape: {
            x1: lowPoint[0] - halfWidth, y1: lowPoint[1],
            x2: lowPoint[0] + halfWidth, y2: lowPoint[1]
          },
          style: style
        }]
      }
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
