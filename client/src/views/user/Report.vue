<template>
  <n-gradient-text type="info"> 联系我们 </n-gradient-text>
  <n-space vertical>
    <n-input v-model:value="report.name" type="text" placeholder="您的账号" />
    <n-input
      v-model:value="report.mail"
      type="text"
      placeholder="您的邮箱(方便我们进一步联系您)"
    />
    <n-input
      v-model:value="report.content"
      type="textarea"
      placeholder="您的意见"
    />
  </n-space>
  <n-button @click="add">提交</n-button>
</template>

<script setup>
import { defineComponent, ref, reactive, inject } from "vue";
const message = inject("message");
const dialog = inject("dialog");
const axios = inject("axios");

const report = reactive({
  name: "",
  mail: "",
  content: "",
});

const add = async () => {
  let res = await axios.post("/report/add", {
    name: report.name,
    mail: report.mail,
    content: report.content,
  });
  if (res.data.code == 200) {
    message.info(res.data.msg + "\n" + "感谢您的支持");
  } else {
    message.error(res.data.msg);
  }
};
</script>

<style lang="scss" scoped>
.n-gradient-text {
  font-size: 50px;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.n-button {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
</style>
