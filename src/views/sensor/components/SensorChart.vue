<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import resize from '../mixins/resize'
import { fetchData } from '@/api/sensor'

export default {
  name: 'SensorChart',
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
      experimentId: '0',
      sensorId: '0',
      query: {
        experiment: '0',
        step: 60,
        size: 999999,
        begin_time: undefined,
        end_time: undefined
      },
      loading: false,
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
    this.sensorId = this.$route.params && this.$route.params.sensorId
    this.query.experiment = this.experimentId
    this.tempRoute = Object.assign({}, this.$route)
    this.setTagsViewTitle()
    this.setPageTitle()
  },
  methods: {
    fetchData() {
      this.chart.showLoading()
      fetchData(this.sensorId, this.query).then((response) => {
        const tempSeries = []
        const data = response.data
        const series = {
          name: data.abbreviation,
          type: 'line',
          smooth: true,
          showSymbol: false,
          // hoverAnimation: false,
          data: []
        }
        data.list.forEach(i => {
          series.data.push([i.measured_time, i.value])
        })
        console.log(series)
        tempSeries.push(series)
        this.series = tempSeries
        this.chart.hideLoading()
      })
    },
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      this.chart.setOption(this.option)
    },
    setTagsViewTitle() {
      const title = 'Sensor Chart'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title} - ${this.sensorId}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Sensor Chart'
      document.title = `${title} - ${this.sensorId}`
    }
  }
}
</script>
