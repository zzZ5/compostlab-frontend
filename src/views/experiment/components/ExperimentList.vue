<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.search"
        placeholder="Search"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="Status"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in statusOptions"
          :key="item.key"
          :label="item.display_name + '(' + item.key + ')'"
          :value="item.key"
        />
      </el-select>
      <el-select
        v-model="listQuery.ordering"
        style="width: 230px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in orderingOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        Search
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        Add
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        Export
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        sortable="custom"
        prop="id"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Name" min-width="60px">
        <template slot-scope="{ row }">
          <router-link :to="'/experiment/detail/' + row.id" class="link-type">
            <span class="link-type">{{ row.name }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column label="Site" min-width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.site }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Descript" min-width="150px">
        <template slot-scope="{ row }">
          <span> {{ row.descript }} </span>
        </template>
      </el-table-column>

      <el-table-column label="Begin time" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.begin_time | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>

      <el-table-column label="End time" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.end_time | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Owner" align="center" width="95">
        <template slot-scope="{ row }">
          <span> {{ row.owner.username }} </span>
        </template>
      </el-table-column>

      <el-table-column label="Status" class-name="status-col" width="100">
        <template slot-scope="{ row }">
          <el-tag :type="row.status | statusTagFilter">
            {{ row.status | statusFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="Created time"
        sortable="custom"
        prop="created_time"
        width="150px"
        align="center"
        :class-name="getSortClass('created_time')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.created_time | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="Actions"
        align="center"
        width="150"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <router-link
            :to="'/experiment/edit/' + row.id"
            class="link-type"
            style="padding-right: 10px"
          >
            <el-button size="mini"> Edit </el-button>
          </router-link>

          <router-link :to="'/experiment/detail/' + row.id" class="link-type">
            <el-button size="mini" type="success"> Detail </el-button>
          </router-link>
        </template>
      </el-table-column>

      <pagination
        v-show="pagination.total_size > 0"
        :total="pagination.total_size"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.size"
        @pagination="getList"
      />
    </el-table>
  </div>
</template>

<script>
import { fetchList } from '@/api/experiment'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const statusOptions = [
  { key: '-1', display_name: 'Failed' },
  { key: '0', display_name: 'Applying' },
  { key: '1', display_name: 'Doing' },
  { key: '2', display_name: 'Done' }
]

const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ExperimentList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusTagFilter(status) {
      const statusMap = {
        '-1': 'danger',
        0: 'warning',
        1: 'success',
        2: 'info'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      return statusKeyValue[status]
    }
  },
  props: {
    owner: {
      type: Boolean,
      default: false
    },
    user: {
      type: Boolean,
      default: false
    },
    userId: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      showAll: true,
      list: null,
      pagination: { total_size: 0 },
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        owner: undefined,
        user: undefined,
        search: undefined,
        type: undefined,
        ordering: '-created_time'
      },
      statusOptions,
      orderingOptions: [
        { label: 'ID Ascending', key: 'id' },
        { label: 'ID Descending', key: '-id' },
        { label: 'Created Time Ascending', key: 'created_time' },
        { label: 'Created Time Dscending', key: '-created_time' }
      ],
      downloadLoading: false
    }
  },
  created() {
    if (this.owner) {
      this.listQuery.owner = this.userId
    }
    if (this.user) {
      this.listQuery.user = this.userId
    }
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then((response) => {
        this.list = response.data.list
        this.pagination = response.data.pagination

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id' || prop === 'created_time') {
        this.sortByProp(prop, order)
      }
    },
    sortByProp(prop, order) {
      if (order === 'descending') {
        this.listQuery.ordering = '-' + prop
      } else {
        this.listQuery.ordering = prop
      }
      this.handleFilter()
    },
    handleCreate() {
      this.$router.push({ path: '/experiment/create' })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = [
          'Id',
          'Name',
          'Site',
          'Descript',
          'Begin time',
          'End time',
          'Owner',
          'Status',
          'Created time'
        ]
        const filterVal = [
          'id',
          'name',
          'site',
          'descript',
          'begin_time',
          'end_time',
          'owner',
          'status',
          'created_time'
        ]
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'experiment-table'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === 'created_time' || j === 'begin_time' || j === 'end_time') {
            return parseTime(v[j])
          } else if (j === 'owner') {
            return v[j]['username']
          } else if (j === 'status') {
            return statusKeyValue[v[j]]
          } else {
            return v[j]
          }
        })
      )
    },
    getSortClass: function(key) {
      const sort = this.listQuery.ordering
      if (sort === `${key}`) {
        if (sort === `-${key}`) {
          return 'descending'
        } else {
          return 'ascending'
        }
      } else {
        return ''
      }
    }
  }
}
</script>
