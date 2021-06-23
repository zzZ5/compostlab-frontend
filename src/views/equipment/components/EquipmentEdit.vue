<template>
  <div class="createEquipment-container">
    <sticky :z-index="10" class-name="sub-navbar draft">
      <el-button
        style="margin-left: 10px"
        @click="editForm"
      >
        {{ status }}
      </el-button>
      <el-button
        :loading="loading"
        style="margin-left: 10px"
        type="success"
        @click="submitForm"
      >
        Submit
      </el-button>
    </sticky>
    <el-form
      ref="postForm"
      :disabled="isDisabled"
      :model="postForm"
      :rules="rules"
      class="form-container"
    >
      <div class="createEquipment-main-container">
        <el-row>
          <el-col :span="24">
            <el-row>
              <el-col :span="12">
                <el-form-item
                  style="margin-bottom: 40px; margin-right: 40px"
                  prop="name"
                >
                  <MDinput
                    v-model="postForm.name"
                    :disabled="isDisabled"
                    :maxlength="100"
                    name="name"
                    required
                  >
                    Name
                  </MDinput>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  style="margin-bottom: 40px"
                  prop="abbreviation"
                >
                  <MDinput
                    v-model="postForm.abbreviation"
                    :disabled="isDisabled"
                    :maxlength="100"
                    name="abbreviation"
                    required
                  >
                    Abbreviation
                  </MDinput>
                </el-form-item>
              </el-col>
            </el-row>
            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    label-width="60px"
                    label="Type:"
                    class="postInfo-container-item"
                  >
                    <el-select v-model="postForm.type">
                      <el-option
                        v-for="(item, index) in typeOptions"
                        :key="item + index"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="10">
                  <el-form-item
                    v-if="postForm.created_time"
                    label-width="120px"
                    label="Created Time:"
                    class="postInfo-container-item"
                  >
                    {{ postForm.created_time }}
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item
          style="margin-bottom: 40px"
          label-width="70px"
          label="Descript:"
        >
          <el-input
            v-model="postForm.descript"
            :rows="1"
            type="textarea"
            class="article-textarea"
            autosize
            placeholder="Please enter the content"
          />
          <span
            v-show="contentShortLength"
            class="word-counter"
          >{{ contentShortLength }}words</span>
        </el-form-item>
        <el-form-item
          style="margin-bottom: 40px"
          label-width="70px"
          label="Sensor:"
          label-position="top"
        >
          <el-transfer
            v-model="postForm.sensor"
            v-loading="listLoading"
            :props="{
              key: 'id',
              label: 'name',
            }"
            style="text-align: left; display: inline-block"
            :titles="['Available', 'Selected']"
            :data="sensorList"
            @change="transferChange"
          >
            <el-pagination
              v-show="pagination.total_size > 0"
              slot="left-footer"
              :total="pagination.total_size"
              :current-page.sync="listQuery.page"
              :page-size.sync="listQuery.size"
              small
              layout="prev, pager, next"
              align="right"
              @current-change="getSensorList"
            />
          </el-transfer>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import { fetchEquipment, updateEquipment, createEquipment } from '@/api/equipment'
import { fetchList } from '@/api/sensor'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件

const defaultForm = {
  id: undefined,
  name: '', // 设备名
  abbreviation: '', // 设备简称
  type: '', // 设备类型
  descript: '', // 设备描述
  sensor: [], // 设备传感器
  created_time: undefined // 设备创建时间
}

export default {
  name: 'EquipmentEdit',
  components: { Sticky, MDinput },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必填项',
          type: 'error'
        })
        callback(new Error(rule.field + '为必填项'))
      } else {
        callback()
      }
    }
    return {
      isDisabled: true,
      status: 'View',
      postForm: Object.assign({}, defaultForm),
      sensorList: [],
      selectedSensor: [],
      loading: false,
      typeOptions: ['RE'],
      rules: {
        name: [{ validator: validateRequire }],
        abbreviation: [{ validator: validateRequire }],
        type: [{ validator: validateRequire }]
      },
      pagination: {
        total_size: 0
      },
      listQuery: {
        page: 1,
        size: 20
      },
      listLoading: false,
      tempRoute: {}
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.descript.length
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.equipmentId
      this.fetchData(id)
      this.status = 'Edit'
    } else {
      this.status = 'View'
      this.isDisabled = false
    }
    this.getSensorList()
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    unique(arr) {
      // 根据唯一标识id来对数组进行过滤
      const res = new Map()
      return arr.filter((arr) => !res.has(arr.id) && res.set(arr.id, 1))
    },

    getSensorList() {
      this.listLoading = true
      fetchList(this.listQuery).then((response) => {
        this.sensorList = response.data.list
        this.sensorList = [...this.sensorList, ...this.selectedSensor]
        this.sensorList = this.unique(this.sensorList)
        this.pagination = response.data.pagination
        this.listLoading = false
      })
    },
    transferChange(current, direction, move) {
      this.selectedSensor = this.sensorList.filter(function(val) {
        return current.includes(val.id)
      })
    },

    fetchData(id) {
      fetchEquipment(id)
        .then((response) => {
          this.postForm = response.data
          const temp = []
          for (const sensor of response.data.sensor) {
            this.selectedSensor.push(sensor)
            temp.push(sensor.id)
          }
          this.postForm.sensor = temp
          // set tagsview title
          this.setTagsViewTitle()
          // set page title
          this.setPageTitle()
        })
        .catch((err) => {
          console.log(err)
        })
    },
    setTagsViewTitle() {
      const title = 'Edit Equipment'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.postForm.id}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Equipment'
      document.title = `${title} - ${this.postForm.id}`
    },
    editForm() {
      if (this.status === 'Edit') {
        this.status = 'View'
        this.isDisabled = false
      } else {
        this.status = 'Edit'
        this.isDisabled = true
      }
    },
    submitForm() {
      console.log(this.postForm)
      this.$refs.postForm.validate((valid) => {
        if (valid) {
          this.isDisabled = true
          this.loading = true
          if (this.isEdit) {
            updateEquipment(this.postForm.id, this.postForm).then((response) => {
              this.editForm()
              this.$notify({
                title: 'Success',
                message: 'Updated successfully',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            createEquipment(this.postForm).then((response) => {
              this.editForm()
              this.$notify({
                title: 'Success',
                message: 'Created successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createEquipment-container {
  position: relative;

  .createEquipment-main-container {
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

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.article-textarea ::v-deep {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
