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
        v-model="listQuery.type"
        placeholder="Type"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.key"
          :label="item.display_name + '(' + item.key + ')'"
          :value="item.key"
        />
      </el-select>
      <el-select
        v-model="listQuery.ordering"
        style="width: 220px"
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
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        Search
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
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
      <el-table-column label="ID" sortable="custom" prop="id" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="60px">
        <template slot-scope="{ row }">
          <router-link :to="'/equipment/edit/' + row.id" class="link-type">
            <span class="link-type">{{ row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="Abbreviation" min-width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.abbreviation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Type" align="center" width="80">
        <template slot-scope="{ row }">
          <span> {{ row.type }} </span>
        </template>
      </el-table-column>
      <el-table-column label="Descript" min-width="200px">
        <template slot-scope="{ row }">
          <span> {{ row.descript }} </span>
        </template>
      </el-table-column>
      <el-table-column label="Created time" sortable="custom" prop="created_time" width="150px" align="center" :class-name="getSortClass('created_time')">
        <template slot-scope="{ row }">
          <span>{{ row.created_time | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="Actions"
        align="center"
        width="160"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row }">
          <el-button size="mini" style="margin-right: 10px" @click="handleEdit(row)">
            Edit
          </el-button>
          <router-link :to="{path:'/equipment/detail/' + row.id, query:{experimentId:'0'}}" class="link-type">
            <el-button size="mini" type="success"> Detail </el-button>
          </router-link>
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

    <el-dialog title="Edit" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="Name" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="Abbreviation" prop="abbreviation">
          <el-input v-model="temp.abbreviation" />
        </el-form-item>
        <el-form-item label="Type" prop="type">
          <el-select
            v-model="temp.type"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Descript">
          <el-input
            v-model="temp.descript"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel </el-button>
        <el-button
          type="primary"
          @click="updateData"
        >
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, updateEquipment } from '@/api/equipment'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const typeOptions = [{ key: 'RE', display_name: 'Reactor' }]

const typeKeyValue = typeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ListEquipment',
  components: { Pagination },
  directives: { waves },
  filters: {
    typeFilter(type) {
      return typeKeyValue[type]
    }
  },
  data() {
    return {
      list: null,
      pagination: { total_size: 0 },
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        search: undefined,
        type: undefined,
        ordering: '-created_time'
      },
      typeOptions,
      orderingOptions: [
        { label: 'ID Ascending', key: 'id' },
        { label: 'ID Descending', key: '-id' },
        { label: 'Created Time Ascending', key: 'created_time' },
        { label: 'Created Time Dscending', key: '-created_time' }
      ],
      temp: {
        name: '',
        abbreviation: 'RE',
        type: '',
        descript: ''
      },
      dialogFormVisible: false,
      rules: {
        name: [
          { required: true, message: 'name is required', trigger: 'blur' }
        ],
        abbreviation: [
          {
            required: true,
            message: 'abbreviation is required',
            trigger: 'blur'
          }
        ],
        type: [
          { required: true, message: 'type is required', trigger: 'change' }
        ],
        descript: [
          { required: true, message: 'descript is required', trigger: 'blur' }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 根据配置条件（排序、筛选等）更新table数据.
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then((response) => {
        this.list = response.data.list
        this.pagination = response.data.pagination
        this.listLoading = false
      })
    },
    // 处理筛选
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 处理排序
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
    // 处理edit按钮。
    handleEdit(row) {
      this.temp = Object.assign({}, row)
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 根据edit表中的数据更新设备信息。
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateEquipment(tempData.id, tempData).then(() => {
            const index = this.list.findIndex((v) => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 下载当前页面数据。
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = [
          'Id',
          'Name',
          'Abbreviation',
          'Type',
          'Descript',
          'Created time'
        ]
        const filterVal = [
          'id',
          'name',
          'abbreviation',
          'type',
          'descript',
          'created_time'
        ]
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'equipment-table'
        })
        this.downloadLoading = false
      })
    },
    // 将list数据稍作处理，转换成下载用的格式。
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === 'created_time') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    },
    // 处理排序标的。
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
