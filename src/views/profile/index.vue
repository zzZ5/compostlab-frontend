<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="Account" name="account">
                <account :user="user" />
              </el-tab-pane>
              <el-tab-pane label="Record" name="record">
                <record />
              </el-tab-pane>
              <!-- <el-tab-pane label="Activity" name="activity">
                <activity />
              </el-tab-pane> -->
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Account from './components/Account'
import Record from './components/Record'
// import Activity from './components/Activity'

export default {
  name: 'Profile',
  components: { UserCard, Account, Record },
  data() {
    return {
      user: {},
      activeTab: 'account'
    }
  },
  computed: {
    ...mapGetters([
      'username',
      'email',
      'user_id',
      'last_login',
      'date_joined',
      'avatar',
      'roles'
    ])
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      this.user = {
        username: this.username,
        email: this.email,
        user_id: this.user_id,
        last_login: this.last_login,
        date_joined: this.date_joined,
        avatar: this.avatar,
        role: this.roles.join(' | ')
      }
    }
  }
}
</script>
