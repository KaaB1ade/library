const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { db, genid } = require("../db/DbUtils");

router.post("/add", async (req, res) => {
  let { name, mail, content } = req.body;

  const now = new Date();
  create_time = now.toISOString().slice(0, 19).replace("T", " ");

  let { err, rows } = await db.async.run(
    "INSERT INTO `report` (`name`,`mail`,`content`,`create_time`) VALUES (?,?,?,?)",
    [name, mail, content, create_time]
  );

  let report_info = {
    name: name,
    mail: mail,
    content: content,
    create_time: create_time,
  };
  if (err == null) {
    res.send({
      code: 200,
      msg: "发送成功",
      data: report_info,
    });
  } else {
    res.send({
      code: 500,
      msg: "发送失败",
    });
  }
});

module.exports = router;
