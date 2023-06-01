<template>
  <div class="main-panel">
    <div class="menus">
      <div v-for="(menu, index) in menus" @click="toPage(menu)">
        {{ menu.name }}
      </div>
    </div>
    <div style="padding: 20px; width: 100%">
      <router-view></router-view>
    </div>
  </div>
  <div class="title">图书借阅</div>
</template>

<script setup>
import { UserStore } from "../../stores/UserStore";
import { ref, reactive, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const message = inject("message");
const axios = inject("axios");

const userStore = UserStore();

let menus = [
  { name: "个人信息", href: "/account" },
  { name: "图书借阅", href: "/book" },
  { name: "反馈", href: "/report" },
  { name: "退出", href: "/login" },
];

const toPage = (menu) => {
  router.push(menu.href);
};
</script>

<style lang="scss" scoped>
.main-panel {
  display: flex;
  color: #64676a;
  max-width: 1500px;
  margin: 0 auto;
}

.menus {
  padding: 20px 0;
  box-sizing: border-box;
  line-height: 55px;
  text-align: center;
  width: 180px;
  height: 95vh;
  border-right: 1px solid #dadada;

  div {
    cursor: pointer;

    &:hover {
      color: #fd760e;
    }
  }
}

.title {
  font-size: 65px;
  font-weight: bold;
  text-align: right;
  position: fixed;
  color: rgba(0, 0, 0, 20%);
  right: calc((100vw - 1500px) / 2);
  bottom: 20px;
}
</style>
