<template>
  <div class="permissions-container">
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="角色管理" name="role">
          <div class="tab-header">
             <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
          </div>
          <el-table :data="roles" style="width: 100%" row-key="id">
            <el-table-column prop="name" label="角色名称" width="180" />
            <el-table-column prop="description" label="描述" />
            <el-table-column label="菜单权限">
               <template #default="{ row }">
                 <el-tag v-if="row.name === 'admin'" type="danger">所有权限</el-tag>
                 <el-tag v-else type="info">{{ row.menuIds?.length || 0 }} 个菜单</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="操作" width="250">
              <template #default="{ row }">
                <el-button link type="primary" @click="editRole(row)">编辑权限</el-button>
                <el-popconfirm title="确定删除吗？" @confirm="deleteRole(row)">
                   <template #reference>
                     <el-button link type="danger" v-if="row.name !== 'admin'">删除</el-button>
                   </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 角色编辑对话框 -->
    <el-dialog 
      v-model="roleDialogVisible" 
      :title="editingRole ? '编辑角色权限' : '添加角色'" 
      width="600px"
    >
      <el-form :model="roleForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.name" :disabled="!!editingRole && roleForm.name === 'admin'" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="roleForm.description" />
        </el-form-item>
        <el-form-item label="菜单权限">
          <div class="menu-tree-border">
            <el-tree
              ref="menuTreeRef"
              :data="menuTree"
              show-checkbox
              node-key="path"
              :props="defaultProps"
              :default-checked-keys="roleForm.menuIds"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRole">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "PermissionManagement",
  data() {
    return {
      activeTab: "role",
      roleDialogVisible: false,
      editingRole: null,
      roleForm: {
        id: "",
        name: "",
        description: "",
        menuIds: []
      },
      roles: [],
      // 模拟所有可用菜单，需要与 router/index.js 保持一致
      menuTree: [
        {
          path: "/index",
          label: "首页",
        },
        {
          path: "/permissions",
          label: "权限管理",
          children: [
             { path: "/permissions/index", label: "角色管理" },
             { path: "/permissions/user", label: "用户管理" }
          ]
        },
        {
          path: "/settings",
          label: "系统设置",
          children: [
             { path: "/settings/index", label: "系统设置" }
          ]
        },
        {
           path: "/personal",
           label: "个人中心"
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    };
  },
  mounted() {
    this.loadRoles();
  },
  methods: {
    loadRoles() {
      // 从 localStorage 加载角色配置，如果没有则初始化默认值
      let storedRoles = JSON.parse(localStorage.getItem("vab-roles") || "[]");
      
      // 初始化默认角色
      if (storedRoles.length === 0) {
        storedRoles = [
          {
            id: "1",
            name: "admin", // Admin 拥有所有权限，通常由代码特殊处理，但这里我们也存一下
            description: "超级管理员",
            menuIds: ["/index", "/permissions", "/permissions/index", "/permissions/user", "/settings", "/settings/index", "/personal"]
          },
          {
            id: "2",
            name: "editor",  // 对应 '普通用户' 或者 '编辑者'
            description: "普通用户",
            menuIds: ["/index", "/personal"] 
          }
        ];
        localStorage.setItem("vab-roles", JSON.stringify(storedRoles));
      }
      this.roles = storedRoles;
    },
    showAddRoleDialog() {
      this.editingRole = null;
      this.roleForm = {
        id: Date.now().toString(),
        name: "",
        description: "",
        menuIds: []
      };
      this.roleDialogVisible = true;
      this.$nextTick(() => {
         if (this.$refs.menuTreeRef) {
           this.$refs.menuTreeRef.setCheckedKeys([]);
         }
      });
    },
    editRole(role) {
      this.editingRole = role;
      // 深拷贝，防止直接修改
      this.roleForm = JSON.parse(JSON.stringify(role));
      this.roleDialogVisible = true;
      this.$nextTick(() => {
         if (this.$refs.menuTreeRef) {
           this.$refs.menuTreeRef.setCheckedKeys(this.roleForm.menuIds || []);
         }
      });
    },
    deleteRole(role) {
      if (role.name === 'admin') {
        this.$message.warning("超级管理员不可删除");
        return;
      }
      this.roles = this.roles.filter(r => r.id !== role.id);
      localStorage.setItem("vab-roles", JSON.stringify(this.roles));
      this.$message.success("删除成功");
    },
    saveRole() {
       // 获取选中的菜单
       const checkedKeys = this.$refs.menuTreeRef.getCheckedKeys();
       // 也要获取半选中的节点（父节点），以确保菜单能展开
       const halfCheckedKeys = this.$refs.menuTreeRef.getHalfCheckedKeys();
       const allChecked = [...checkedKeys, ...halfCheckedKeys];

       this.roleForm.menuIds = allChecked;

       if (this.editingRole) {
          const index = this.roles.findIndex(r => r.id === this.editingRole.id);
          if (index !== -1) {
            this.roles[index] = { ...this.roleForm };
          }
       } else {
          this.roles.push({ ...this.roleForm });
       }
       
       localStorage.setItem("vab-roles", JSON.stringify(this.roles));
       
       // 更新到 Permission Store 需要的格式 (Role -> MenuPaths)
       // 保存一个专门的配置供 routes.js 读取
       const roleMenuConfig = {};
       this.roles.forEach(role => {
          // 这里我们用 role.name 作为 key，因为 meta.permissions 用的是 role name
          // 注意：这里需要 mapping。系统里的用户角色通常是 "admin", "editor" 等
          // 如果用户创建了新角色 'test', 那么用户必须被分配 'test' 角色才能生效
          roleMenuConfig[role.name] = role.menuIds; 
       });
       localStorage.setItem("vab-role-menus", JSON.stringify(roleMenuConfig));

       this.$message.success("保存成功，刷新页面后生效");
       this.roleDialogVisible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.permissions-container {
  padding: 20px;
  
  .tab-header {
    margin-bottom: 20px;
  }
  
  .menu-tree-border {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px;
    max-height: 300px;
    overflow-y: auto;
  }
}
</style>