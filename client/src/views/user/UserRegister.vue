<template>
  <div class="login-panel">
    <n-card title="注册">
      <n-form :rules="rules" :model="user">
        <n-form-item path="account" label="账号">
          <n-input v-model:value="user.account" placeholder="请输入账号" />
        </n-form-item>
        <n-form-item path="password" label="密码">
          <n-input
            v-model:value="user.password"
            type="password"
            placeholder="请输入密码"
          />
        </n-form-item>
        <n-form-item path="password" label="确认密码">
          <n-input
            v-model:value="user.doubleCheck"
            type="password"
            placeholder="请确认密码"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-checkbox v-model:checked="user.rember" label="记住我" />
        <n-button @click="register">注册</n-button>
      </template>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, inject } from "vue";
import { UserStore } from "../../stores/UserStore";

import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const message = inject("message");
const axios = inject("axios");
const userStore = UserStore();

let rules = {
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 12, message: "账号长度在 3 到 12 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 18, message: "密码长度在 6 到 18 个字符", trigger: "blur" },
  ],
};

const user = reactive({
  account: localStorage.getItem("account") || "",
  password: localStorage.getItem("password") || "",
  rember: localStorage.getItem("account") == 1,
  doubleCheck: localStorage.getItem("password") || "",
});

const register = async () => {
  if (user.doubleCheck != user.password) {
    message.error("密码不一致");
    return;
  }

  let result = await axios.post("/user/register", {
    account: user.account,
    password: user.password,
  });

  if (result.data.code == 200) {
    (userStore.id = result.data.data.id),
      (userStore.account = result.data.data.account),
      (userStore.password = user.password);

    if (user.rember) {
      localStorage.setItem("account", user.account);
      localStorage.setItem("password", user.password);
      localStorage.setItem("rember", user.rember ? 1 : 0);
    }
    router.push("/index");
    message.info(result.data.msg);
  } else {
    message.error(result.data.msg);
  }
};
</script>

<style lang="scss" scoped>
.login-panel {
  width: 500px;
  margin: 0 auto;
  margin-top: 130px;
}
</style>
