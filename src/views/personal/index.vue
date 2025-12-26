<template>
  <div class="personal-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="user-info">
            <div class="avatar-wrapper">
              <img :src="avatar" class="user-avatar" />
            </div>
            <div class="user-header">
              <h3>{{ username }}</h3>
              <p>管理员</p>
            </div>
            <div class="user-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>账号 ID: 1001</span>
              </div>
              <div class="meta-item">
                <el-icon><Message /></el-icon>
                <span>admin@example.com</span>
              </div>
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>中国 • 北京</span>
              </div>
            </div>
            <el-divider />
            <div class="user-tags">
              <div class="tag-title">标签</div>
              <el-tag>Vue3</el-tag>
              <el-tag type="success">Element Plus</el-tag>
              <el-tag type="info">Admin</el-tag>
              <el-tag type="warning">Web</el-tag>
              <el-tag type="danger">Dashboard</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="info">
              <el-form :model="form" label-width="100px" style="max-width: 500px; margin-top: 20px">
                <el-form-item label="昵称">
                  <el-input v-model="form.nickname" />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" />
                </el-form-item>
                <el-form-item label="个人简介">
                  <el-input v-model="form.desc" type="textarea" :rows="4" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="onSubmit">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="账号安全" name="security">
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">账户密码</div>
                  <div class="security-desc">当前密码强度：强</div>
                </div>
                <el-button link type="primary">修改</el-button>
              </div>
              <el-divider />
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">密保手机</div>
                  <div class="security-desc">已绑定手机：138****8888</div>
                </div>
                <el-button link type="primary">修改</el-button>
              </div>
              <el-divider />
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">备用邮箱</div>
                  <div class="security-desc">已绑定邮箱：admin@example.com</div>
                </div>
                <el-button link type="primary">修改</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { User, Message, Location } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

defineOptions({
  name: "PersonalCenter",
});

const store = useStore();
const avatar = computed(() => store.getters["user/avatar"]);
const username = computed(() => store.getters["user/username"]);

const activeTab = ref("info");
const form = ref({
  nickname: "管理员",
  phone: "13800138000",
  email: "admin@example.com",
  desc: "一名热爱编程的前端工程师",
});

const onSubmit = () => {
  ElMessage.success("保存成功");
};
</script>

<style lang="scss" scoped>
.personal-container {
  padding: 20px;

  .user-info {
    text-align: center;

    .avatar-wrapper {
      margin: 20px 0;
      
      .user-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
      }
    }

    .user-header {
      margin-bottom: 20px;
      
      h3 {
        margin: 0 0 5px;
        font-size: 24px;
        font-weight: 500;
        color: #333;
      }
      
      p {
        margin: 0;
        color: #999;
      }
    }

    .user-meta {
      text-align: left;
      padding: 0 20px;
      
      .meta-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        color: #666;
        font-size: 14px;
        
        .el-icon {
          margin-right: 10px;
          font-size: 16px;
        }
      }
    }

    .user-tags {
      text-align: left;
      padding: 0 20px;
      
      .tag-title {
        margin-bottom: 10px;
        font-weight: 500;
        color: #333;
      }
      
      .el-tag {
        margin-right: 10px;
        margin-bottom: 10px;
      }
    }
  }

  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    
    .security-title {
      font-size: 16px;
      color: #333;
      margin-bottom: 5px;
    }
    
    .security-desc {
      font-size: 14px;
      color: #999;
    }
  }
}
</style>
