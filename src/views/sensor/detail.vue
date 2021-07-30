<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="filter-container">
        <el-button
          v-waves
          :loading="downloadLoading"
          class="filter-item"
          style="margin-left: 10px"
          type="primary"
          icon="el-icon-download"
          @click="handleDownload('thisPage')"
        >
          Export This Page
        </el-button>
        <el-button
          v-waves
          :loading="downloadLoading"
          class="filter-item"
          style="margin-left: 10px"
          type="primary"
          icon="el-icon-download"
          @click="handleDownload('all')"
        >
          Export All Data
        </el-button>

      </div>
      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >

        <el-table-column label="Value" min-width="100px">
          <template slot-scope="{ row }">
            <span>{{ row.value }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Unit" min-width="100px" align="center">
          <template slot-scope="{ row }">
            <span>{{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Measured Time" min-width="120px">
          <template slot-scope="{ row }">
            <span> {{ row.measured_time }} </span>
          </template>
        </el-table-column>

      </el-table>
      <pagination
        v-show="pagination.total_size > 0"
        :total="pagination.total_size"
        :page.sync="listQuery.page"
        :size.sync="listQuery.size"
        @pagination="getList"
      />
    </div>
  </div>
</template>

<script>
import { fetchData } from '@/api/sensor'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'DetailSensor',
  components: { Pagination },
  directives: { waves },
  filters: {
  },
  props: {
  },
  data() {
    return {
      list: null,
      unit: null,
      downloadList: null,
      pagination: { total_size: 0 },
      listLoading: true,
      listQuery: {
        experiment: '0',
        page: 1,
        size: 100,
        step: 1
      },
      downloadLoading: false,
      experimentId: '0',
      sensorId: '0',
      tempRoute: {}
    }
  },
  created() {
    this.experimentId = this.$route.query && this.$route.query.experimentId
    this.listQuery.experiment = this.experimentId
    this.sensorId = this.$route.params && this.$route.params.sensorId
    this.getList()
    this.tempRoute = Object.assign({}, this.$route)
    this.setTagsViewTitle()
    this.setPageTitle()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchData(this.sensorId, this.listQuery).then((response) => {
        const unit = response.data.unit
        this.list = response.data.list
        this.list.forEach(element => {
          element['unit'] = unit
        })
        this.pagination = response.data.pagination
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    export2Excel() {
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = [
          'Value',
          'Unit',
          'Measured time'
        ]
        const filterVal = [
          'value',
          'unit',
          'measured_time'
        ]
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'data-table'
        })
      })
    },
    handleDownload(arg) {
      this.downloadLoading = true
      if (arg === 'thisPage') {
        this.downloadList = this.list
        this.export2Excel()
      } else {
        fetchData(this.sensorId, {
          experiment: this.experimentId,
          page: 1,
          size: 999999,
          step: 1
        }).then((response) => {
          const unit = response.data.unit
          this.downloadList = response.data.list
          this.downloadList.forEach(element => {
            element['unit'] = unit
          })
          this.export2Excel()
        })
      }
      this.downloadLoading = false
    },
    formatJson(filterVal) {
      return this.downloadList.map((v) =>
        filterVal.map((j) => {
          if (j === 'measured_time') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    },
    setTagsViewTitle() {
      const title = 'Sensor Detail'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title} - ${this.sensorId}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Sensor Detail'
      document.title = `${title} - ${this.sensorId}`
    }
  }
}
</script>
