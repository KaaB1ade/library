import { defineStore } from "pinia";

export const UserStore = defineStore("user", {
  state: () => {
    return {
      id: 0,
      account: "",
      nickname: "",
      password: "",
      token: "",
      rate: "",
      state: "",
    };
  },
  actions: {},
  getters: {},
});
