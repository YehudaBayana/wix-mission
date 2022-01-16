const cors = require("cors");
const express = require("express");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/", (req, res) => {
    console.log(req.body)
  fetch("https://yehudaba.wixsite.com/my-site-2/_functions/uptade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  })
    .then((res) => res.json())
    .then((data) => res.send(data))
    .catch((err) => res.send(err));
//   res.send({ msg: "success" });
});

app.listen("8080");
