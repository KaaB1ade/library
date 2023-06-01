import { createRouter, createWebHashHistory } from "vue-router";

let routes = [
  {
    path: "/admin/login",
    component: () => import("../views/admin/AdminLogin.vue"),
  },
  {
    path: "/admin/dashboard",
    component: () => import("../views/admin/Dashboard.vue"),
  },
  {
    path: "/admin/manage_user",
    component: () => import("../views/admin/User.vue"),
  },
  {
    path: "/admin/manage_book",
    component: () => import("../views/admin/Book.vue"),
  },
  // 分界线
  { path: "/login", component: () => import("../views/user/UserLogin.vue") },
  {
    path: "/register",
    component: () => import("../views/user/UserRegister.vue"),
  },
  {
    path: "/index",
    component: () => import("../views/user/Index.vue"),
  },
  {
    path: "/account",
    component: () => import("../views/user/UserAccount.vue"),
  },
  {
    path: "/report",
    component: () => import("../views/user/Report.vue"),
  },
  {
    path: "/book",
    component: () => import("../views/user/Book.vue"),
  },
  {
    path: "/detail",
    component: () => import("../views/user/Detail.vue"),
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export { router, routes };
