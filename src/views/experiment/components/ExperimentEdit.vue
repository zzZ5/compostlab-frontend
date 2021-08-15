<template>
  <div class="createExperiment-container">
    <sticky :z-index="10" class-name="sub-navbar draft">
      <el-button
        style="margin-left: 10px"
        @click="editForm"
      >
        {{ status }}
      </el-button>
      <el-button
        :loading="loading.publish"
        :disabled="isDisabled"
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

      <div class="createExperiment-main-container">
        <el-row>
          <el-col :span="24">
            <el-row>
              <el-form-item style="margin-bottom: 40px" prop="name">
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
            </el-row>
            <el-row>
              <el-form-item
                style="margin-bottom: 40px; margin-right: 40px"
                prop="site"
              >
                <MDinput
                  v-model="postForm.site"
                  :maxlength="100"
                  name="site"
                  required
                  :disabled="isDisabled"
                >
                  Site
                </MDinput>
              </el-form-item>
            </el-row>
            <el-form-item
              style="margin-bottom: 40px"
              label-width="70px"
              label="Descripy:"
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

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item
                    label-width="100px"
                    label="Begin time:"
                    class="postInfo-container-item"
                  >
                    <el-date-picker
                      v-model="postForm.begin_time"
                      type="datetime"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      placeholder="Select date and time"
                    />
                  </el-form-item>
                </el-col>

                <el-col :span="8">
                  <el-form-item
                    label-width="100px"
                    label="End time:"
                    class="postInfo-container-item"
                  >
                    <el-date-picker
                      v-model="postForm.end_time"
                      type="datetime"
                      value-format="yyyy-MM-dd HH:mm:ss"
                      placeholder="Select date and time"
                    />
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

        <el-row style="margin-top: 40px">
          <el-form-item
            style="margin-bottom: 50px"
            label-width="100px"
            label="User:"
            label-position="top"
          >
            <el-transfer
              v-model="postForm.user"
              v-loading="loading.userList"
              :props="{
                key: 'id',
                label: 'username',
              }"
              style="text-align: left; display: inline-block"
              :titles="['Available', 'Selected']"
              :data="list.user"
              @change="userTransferChange"
            >
              <el-pagination
                v-show="pagination.user.total_size > 0"
                slot="left-footer"
                :total="pagination.user.total_size"
                :current-page.sync="listQuery.user.page"
                :page-size.sync="listQuery.user.size"
                small
                layout="prev, pager, next"
                align="right"
                @current-change="getUserList"
              />
            </el-transfer>
          </el-form-item>
        </el-row>

        <el-row>
          <el-form-item
            style="margin-bottom: 40px"
            label-width="100px"
            label="Equipment:"
            label-position="top"
          >
            <el-transfer
              v-model="postForm.equipment"
              v-loading="loading.equipmentList"
              :props="{
                key: 'id',
                label: 'name',
              }"
              style="text-align: left; display: inline-block"
              :titles="['Available', 'Selected']"
              :data="list.equipment"
              :format="{
                noChecked: '${total}',
                hasChecked: '${checked}/${total}'
              }"
              @change="equipmentTransferChange"
            >
              <el-pagination
                v-show="pagination.equipment.total_size > 0"
                slot="left-footer"
                :total="pagination.equipment.total_size"
                :current-page.sync="listQuery.equipment.page"
                :page-size.sync="listQuery.equipment.size"
                small
                layout="prev, pager, next"
                align="right"
                @current-change="getEquipmentList"
              />
            </el-transfer>
          </el-form-item>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import { fetchExperiment, updateExperiment, createExperiment } from '@/api/experiment'
import { fetchList as fetchUserList } from '@/api/user'
import { fetchList as fetchEquipmentList } from '@/api/equipment'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件

const defaultForm = {
  id: undefined,
  name: '', // 实验名
  site: '', // 实验地点
  descript: '', // 实验描述
  equipment: [], // 实验设备
  created_time: undefined, // 设备创建时间
  begin_time: '',
  end_time: '',
  user: [],
  owner: '',
  status: '0'
}

export default {
  name: 'ExperimentEdit',
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
      rules: {
        name: [{ validator: validateRequire }],
        site: [{ validator: validateRequire }],
        descript: [{ validator: validateRequire }],
        begin_time: [{ validator: validateRequire }],
        end_time: [{ validator: validateRequire }]
      },
      tempRoute: {},
      list: {
        user: [],
        equipment: []
      },
      selected: {
        user: [],
        equipment: []
      },
      loading: {
        form: true,
        publish: false,
        userList: false,
        equipmentList: false
      },
      pagination: {
        user: {
          total_size: 0
        },
        equipment: {
          total_size: 0
        }
      },
      listQuery: {
        user: {
          page: 1,
          size: 20
        },
        equipment: {
          page: 1,
          size: 20
        }
      }
    }
  },
  computed: {
    contentShortLength() {
      return this.postForm.descript.length
    }
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.experimentId
      this.status = 'Edit'
      this.fetchData(id)
    } else {
      this.status = 'View'
      this.isDisabled = false
    }
    this.getUserList()
    this.getEquipmentList()

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

    getUserList() {
      this.loading.userList = true
      fetchUserList(this.listQuery.user).then((response) => {
        this.list.user = response.data.list
        this.list.user = [...this.list.user, ...this.selected.user]
        this.list.user = this.unique(this.list.user)
        this.pagination.user = response.data.pagination
        this.loading.userList = false
      })
    },
    getEquipmentList() {
      this.loading.EquipmentList = true
      fetchEquipmentList(this.listQuery.equipment).then((response) => {
        this.list.equipment = response.data.list
        this.list.equipment = [...this.list.equipment, ...this.selected.equipment]
        this.list.equipment = this.unique(this.list.equipment)
        this.pagination.equipment = response.data.pagination
        this.loading.EquipmentList = false
      })
    },
    userTransferChange(current, direction, move) {
      this.selected.user = this.list.user.filter(function(val) {
        return current.includes(val.id)
      })
    },
    equipmentTransferChange(current, direction, move) {
      this.selected.equipment = this.list.equipment.filter(function(val) {
        return current.includes(val.id)
      })
    },

    fetchData(id) {
      fetchExperiment(id)
        .then((response) => {
          this.postForm = response.data
          this.postForm.owner = response.data.owner.id
          const tempUser = []
          const tempEquipment = []
          for (const user of response.data.user) {
            this.selected.user.push(user)
            tempUser.push(user.id)
          }
          for (const equipment of response.data.equipment) {
            this.selected.equipment.push(equipment)
            tempEquipment.push(Number(equipment.id))
          }
          this.postForm.user = tempUser
          this.postForm.equipment = tempEquipment
          // set tagsview title
          this.setTagsViewTitle()
          // set page title
          this.setPageTitle()
          this.loading.form = false
        })
        .catch((err) => {
          console.log(err)
        })
    },
    setTagsViewTitle() {
      const title = 'Edit Experiment'
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.postForm.id}`
      })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    },
    setPageTitle() {
      const title = 'Edit Experiment'
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
          this.loading.publish = true
          if (this.isEdit) {
            console.log(this.postForm.begin_time)
            console.log(this.postForm.end_time)
            updateExperiment(this.postForm.id, this.postForm).then(
              (response) => {
                this.editForm()
                this.$notify({
                  title: 'Success',
                  message: 'Updated successfully',
                  type: 'success',
                  duration: 2000
                })
                this.loading.publish = false
              }
            )
          } else {
            this.postForm.owner = this.$store.getters.user_id
            createExperiment(this.postForm).then((response) => {
              this.editForm()
              this.$notify({
                title: 'Success',
                message: 'Created successfully',
                type: 'success',
                duration: 2000
              })
              this.loading.publish = false
            })
          }
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

.createExperiment-container {
  position: relative;

  .createExperiment-main-container {
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
