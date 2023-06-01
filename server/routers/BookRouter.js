const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { db, genid } = require("../db/DbUtils");

// 只有管理员才可以添加书籍
// state -> 1为可借阅 2为已被借阅 0为异常状态 初始化为1
router.post("/add_for_admin", async (req, res) => {
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

  let { name, author, category, fine } = req.body;

  state = 1;
  const now = new Date();
  warehousing_time = now.toISOString().slice(0, 19).replace("T", " ");
  //warehousing_time = datetime("now");
  let id = genid.NextId();
  let { err, rows } = await db.async.run(
    "INSERT INTO `book` (`id`,`name`,`author`,`category`,`warehousing_time`,`state`,`fine`) VALUES (?,?,?,?,?,?,?)",
    [id, name, author, category, warehousing_time, state, fine]
  );

  let book_info = {
    id: id,
    name: name,
    author: author,
    category: category,
    warehousing_time: warehousing_time,
    state: state,
    fine: fine,
  };
  if (err == null) {
    res.send({
      code: 200,
      msg: "添加成功",
      data: book_info,
    });
  } else {
    res.send({
      code: 500,
      msg: "添加失败",
    });
  }
});

// 只有管理员才可以删除书籍
router.delete("/delete_for_admin", async (req, res) => {
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

  let id = req.query.id;

  let { err, rows } = await db.async.all("DELETE FROM `book` WHERE `id` = ?", [
    id,
  ]);

  if (err == null) {
    res.send({
      code: 200,
      msg: "删除书籍成功",
    });
  } else {
    res.send({
      code: 500,
      msg: "删除书籍失败",
    });
  }
});

// 显示所有书籍
router.get("/show", async (req, res) => {
  let { err, rows } = await db.async.all("SELECT *  FROM `book`");

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

// 书籍借阅
router.put("/borrow", async (req, res) => {
  let { id, user_account } = req.body;

  let { err, rows } = await db.async.run(
    "UPDATE `book` SET `state`=0,`user_account`=?, `due_time` = datetime('now', '+14 day') WHERE `id` = ?",
    [user_account, id]
  );
  if (err == null) {
    res.send({
      code: 200,
      msg: "借阅成功",
    });
  } else {
    res.send({
      code: 500,
      msg: "借阅失败",
    });
  }
});

// 管理员更新书籍
router.put("/update_for_admin", async (req, res) => {
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

  let { name, author, category, due_time, state, user_account, fine, id } =
    req.body;

  let { err, rows } = await db.async.run(
    "UPDATE `book` SET `name`=?,`author`=?,`category`=?,`due_time` = ?,`state`=?,`user_account`=?,`fine`=? WHERE `id` = ?",
    [name, author, category, due_time, state, user_account, fine, id]
  );

  if (err == null) {
    res.send({
      code: 200,
      msg: "更新书籍成功",
    });
  } else {
    res.send({
      code: 500,
      msg: "更新书籍失败",
      rows,
    });
  }
});

// 书籍搜索
router.post("/search", async (req, res) => {
  let { name, author, category } = req.body;

  let { err, rows } = await db.async.all(
    "SELECT * FROM `book` WHERE `name` LIKE ? OR `author` LIKE ? OR `category` LIKE ?",
    [name, author, category]
  );

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

// 书籍数目
router.get("/total_num", async (req, res) => {
  let { err, rows } = await db.async.all("SELECT COUNT(*) FROM `book`");

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

// 书籍可借阅数目
router.get("/available", async (req, res) => {
  let { err, rows } = await db.async.all(
    "SELECT COUNT(*) FROM `book` WHERE `state` = 1"
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

// 由user account 查询已借阅书籍
router.get("/borrowed_for_user", async (req, res) => {
  let user_account = req.query.user_account;
  let { err, rows } = await db.async.all(
    "SELECT * FROM `book` WHERE `user_account` = ?",
    [user_account]
  );

  if (err == null) {
    res.send({
      code: 200,
      msg: "查询成功",
      rows,
    });
  } else {
    res.send({
      code: 500,
      msg: "查询失败",
    });
  }
});

router.get("/borrowed_num_for_user", async (req, res) => {
  let user_account = req.query.user_account;

  let { err, rows } = await db.async.all(
    "SELECT COUNT(*) FROM `book` WHERE `user_account` = ?",
    [user_account]
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

// 由用户归还书籍
router.put("/return_for_user", async (req, res) => {
  let { id } = req.body;

  let { err, rows } = await db.async.run(
    "UPDATE `book` SET `due_time` = NULL,`user_account`=NULL,`state`=1 WHERE `id` = ?",
    [id]
  );
  if (err == null) {
    res.send({
      code: 200,
      msg: "归还书籍成功",
    });
  } else {
    res.send({
      code: 500,
      msg: "归还书籍失败",
    });
  }
});

// 用户查询书籍
router.get("/show_for_user", async (req, res) => {
  let { err, rows } = await db.async.all(
    "SELECT `name`,`category`,`state`,`author`,`id`,`due_time`,`user_account`,`star`  FROM `book`"
  );

  if (err == null && rows.length > 0) {
    res.send({
      code: 200,
      msg: "查询成功",
      rows,
    });
  } else {
    res.send({
      code: 500,
      msg: "查询失败",
    });
  }
});

// 用户查询书籍简介
router.get("/detail", async (req, res) => {
  let { id } = req.query;
  let { err, rows } = await db.async.all("SELECT * FROM `book` WHERE `id`=?", [
    id,
  ]);

  if (err == null) {
    res.send({
      code: 200,
      msg: "查询成功",
      rows,
    });
  } else {
    res.send({
      code: 500,
      msg: "查询失败",
    });
  }
});

// 用户评价书籍
router.put("/star", async (req, res) => {
  let { star, id } = req.body;

  let { err, rows } = await db.async.run(
    "UPDATE `book` SET `star` = ? WHERE `id` = ?",
    [star, id]
  );

  if (err == null) {
    res.send({
      code: 200,
      msg: "评分成功，感谢您的支持",
    });
  } else {
    res.send({
      code: 500,
      msg: "失败",
    });
  }
});
module.exports = router;
