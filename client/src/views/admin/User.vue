<template>
  <div>
    <n-button @click="showAddModel = true">添加</n-button>
    <n-button @click="(showStatisticsModel = true), getTotal(), getAvailable()"
      >统计</n-button
    >
    <n-table :bordered="false" :single-line="false">
      <thead>
        <tr>
          <th>id</th>
          <th>账户</th>
          <th>昵称</th>
          <th>密码</th>
          <th>信誉值</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in userList">
          <td>{{ user.id }}</td>
          <td>{{ user.account }}</td>
          <td>{{ user.nickname }}</td>
          <td>{{ user.password }}</td>
          <td>{{ user.rate }}</td>
          <td>{{ user.state }}</td>
          <td>
            <n-space>
              <n-button @click="toUpdate(user)">修改</n-button>
              <n-button @click="deleteUser(user)">删除</n-button>
            </n-space>
          </td>
        </tr>
      </tbody>
    </n-table>

    <n-modal v-model:show="showStatisticsModel" preset="dialog" title="Dialog">
      <template #header>
        <div>用户统计</div>
      </template>
      <n-row>
        <n-col :span="12">
          <n-statistic label="用户总数">
            {{ statistics.total_num }}
          </n-statistic>
        </n-col>
        <n-col :span="12">
          <n-statistic label="活跃用户数">
            {{ statistics.available }}
          </n-statistic>
        </n-col>
      </n-row>
      <template #action> </template>
    </n-modal>

    <n-modal v-model:show="showAddModel" preset="dialog" title="Dialog">
      <template #header>
        <div>添加用户</div>
      </template>
      <div>
        <n-input
          v-model:value="addUser.account"
          type="text"
          placeholder="请输入账户"
        />
        <n-input
          v-model:value="addUser.nickname"
          type="text"
          placeholder="请输入昵称"
        />
        <n-input
          v-model:value="addUser.password"
          type="text"
          placeholder="请输入密码"
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
        <div>修改用户</div>
      </template>
      <div>
        <n-input
          v-model:value="updateUser.account"
          type="text"
          placeholder="请输入账户"
        />
        <n-input
          v-model:value="updateUser.nickname"
          type="text"
          placeholder="请输入昵称"
        />
        <n-input
          v-model:value="updateUser.password"
          type="text"
          placeholder="请输入密码"
        />
        <n-input
          v-model:value="updateUser.rate"
          type="text"
          placeholder="请输入信誉值"
        />
        <n-input
          v-model:value="updateUser.state"
          type="text"
          placeholder="请输入状态"
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
const showStatisticsModel = ref(false);

const userList = ref([]);
const addUser = reactive({
  account: "",
  nickname: "",
  password: "",
});
const updateUser = reactive({
  id: "",
  account: "",
  nickname: "",
  password: "",
  rate: "",
  state: "",
});

const statistics = reactive({
  total_num: "",
  available: "",
});

onMounted(() => {
  loadDatas();
});

const loadDatas = async () => {
  let res = await axios.get("/user/show_for_admin");
  userList.value = res.data.rows;
};

const add = async () => {
  let res = await axios.post("/user/register", {
    account: addUser.account,
    nickname: addUser.nickname,
    password: addUser.password,
  });
  if (res.data.code == 200) {
    loadDatas();
    message.info(res.data.msg);
  } else {
    message.error(res.data.msg);
  }
  showAddModel.value = false;
};

const toUpdate = async (user) => {
  showUpdateModel.value = true;
  updateUser.id = user.id;
  updateUser.account = user.account;
  updateUser.nickname = user.nickname;
  updateUser.password = user.password;
  updateUser.rate = user.rate;
  updateUser.state = user.state;
};

const update = async () => {
  let res = await axios.put("/user/update_for_admin", {
    account: updateUser.account,
    nickname: updateUser.nickname,
    password: updateUser.password,
    rate: updateUser.rate,
    state: updateUser.state,
    id: updateUser.id,
  });
  if (res.data.code == 200) {
    loadDatas();
    message.info(res.data.msg);
  } else {
    message.error(res.data.msg);
  }
  showUpdateModel.value = false;
};

const deleteUser = async (user) => {
  dialog.warning({
    title: "警告",
    content: "是否要删除",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      let res = await axios.delete(`/user/_token/delete?id=${user.id}`);
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
  let res = await axios.get("/user/total_num");
  statistics.total_num = res.data.count;
};
const getAvailable = async () => {
  let res = await axios.get("/user/available");
  statistics.available = res.data.count;
};
</script>

<style lang="scss" scoped></style>
