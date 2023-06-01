const express = require("express");
const multer = require("multer");
const path = require("path");
const { db, genid } = require("./db/DbUtils");
const app = new express();

const port = 8080;

//开放跨域请求
app.use(function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "*");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method == "OPTIONS") res.sendStatus(200); //让options尝试请求快速结束
  else next();
});

app.use(express.json());
const update = multer({
  dest: "./public/upload/temp",
});
app.use(update.any());
app.use(express.static(path.join(__dirname, "public")));

const USER_TOKEN_PATH = "/_token";
app.all("*", async (req, res, next) => {
  if (req.path.indexOf(USER_TOKEN_PATH) > -1) {
    let { token } = req.headers;

    let admin_sql = " SELECT * FROM `admin` WHERE `token`=? ";
    admin_result = await db.async.all(admin_sql, [token]);
    if (admin_result.err == null) {
      next();
      return;
    }

    let user_sql = " SELECT * FROM `user` WHERE `token`=? ";
    user_result = await db.async.all(user_sql, [token]);
    if (user_result.err != null || user_result.rows.length == 0) {
      res.send({
        code: 403,
        msg: "login first!",
      });
      return;
    } else {
      next();
    }
  } else {
    next();
  }
});

app.use("/admin", require("./routers/AdminRouter"));
app.use("/user", require("./routers/UserRouter"));
app.use("/book", require("./routers/BookRouter"));
app.use("/report", require("./routers/ReportRouter"));

app.get("/", (req, res) => {
  res.send("hello");
});

app.listen(port, () => {
  console.log(`server is up on http://localhost:${port}`);
});
