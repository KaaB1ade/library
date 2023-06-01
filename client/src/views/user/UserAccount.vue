<template>
  <n-collapse>
    <n-collapse-item @click="show" title="我的账号信息" name="1">
      <div>昵称: {{ showUser.nickname }}</div>
      <n-divider />
      <div>账号: {{ showUser.account }}</div>
      <n-divider />
      <div>信誉值: {{ showUser.rate }}</div>
      <n-divider />
      <div>状态: {{ showUser.state }}</div>
    </n-collapse-item>

    <n-collapse>
      <n-collapse-item title="我的借阅信息" name="1">
        <n-collapse>
          <n-collapse-item @click="borrowed" title="已借阅图书" name="1">
            <n-table :bordered="false" :single-line="false">
              <thead>
                <tr>
                  <th>书名</th>
                  <th>作者</th>
                  <th>种类</th>
                  <th>还书时间</th>
                  <th>状态</th>
                  <th>罚款金额</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(book, index) in bookList">
                  <td>{{ book.name }}</td>
                  <td>{{ book.author }}</td>
                  <td>{{ book.category }}</td>
                  <td>{{ book.due_time }}</td>
                  <td>
                    <span v-if="book.state === 1">可借阅</span>
                    <span v-else>不可借阅</span>
                  </td>
                  <td>{{ book.fine }}</td>
                  <td>
                    <n-space>
                      <n-button @click="() => returnBook(book)">归还</n-button>
                    </n-space>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </n-collapse-item>
          <n-collapse-item @click="getLastover" title="总可借阅图书量" name="2">
            <div>{{ lastover.msg }}</div>
          </n-collapse-item>
        </n-collapse>
      </n-collapse-item>
    </n-collapse>
  </n-collapse>

  <n-divider />
  <div>
    <n-button @click="showUpdateNick = true">修改昵称</n-button>
    <n-divider />
    <n-button @click="showUpdateModel = true">修改密码</n-button>
    <n-divider />
    <n-button @click="showDeleteModel = true">注销账号</n-button>
    <n-divider />
    <n-button @click="gotoHomePage">返回主页</n-button>

    <n-modal v-model:show="showUpdateNick" preset="dialog" title="Dialog">
      <template #header>
        <div>修改昵称</div>
      </template>
      <div>
        <n-input
          v-model:value="user.newnickname"
          type="text"
          placeholder="请输入更新后昵称"
        />
      </div>
      <template #action>
        <div>
          <n-button @click="updateNick">提交</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showUpdateModel" preset="dialog" title="Dialog">
      <template #header>
        <div>修改密码</div>
      </template>
      <div>
        <n-input
          v-model:value="user.newpassword"
          type="text"
          placeholder="请输入更新后密码"
        />
      </div>
      <div>
        <n-input
          v-model:value="user.doubleCheck"
          type="text"
          placeholder="请再次输入密码"
        />
      </div>
      <template #action>
        <div>
          <n-button @click="update">提交</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showDeleteModel" preset="dialog" title="Dialog">
      <template #header>
        <div>注销账号</div>
      </template>
      <div>
        <n-input
          v-model:value="user.doubleCheck"
          type="text"
          placeholder="请输入密码"
        />
      </div>
      <template #action>
        <div>
          <n-button @click="deleteUser">提交</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { UserStore } from "../../stores/UserStore";
import { ref, reactive, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const message = inject("message");
const dialog = inject("dialog");
const axios = inject("axios");

const userStore = UserStore();

const showUpdateModel = ref(false);
const showUpdateNick = ref(false);
const showDeleteModel = ref(false);

const user = reactive({
  id: userStore.id,
  account: userStore.account,
  nickname: userStore.nickname,
  password: userStore.password,
  newnickname: "",
  newpassword: "",
  doubleCheck: "",
});

const showUser = reactive({
  account: "",
  nickname: "",
  rate: "",
  state: "",
});

const lastover = reactive({
  msg: "",
});

const bookList = ref([]);

const gotoHomePage = async () => {
  router.push("/index");
};

const update = async () => {
  if (user.doubleCheck != user.newpassword) {
    message.error("两次密码输入不一致!");
    return;
  }

  let res = await axios.put("/user/_token/update", {
    account: user.account,
    nickname: user.nickname,
    password: user.newpassword,
    id: user.id,
  });
  if (res.data.code == 200) {
    message.info(res.data.msg);
    userStore.password = user.newpassword;
  } else {
    message.error(res.data.msg);
  }
  showUpdateModel.value = false;
};

const deleteUser = async () => {
  if (user.doubleCheck != userStore.password) {
    message.error("密码输入不正确");
    return;
  }

  dialog.warning({
    title: "警告",
    content: "是否要删除",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      let res = await axios.delete(`/user/_token/delete?id=${user.id}`);
      if (res.data.code == 200) {
        message.info(res.data.msg);
        showDeleteModel.value = false;
        router.push("/login");
      } else {
        message.error(res.data.msg);
      }
    },
    onNegativeClick: () => {},
  });
};

const updateNick = async () => {
  let res = await axios.put("/user/_token/update", {
    account: user.account,
    nickname: user.newnickname,
    password: user.password,
    id: user.id,
  });
  if (res.data.code == 200) {
    message.info(res.data.msg);
    userStore.nickname = user.newnickname;
  } else {
    message.error(res.data.msg);
  }
  showUpdateNick.value = false;
};

const show = async () => {
  let res = await axios.get(`/user/show_for_user?id=${user.id}`);
  showUser.account = res.data.account;
  showUser.nickname = res.data.nickname;
  showUser.rate = res.data.rate;
  if (res.data.state === 1) {
    showUser.state = "正常";
  } else {
    showUser.state = "封禁";
  }
};

const borrowed = async () => {
  let res = await axios.get(
    `/book/borrowed_for_user?user_account=${user.account}`
  );
  bookList.value = res.data.rows;
};

const returnBook = async (book) => {
  const dbTime = new Date(book.due_time);
  let now = new Date();

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
        borrowed();
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

const getLastover = async () => {
  let res = await axios.get(`/user/getLastover?id=${user.id}`);

  if (res.data.rate < 1) {
    let res = await axios.put("/user/overtime2", {
      id: user.id,
    });
  }
  if (res.data.state == 0) {
    lastover.msg = "信誉值过低，您处于封禁状态，请在主页联系管理员解封！";
  } else {
    if (res.data.rate == 4) {
      lastover.msg = "您信誉值为4，总可借阅6本书籍";
    }
    if (res.data.rate == 3) {
      lastover.msg = "您信誉值为3，总可借阅4本书籍";
    }
    if (res.data.rate == 2) {
      lastover.msg = "您信誉值为2，总可借阅2本书籍，请注意自己的信誉值！";
    }
    if (res.data.rate == 1) {
      lastover.msg = "您信誉值为1，总可借阅1本书籍，请注意自己的信誉值！";
    }
  }
};
</script>

<style lang="scss" scoped></style>
