<template>
  <div>
    <n-button @click="showAddModel = true">添加</n-button>
    <n-button @click="showSearchModel = true">搜索</n-button>
    <n-button @click="back">返回</n-button>
    <n-button @click="(showStatisticsModel = true), getTotal(), getAvailable()"
      >统计</n-button
    >
    <n-table :bordered="false" :single-line="false">
      <thead>
        <tr>
          <th>id</th>
          <th>书名</th>
          <th>作者</th>
          <th>种类</th>
          <th>入库时间</th>
          <th>还书时间</th>
          <th>状态</th>
          <th>当前借阅者账号</th>
          <th>罚款金额</th>
          <th>简介</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(book, index) in bookList">
          <td>{{ book.id }}</td>
          <td>{{ book.name }}</td>
          <td>{{ book.author }}</td>
          <td>{{ book.category }}</td>
          <td>{{ book.warehousing_time }}</td>
          <td>{{ book.due_time }}</td>
          <td>{{ book.state }}</td>
          <td>{{ book.user_account }}</td>
          <td>{{ book.fine }}</td>
          <td>
            <n-ellipsis style="max-width: 240px">
              {{ book.brief_introduction }}
            </n-ellipsis>
          </td>
          <td>
            <n-space>
              <n-button @click="toUpdate(book)">修改</n-button>
              <n-button @click="deleteBook(book)">删除</n-button>
            </n-space>
          </td>
        </tr>
      </tbody>
    </n-table>

    <n-modal v-model:show="showStatisticsModel" preset="dialog" title="Dialog">
      <template #header>
        <div>书籍统计</div>
      </template>
      <n-row>
        <n-col :span="12">
          <n-statistic label="书籍总数">
            {{ statistics.total_num }}
          </n-statistic>
        </n-col>
        <n-col :span="12">
          <n-statistic label="可借阅书籍数">
            {{ statistics.available }}
          </n-statistic>
        </n-col>
      </n-row>
      <template #action> </template>
    </n-modal>

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

    <n-modal v-model:show="showAddModel" preset="dialog" title="Dialog">
      <template #header>
        <div>添加书籍</div>
      </template>
      <div>
        <n-input
          v-model:value="addBook.name"
          type="text"
          placeholder="请输入书名"
        />
        <n-input
          v-model:value="addBook.author"
          type="text"
          placeholder="请输入作者"
        />
        <n-input
          v-model:value="addBook.category"
          type="text"
          placeholder="请输入种类"
        />
        <n-input
          v-model:value="addBook.fine"
          type="text"
          placeholder="请输入罚款金额"
        />
      </div>
      <template #action>
        <div>
          <n-button @click="add">提交</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showUpdateModel" preset="dialog" title="Dialog">
      <template #header>
        <div>修改书籍</div>
      </template>
      <div>
        <n-input
          v-model:value="updateBook.name"
          type="text"
          placeholder="请输入书名"
        />
        <n-input
          v-model:value="updateBook.author"
          type="text"
          placeholder="请输入作者"
        />
        <n-input
          v-model:value="updateBook.category"
          type="text"
          placeholder="请输入种类"
        />
        <n-input
          v-model:value="updateBook.due_time"
          type="text"
          placeholder="请输入还书时间"
          @blur="validateDateTime"
        />
        <n-input
          v-model:value="updateBook.state"
          type="text"
          placeholder="请输入状态"
        />
        <n-input
          v-model:value="updateBook.user_account"
          type="text"
          placeholder="请输入借书者账号"
        />
        <n-input
          v-model:value="updateBook.fine"
          type="text"
          placeholder="请输入罚款金额"
        />
      </div>
      <template #action>
        <div>
          <n-button @click="update">提交</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { AdminStore } from "../../stores/AdminStore";
import { ref, reactive, inject, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const message = inject("message");
const dialog = inject("dialog");
const axios = inject("axios");

const adminStore = AdminStore();

const showAddModel = ref(false);
const showUpdateModel = ref(false);
const showSearchModel = ref(false);
const showStatisticsModel = ref(false);

var flag = 0;

const bookList = ref([]);
const addBook = reactive({
  name: "",
  author: "",
  category: "",
  fine: "",
});
const updateBook = reactive({
  id: "",
  name: "",
  author: "",
  category: "",
  due_time: "",
  state: "",
  user_account: "",
  fine: "",
});

const searchBook = reactive({
  name: "",
  author: "",
  category: "",
});

const statistics = reactive({
  total_num: "",
  available: "",
});

onMounted(() => {
  loadDatas();
});

const loadDatas = async () => {
  if (flag == 0) {
    let res = await axios.get("/book/show");
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
const search = async () => {
  flag = 1;
  loadDatas();
  message.info(res.data.msg);
  showSearchModel.value = false;
};

const add = async () => {
  let res = await axios.post("/book/add_for_admin", {
    name: addBook.name,
    author: addBook.author,
    category: addBook.category,
    fine: addBook.fine,
  });
  if (res.data.code == 200) {
    flag = 0;
    loadDatas();
    message.info(res.data.msg);
  } else {
    message.error(res.data.msg);
  }
  showAddModel.value = false;
};

const validateDateTime = async () => {
  const dt = new Date(updateBook.due_time);
  if (isNaN(dt.getTime())) {
    this.errorMessage = "日期格式不正确，请输入正确的日期格式";
  } else {
    this.errorMessage = "";
  }
};

const toUpdate = async (book) => {
  showUpdateModel.value = true;
  updateBook.id = book.id;
  updateBook.name = book.name;
  updateBook.author = book.author;
  updateBook.category = book.category;
  updateBook.due_time = book.due_time;
  updateBook.state = book.state;
  updateBook.user_account = book.user_account;
  updateBook.fine = book.fine;
};

const update = async () => {
  let res = await axios.put("/book/update_for_admin", {
    name: updateBook.name,
    author: updateBook.author,
    category: updateBook.category,
    due_time: updateBook.due_time,
    state: updateBook.state,
    user_account: updateBook.user_account,
    fine: updateBook.fine,
    id: updateBook.id,
  });
  if (res.data.code == 200) {
    flag = 0;
    loadDatas();
    message.info(res.data.msg);
  } else {
    message.error(res.data.msg);
  }
  showUpdateModel.value = false;
};

const deleteBook = async (book) => {
  dialog.warning({
    title: "警告",
    content: "是否要删除",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      let res = await axios.delete(`/book/delete_for_admin?id=${book.id}`);
      if (res.data.code == 200) {
        loadDatas();
        message.info(res.data.msg);
      } else {
        message.error(res.data.msg);
      }
    },
    onNegativeClick: () => {},
  });
};

const getTotal = async () => {
  let res = await axios.get("/book/total_num");
  statistics.total_num = res.data.count;
};

const getAvailable = async () => {
  let res = await axios.get("/book/available");
  statistics.available = res.data.count;
};
</script>

<style lang="scss" scoped></style>
