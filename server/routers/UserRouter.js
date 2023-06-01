const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { db, genid } = require("../db/DbUtils");

// 用户登录
router.post("/login", async (req, res) => {
  // 从前端获取注册信息
  let { account, password } = req.body;
  // 确认合法用户
  let { err, rows } = await db.async.all(
    "select * from `user` where `account` = ? AND `password` = ?",
    [account, password]
  );

  if (err == null && rows.length > 0) {
    // 更新token
    let login_token = uuidv4();
    let update_token_sql = "UPDATE `user` SET `token` = ? where `id` = ?";

    await db.async.run(update_token_sql, [login_token, rows[0].id]);

    let user_info = rows[0];
    user_info.token = login_token;
    user_info.password = "";

    res.send({
      code: 200,
      msg: "登录成功",
      data: user_info,
    });
  } else {
    res.send({
      code: 500,
      msg: "登陆失败,账号或密码错误",
    });
  }
});

// 用户注册
router.post("/register", async (req, res) => {
  // 从前端获取注册信息
  let { account, password, nickname } = req.body;
  let { err, rows } = await db.async.all(
    "SELECT * FROM `user` WHERE `account` = ?",
    [account]
  );

  if (err == null && rows.length > 0) {
    res.send({
      code: 500,
      msg: "该账号已存在",
    });
  } else {
    // 随机生成id,初始化相关数据
    let id = genid.NextId();
    let rate = 4;
    let state = 1;
    // 数据库插入操作
    let { err, rows } = await db.async.run(
      "INSERT INTO `user` (`id`,`account`,`password`,`nickname`,`rate`,`state`) VALUES (?,?,?,?,?,?)",
      [id, account, password, nickname, rate, state]
    );

    let user_info = {
      id: id,
      password: "",
      account: account,
      nickname: nickname,
    };
    if (err == null) {
      res.send({
        code: 200,
        msg: "注册成功",
        data: user_info,
      });
    } else {
      res.send({
        code: 500,
        msg: "注册失败",
      });
    }
  }
});

router.put("/_token/update", async (req, res) => {
  // 认证合法用户 （_token确认）
  // 获取前端更新数据
  let { account, password, nickname, id } = req.body;
  let { err, rows } = await db.async.all(
    "SELECT * FROM `user` WHERE `id` = ?",
    [id]
  );

  // 数据库更新
  if (err == null && rows.length > 0) {
    let { err, rows } = await db.async.run(
      "UPDATE `user` SET `password` = ?,`account`=?,`nickname`=? WHERE `id` = ?",
      [password, account, nickname, id]
    );
    res.send({
      code: 200,
      msg: "更新用户信息成功",
    });
  } else {
    res.send({
      code: 500,
      msg: "更新用户信息失败",
      rows,
    });
  }
});

router.delete("/_token/delete", async (req, res) => {
  let id = req.query.id;
  let { err, rows } = await db.async.all("DELETE FROM `user` WHERE `id` = ?", [
    id,
  ]);

  if (err == null) {
    res.send({
      code: 200,
      msg: "删除用户信息成功",
    });
  } else {
    res.send({
      code: 500,
      msg: "删除用户信息失败",
    });
  }
});

router.get("/show_for_admin", async (req, res) => {
  let { token } = req.headers;

  let result = await db.async.all("SELECT * FROM `admin` WHERE `token`=?", [
    token,
  ]);
  if (result.err != null || result.rows.length == 0) {
    res.send({
      code: 403,
      msg: "请先登录",
    });
    return;
  }

  let { err, rows } = await db.async.all("SELECT *  FROM `user`");

  if (err == null) {
    res.send({
      code: 200,
      msg: "查询成功",
      rows, //rows:rows
    });
  } else {
    res.send({
      code: 500,
      msg: "查询失败",
    });
  }
});

router.put("/update_for_admin", async (req, res) => {
  // 认证该接口只有admin可使用
  let { token } = req.headers;

  let result = await db.async.all("SELECT * FROM `admin` WHERE `token`=?", [
    token,
  ]);
  if (result.err != null || result.rows.length == 0) {
    res.send({
      code: 403,
      msg: "请先登录",
    });
    return;
  }

  // 前端获取更新数据
  let { id, password, account, nickname, rate, state } = req.body;

  // 认证用户存在
  let { err, rows } = await db.async.all(
    "SELECT * FROM `user` WHERE `id` = ?",
    [id]
  );

  // 数据库更新
  if (err == null && rows.length > 0) {
    let { err, rows } = await db.async.run(
      "UPDATE `user` SET `password`=?,`account`=?,`nickname`=?,`rate` = ?,`state`=? WHERE `id` = ?",
      [password, account, nickname, rate, state, id]
    );
    res.send({
      code: 200,
      msg: "更新用户信息成功",
    });
  } else {
    res.send({
      code: 500,
      msg: "更新用户信息失败",
      rows,
    });
  }
});

router.get("/total_num", async (req, res) => {
  let { err, rows } = await db.async.all("SELECT COUNT(*) FROM `user`");

  if (err == null) {
    let count = rows[0]["COUNT(*)"];
    res.send({
      code: 200,
      msg: "查询成功",
      count: count,
    });
  } else {
    res.send({
      code: 500,
      msg: "查询失败",
    });
  }
});

router.get("/available", async (req, res) => {
  let { err, rows } = await db.async.all(
    "SELECT COUNT(*) FROM `user` WHERE `state` = 1"
  );

  if (err == null) {
    let count = rows[0]["COUNT(*)"];
    res.send({
      code: 200,
      msg: "查询成功",
      count: count,
    });
  } else {
    res.send({
      code: 500,
      msg: "查询失败",
    });
  }
});

router.get("/show_for_user", async (req, res) => {
  let id = req.query.id;
  let { err, rows } = await db.async.all(
    "SELECT `nickname`,`account`,`rate`,`state` FROM `user` WHERE `id`=?",
    [id]
  );

  if (err == null && rows.length > 0) {
    const { nickname, account, rate, state } = rows[0];
    res.send({
      code: 200,
      msg: "查询成功",
      nickname,
      account,
      rate,
      state,
    });
  } else {
    res.send({
      code: 500,
      msg: "查询失败",
    });
  }
});

// 用户归还超时惩罚 rate-1
router.put("/overtime", async (req, res) => {
  let { id } = req.body;

  let { err, rows } = await db.async.run(
    "UPDATE `user` SET `rate` = `rate`-1 WHERE `id` = ?",
    [id]
  );
  if (err == null) {
    res.send({
      code: 200,
      msg: "您超时归还，信誉值减一",
    });
  } else {
    res.send({
      code: 500,
    });
  }
});

// 确定用户可借阅书籍量，根据state和rate决定
// state=0 -> 0
// state=1 -> rate = 4 ->6
// state=1 -> rate = 3 ->4
// state=1 -> rate = 2 ->2
// state=1 -> rate = 1 ->1
router.get("/getLastover", async (req, res) => {
  let id = req.query.id;

  let { err, rows } = await db.async.all(
    "SELECT `rate`,`state` FROM `user` WHERE `id`=?",
    [id]
  );

  if (err == null && rows.length > 0) {
    const { rate, state } = rows[0];
    res.send({
      code: 200,
      msg: "查询成功",
      rate,
      state,
    });
  } else {
    res.send({
      code: 500,
      msg: "查询失败",
    });
  }
});

// 用户rate<1，state置为0
router.put("/overtime2", async (req, res) => {
  let { id } = req.body;

  let { err, rows } = await db.async.run(
    "UPDATE `user` SET `state`=0 WHERE `id` = ?",
    [id]
  );
  if (err == null) {
    res.send({
      code: 200,
      msg: "您已被封禁",
    });
  } else {
    res.send({
      code: 500,
    });
  }
});
module.exports = router;
