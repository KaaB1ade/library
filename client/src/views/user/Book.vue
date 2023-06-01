<template>
  <div>
    <n-button @click="showSearchModel = true">搜索</n-button>
    <n-button @click="back">返回</n-button>
    <n-input
      v-model:value="rateBook.star"
      type="text"
      placeholder="请输入star"
    />

    <n-table :bordered="false" :single-line="false">
      <thead>
        <tr>
          <th>书名</th>
          <th>作者</th>
          <th>种类</th>
          <th>状态</th>
          <th>评分</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(book, index) in bookList">
          <td>{{ book.name }}</td>
          <td>{{ book.author }}</td>
          <td>{{ book.category }}</td>
          <td>
            <span v-if="book.state === 1">可借阅</span>
            <span v-else>不可借阅</span>
          </td>
          <td>
            <n-rate readonly :default-value="book.star" />
          </td>
          <td>
            <n-space>
              <n-button @click="() => detailBook(book)">详情</n-button>
              <n-button @click="() => borrowBook(book)">借阅</n-button>
              <n-button @click="() => returnBook(book)">归还</n-button>
              <n-button @click="() => rate(book)">评分</n-button>
            </n-space>
          </td>
        </tr>
      </tbody>
    </n-table>

    <n-modal v-model:show="showSearchModel" preset="dialog" title="Dialog">
      <template #header>
        <div>书籍搜索</div>
      </template>
      <div>
        <n-input
          v-model:value="searchBook.name"
          type="text"
          placeholder="请输入书名"
        />
        <n-input
          v-model:value="searchBook.author"
          type="text"
          placeholder="请输入作者"
        />
        <n-input
          v-model:value="searchBook.category"
          type="text"
          placeholder="请输入种类"
        />
      </div>
      <template #action>
        <div>
          <n-button @click="search">确定</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showRateModel" preset="dialog" title="Dialog">
      <template #header>
        <div>书籍评分</div>
      </template>
      <div>
        <n-input
          v-model:value="rateBook.star"
          type="text"
          placeholder="请输入您对此书的评分,1-5"
        />
      </div>
      <template #action>
        <div>
          <n-button @click="rate">确定</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { UserStore } from "../../stores/UserStore";
import { ref, reactive, inject, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const message = inject("message");
const dialog = inject("dialog");
const axios = inject("axios");

const userStore = UserStore();

const bookList = ref([]);
const showSearchModel = ref(false);
const showRateModel = ref(false);

var flag = 0;

const searchBook = reactive({
  name: "",
  author: "",
  category: "",
});

const rateBook = reactive({
  star: "",
});

const search = async () => {
  flag = 1;
  loadDatas();
  message.info(res.data.msg);
  showSearchModel.value = false;
};

onMounted(() => {
  loadDatas();
});

const loadDatas = async () => {
  if (flag == 0) {
    let res = await axios.get("/book/show_for_user");
    bookList.value = res.data.rows;
  } else {
    let res = await axios.post("/book/search", {
      name: searchBook.name,
      author: searchBook.author,
      category: searchBook.category,
    });
    bookList.value = res.data.rows;
  }
};

const back = async () => {
  flag = 0;
  loadDatas();
};

const returnBook = async (book) => {
  const dbTime = new Date(book.due_time);
  let now = new Date();

  if (book.state == 1) {
    message.info("错误行为！您未借阅该书籍");
    return;
  }
  if (book.user_account != userStore.account) {
    message.info("错误行为！您未借阅该书籍");
    return;
  }

  dialog.warning({
    title: "警告",
    content: "是否要归还",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      let res = await axios.put(`/book/return_for_user`, {
        id: book.id,
      });
      if (res.data.code == 200) {
        loadDatas();
        message.info(res.data.msg);
        if (dbTime < now) {
          let res1 = await axios.put("/user/overtime", {
            id: user.id,
          });
          if (res1.data.code == 200) {
            borrowed();
            message.info(res1.data.msg);
          } else {
            message.error(res1.data.msg);
          }
        }
      } else {
        message.error(res.data.msg);
      }
    },
    onNegativeClick: () => {},
  });
};

const borrowBook = async (book) => {
  if (book.state == 0) {
    message.info("该书籍已被借阅！");
    return;
  }

  let res = await axios.get(`/user/getLastover?id=${userStore.id}`);
  let res1 = await axios.get(
    `/book/borrowed_num_for_user?user_account=${userStore.account}`
  );
  let borrowed_num = res1.data.count;
  if (res.data.state == 0) {
    message.info("您已被封禁，无法借阅！");
    return;
  }
  if (res.data.rate == 4 && borrowed_num == 6) {
    message.info("您共可借阅6本，已借阅6本，无法过多借阅");
    return;
  }
  if (res.data.rate == 3 && borrowed_num == 4) {
    message.info("您共可借阅4本，已借阅4本，无法过多借阅");
    return;
  }
  if (res.data.rate == 2 && borrowed_num == 2) {
    message.info("您共可借阅2本，已借阅2本，无法过多借阅");
    return;
  }
  if (res.data.rate == 1 && borrowed_num == 1) {
    message.info("您共可借阅1本，已借阅1本，无法过多借阅");
    return;
  }

  dialog.warning({
    title: "警告",
    content: "是否要借阅",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      let res = await axios.put(`/book/borrow`, {
        id: book.id,
        user_account: userStore.account,
      });
      if (res.data.code == 200) {
        message.info(res.data.msg);
        loadDatas();
      } else {
        message.error(res.data.msg);
      }
    },
    onNegativeClick: () => {},
  });
};

const detailBook = async (book) => {
  router.push({ path: "/detail", query: { id: book.id } });
};

const rate = async (book) => {
  if (book.user_account != userStore.account) {
    message.info("您未借阅，无法评分");
    return;
  }
  if (
    rateBook.star != 1 &&
    rateBook.star != 2 &&
    rateBook.star != 3 &&
    rateBook.star != 4 &&
    rateBook.star != 5
  ) {
    message.info("评分需要在1-5间哦");
    return;
  }
  if (rateBook.star > book.star) {
    rateBook.star += 1;
  } else if (rateBook.star == book.star) {
    rateBook.star = book.star;
  } else {
    rateBook.star -= 1;
  }
  let res = await axios.put("/book/star", {
    star: rateBook.star,
    id: book.id,
  });
  message.info(res.data.msg);
};
</script>

<style lang="scss" scoped></style>
