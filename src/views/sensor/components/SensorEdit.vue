<template>
  <div class="createSensor-container">
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
      <div class="createSensor-main-container">
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
                    :maxlength="100"
                    name="name"
                    required
                    :disabled="isDisabled"
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
                    :maxlength="100"
                    name="abbreviation"
                    required
                    :disabled="isDisabled"
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
                <el-col :span="8">
                  <el-form-item
                    label-width="60px"
                    label="Unit:"
                    class="postInfo-container-item"
                  >
                    <el-select v-model="postForm.unit">
                      <el-option
                        v-for="(item, index) in unitOptions"
                        :key="item + index"
                        :label="item"
                        :value="item"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
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
      </div>
    </el-form>
  </div>
</template>

<script>
import { fetchSensor, updateSensor, createSensor } from '@/api/sensor'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件

const defaultForm = {
  id: undefined,
  name: '', // 传感器名
  abbreviation: '', // 传感器简称
  type: '', // 传感器类型
  unit: '', // 传感器单位
  descript: '', // 传感器描述
  equipment: '', // 传感器所属的设备
  created_time: undefined // 传感器创建时间
}

export default {
  name: 'SensorEdit',
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
      loading: false,
      typeOptions: ['T', 'H', 'CO2'],
      unitOptions: ['℃', '%', 'ppm'],
      rules: {
        name: [{ validator: validateRequire }],
        abbreviation: [{ validator: validateRequire }],
        type: [{ validator: validateRequire }],
        unit: [{ validator: validateRequire }]
      },
      pagination: {
        total_size: 0
      },
      listQuery: {
        page: 1,
        size: 20
      },
      listLoading: false,
      sensorId: '0',
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
      this.sensorId = this.$route.params && this.$route.params.sensorId
      this.fetchData(this.sensorId)
      this.status = 'Edit'
    } else {
      this.status = 'View'
      this.isDisabled = false
    }
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route)
  },
  methods: {
    fetchData(id) {
      fetchSensor(id)
        .then((response) => {
          this.postForm = response.data
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
      const title = 'Edit Sensor'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.postForm.id}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Sensor'
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
      this.$refs.postForm.validate((valid) => {
        if (valid) {
          this.isDisabled = true
          this.loading = true
          if (this.isEdit) {
            updateSensor(this.postForm.id, this.postForm).then((response) => {
              this.editForm()
              this.$notify({
                title: 'Success',
                message: 'Updated successfully',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            createSensor(this.postForm).then((response) => {
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

.createSensor-container {
  position: relative;

  .createSensor-main-container {
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
