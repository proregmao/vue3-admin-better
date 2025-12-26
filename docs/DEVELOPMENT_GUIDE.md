# Development Guide (开发指南)

This guide provides a detailed overview of how to develop, extend, and maintain the **Vue3 Admin Better** project.

## 1. Project Overview (项目概览)

*   **Framework**: Vue 3 (Composition API)
*   **UI Library**: Element Plus
*   **Build Tool**: Rspack (High-performance web bundler)
*   **State Management**: Vuex 4
*   **Routing**: Vue Router 4
*   **Icons**: @element-plus/icons-vue

## 2. Menu & Routing (菜单与路由)

Adding a new menu item involves creating the page component, defining the route, and configuring permissions.

### Step 1: Create the View Component
Create your Vue component in the `src/views` directory.
Example: `src/views/order/index.vue`

```vue
<template>
  <div class="order-container">
    <el-card>Order List</el-card>
  </div>
</template>

<script setup>
defineOptions({ name: 'OrderManagement' });
</script>
```

### Step 2: Configure Router
Add the route definition in `src/router/index.js`.
*   **path**: The URL path.
*   **name**: Unique route identifier (Required for permission logic).
*   **meta.title**: The text displayed in the sidebar menu.
*   **meta.icon**: The icon displayed (Element Plus icon name, e.g., 'list', 'setting').

```javascript
// src/router/index.js
{
  path: "/order",
  component: Layout,
  redirect: "/order/index",
  meta: { title: "Order Management", icon: "list" },
  children: [
    {
      path: "index",
      name: "OrderManagement",
      component: () => import("@/views/order/index.vue"),
      meta: {
        title: "Orders",
        icon: "list",
        permissions: ["admin", "editor"], // Optional: Hardcoded array of roles
      },
    },
  ],
}
```

### Step 3: Configure Permissions & Visibility (Dynamic Menu)
This project uses a **Role-Based Access Control (RBAC)** system with dynamic menu visibility stored in `localStorage`.

1.  **Login as Administrator**: Log in to the system (default admin/123456).
2.  **Navigate to Permission Management**: Go to `Permission Management` -> `Role Management`.
3.  **Edit Role**: Click "Edit Permissions" for the target role (e.g., "Ordinary User").
4.  **Assign Menu**: In the "Menu Permissions" tree, check the new "Order Management" menu.
    *   *Note*: The menu tree in the Permission settings is defined in `src/views/permissions/index.vue` inside the `menuTree` data property. **You must manually update this `menuTree` if you add new top-level routes, so they appear in the configuration dialog.**
5.  **Save**: Click Save. The configuration is stored locally.
6.  **Verify**: Log in with a user who has that role to verify they can see the new menu.

## 3. Data Mocking & Storage (数据模拟与存储)

The project currently uses `localStorage` to simulate a database for Users and Roles. This allows data persistence across page reloads without a real backend.

### User Data
*   **Storage Key**: `vab-users`
*   **Management**: `src/views/user/index.vue`
*   **Logic**:
    *   On registration (`src/views/register/index.vue`) or addition via the User Management page, users are saved to this key.
    *   Login (`src/store/modules/user.js`) checks this key to validate credentials.

### Role Data
*   **Storage Key**: `vab-roles` & `vab-role-menus`
*   **Management**: `src/views/permissions/index.vue`
*   **Logic**:
    *   `vab-roles`: Stores role definitions (name, description).
    *   `vab-role-menus`: Maps a role name (key) to a list of allowed route paths (value).
    *   The router (`src/store/modules/routes.js`) reads `vab-role-menus` to dynamically filter which routes are accessible to the current user.

## 4. Component Usage (组件使用)

### Element Plus
We use [Element Plus](https://element-plus.org/) for all basic UI components (Buttons, Inputs, Forms, Tables, Dialogs).

**Global Registration**:
Icons are globally registered. You can use them directly:
```html
<el-icon><Search /></el-icon>
```

### Layout Components
Located in `src/layouts/components`. These are auto-registered.
*   `VabAvatar`: The user profile dropdown in the top right.
*   `VabSide`: The sidebar navigation logic.
*   `VabBreadcrumb`: The breadcrumb navigation at the top.

## 5. Development Tips (开发贴士)

*   **Icons**: When adding icons to routes, use the standard element-plus icon names (camelCase), e.g., `User`, `Setting`, `Lock`.
*   **Environment**:
    *   `npm run serve:rspack`: Starts the dev server.
    *   `npm run build`: Builds for production.
*   **Reset**: If the permissions or user data get corrupted or confusing, you can clear your browser's `localStorage` to reset to the implemented defaults (defaults are re-initialized in `mounted` hooks of the respective management pages).
