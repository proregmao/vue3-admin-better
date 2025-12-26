<template>
  <div class="team-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchText"
              placeholder="搜索用户..."
              clearable
              style="width: 200px; margin-right: 10px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="showAddMemberDialog">添加用户</el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col 
          v-for="member in filteredMembers" 
          :key="member.id" 
          :span="6"
          style="margin-bottom: 20px"
        >
          <el-card 
            class="member-card" 
            shadow="hover"
          >
            <div class="member-click-area" @click="viewMember(member)">
              <div class="member-avatar">
                <el-avatar :size="64" :src="member.avatar" />
              </div>
              <div class="member-info">
                <h3>{{ member.name }}</h3>
                <div class="member-role-tag">
                  <el-tag :type="member.role === '管理员' ? 'danger' : ''" effect="plain">
                    {{ member.role }}
                  </el-tag>
                </div>
                <div class="member-status">
                  <el-tag :type="getStatusType(member.status)" size="small">
                    {{ getStatusText(member.status) }}
                  </el-tag>
                </div>
              </div>
            </div>
            
            <div class="member-actions">
               <el-button link type="primary" size="small" @click.stop="editMember(member)">编辑</el-button>
               <el-popconfirm
                  title="确定删除该用户吗？"
                  @confirm="deleteMember(member)"
                >
                  <template #reference>
                    <el-button link type="danger" size="small" @click.stop v-if="member.name !== 'admin'">删除</el-button>
                  </template>
                </el-popconfirm>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    
    <!-- 添加/编辑成员对话框 -->
    <el-dialog 
      v-model="memberDialogVisible" 
      :title="editingMember ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form
        ref="memberFormRef"
        :model="memberForm"
        :rules="memberRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="name">
          <el-input v-model="memberForm.name" :disabled="!!editingMember && memberForm.name === 'admin'" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="memberForm.role" style="width: 100%">
            <el-option label="普通用户" value="普通用户" />
            <el-option label="管理员" value="管理员" />
          </el-select>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="memberForm.email" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="memberForm.phone" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="memberForm.status" style="width: 100%">
            <el-option label="在线" value="online"></el-option>
            <el-option label="离线" value="offline"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="头像">
           <el-upload
            class="avatar-uploader"
            action=""
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
          >
            <img 
              v-if="memberForm.avatar" 
              :src="memberForm.avatar" 
              class="avatar" 
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="memberDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMember">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 成员详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="用户详情"
      width="400px"
    >
      <div class="detail-container">
        <div class="detail-avatar">
          <el-avatar :size="80" :src="detailMember.avatar" />
        </div>
        <div class="detail-info">
           <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ detailMember.name }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ detailMember.role }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ detailMember.email }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detailMember.phone }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(detailMember.status)">
                {{ getStatusText(detailMember.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="editMember(detailMember)">编辑</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search, Plus } from "@element-plus/icons-vue";

export default {
  name: "UserManagement",
  components: {
    Search,
    Plus
  },
  data() {
    return {
      searchText: "",
      memberDialogVisible: false,
      detailDialogVisible: false,
      editingMember: null,
      members: [],
      memberForm: {
        name: "",
        email: "",
        role: "普通用户",
        phone: "",
        status: "online",
        avatar: ""
      },
      detailMember: {},
      memberRules: {
        name: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        role: [
          { required: true, message: "请选择角色", trigger: "change" }
        ]
      }
    };
  },
  mounted() {
    this.loadMembers();
  },
  computed: {
    filteredMembers() {
      if (!this.searchText) {
        return this.members;
      }
      return this.members.filter(member => 
        member.name.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  },
  methods: {
    loadMembers() {
      let localUsers = JSON.parse(localStorage.getItem("vab-users") || "[]");
      
      const hasAdmin = localUsers.some(u => u.username === "admin");
      if (!hasAdmin) {
        const adminUser = {
          username: "admin",
          password: "123456",
          createTime: new Date().toISOString(),
          email: "admin@example.com",
          role: "管理员",
          phone: "13800138000",
          status: "online",
          avatar: "https://i.gtimg.cn/club/item/face/img/2/15922_100.gif"
        };
        localUsers.unshift(adminUser);
        localStorage.setItem("vab-users", JSON.stringify(localUsers));
      }

      this.members = localUsers.map((user, index) => ({
        id: user.createTime || index,
        name: user.username,
        email: user.email || "",
        role: user.role || "普通用户",
        phone: user.phone || "",
        status: user.status || "online",
        avatar: user.avatar || "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
        password: user.password
      }));
    },
    getStatusText(status) {
      const statusMap = {
        "online": "在线",
        "offline": "离线"
      };
      return statusMap[status] || status;
    },
    getStatusType(status) {
      return status === "online" ? "success" : "info";
    },
    showAddMemberDialog() {
      this.editingMember = null;
      this.memberForm = {
        name: "",
        email: "",
        role: "普通用户",
        phone: "",
        status: "online",
        avatar: ""
      };
      this.memberDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.memberFormRef.resetFields();
      });
    },
    editMember(member) {
      this.editingMember = member;
      this.memberForm = { ...member };
      this.memberDialogVisible = true;
      this.detailDialogVisible = false;
    },
    viewMember(member) {
      this.detailMember = { ...member };
      this.detailDialogVisible = true;
    },
    deleteMember(member) {
      if (member.name === 'admin') {
         this.$message.warning("超级管理员不能删除");
         return;
      }
      
      let localUsers = JSON.parse(localStorage.getItem("vab-users") || "[]");
      const newUsers = localUsers.filter(u => u.username !== member.name);
      localStorage.setItem("vab-users", JSON.stringify(newUsers));
      this.$message.success("删除成功");
      this.loadMembers();
    },
    saveMember() {
      this.$refs.memberFormRef.validate((valid) => {
        if (valid) {
          let updatedUsers = JSON.parse(localStorage.getItem("vab-users") || "[]");

          if (this.editingMember) {
            // 编辑
            const userIndex = updatedUsers.findIndex(u => u.username === this.editingMember.name);
            if (userIndex !== -1) {
              updatedUsers[userIndex] = {
                ...updatedUsers[userIndex],
                username: this.memberForm.name,
                email: this.memberForm.email,
                role: this.memberForm.role,
                phone: this.memberForm.phone,
                status: this.memberForm.status,
                avatar: this.memberForm.avatar
              };
            }
             this.$message.success("更新成功");
          } else {
             // 新增 (查重)
             if (updatedUsers.some(u => u.username === this.memberForm.name)) {
                this.$message.error("用户名已存在");
                return;
             }

            updatedUsers.push({
              username: this.memberForm.name,
              password: "123456",
              createTime: new Date().toISOString(),
              email: this.memberForm.email,
              role: this.memberForm.role,
              phone: this.memberForm.phone,
              status: this.memberForm.status,
              avatar: this.memberForm.avatar || "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            });
            this.$message.success("添加成功(默认密码: 123456)");
          }
          
          localStorage.setItem("vab-users", JSON.stringify(updatedUsers));
          this.memberDialogVisible = false;
          this.loadMembers();
        }
      });
    },
    handleAvatarChange(file) {
      this.memberForm.avatar = URL.createObjectURL(file.raw);
    }
  }
};
</script>

<style lang="scss" scoped>
.team-container {
  padding: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
  }
  
  .member-card {
    transition: transform 0.2s;
    position: relative;
    
    &:hover {
      transform: translateY(-5px);
    }

    .member-click-area {
      cursor: pointer;
    }
    
    .member-avatar {
      text-align: center;
      margin: 15px 0;
      
      .online-indicator {
        position: absolute;
        width: 16px;
        height: 16px;
        background-color: #67C23A;
        border-radius: 50%;
        border: 2px solid white;
        bottom: 0;
        right: 8px;
        display: none; // 简化显示
      }
    }
    
    .member-info {
      text-align: center;
      
      h3 {
        margin: 0 0 10px;
        font-size: 16px;
      }
      
      .member-role-tag {
        margin-bottom: 8px;
      }

      .member-status {
        margin-top: 5px;
      }
    }

    .member-actions {
      border-top: 1px solid #f0f0f0;
      margin-top: 15px;
      padding-top: 10px;
      text-align: center;
      display: flex;
      justify-content: space-around;
    }
  }
  
  .detail-avatar {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .avatar-uploader .avatar {
    width: 100px;
    height: 100px;
    display: block;
    border-radius: 50%;
    object-fit: cover;
  }
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}
</style>