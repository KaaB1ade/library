<template>
  <n-button @click="back">返回</n-button>
  <n-h1>书籍名：{{ bookInfo.name }}</n-h1>
  <n-h2>作者：{{ bookInfo.author }}</n-h2>
  <n-h3>分类：{{ bookInfo.category }}</n-h3>
  <n-divider></n-divider>

  <n-p>
    {{ bookInfo.brief_introduction }}
  </n-p>
</template>

<script setup>
import { ref, reactive, inject, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const bookInfo = ref({});
const axios = inject("axios");

onMounted(() => {
  loadBook();
});

const loadBook = async () => {
  let res = await axios.get("/book/detail?id=" + route.query.id);
  bookInfo.value = res.data.rows[0];
};

const back = () => {
  router.push("/book");
};
</script>

<style lang="scss" scoped>
.n-h1 {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.n-h2 {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.n-h3 {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.n-p {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.n-rate {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
</style>
