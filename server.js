//1. まずはexpressというnode.jsの機能を使えるよう読み込みましょう🤗
const { Prisma } = require("@prisma/client");
const express = require("express");

// 2. ここで実行をします🤗appの箱の中でexpressの機能が使えるようにしています🤗
const app = express();

// prismaのclientの機能を使えるようにする🤗
const { PrismaClient } = require("@prisma/client");

// パスワードハッシュ化
const bcrypt = require("bcrypt");

// json web token jwtの機能を設定します🤗
const jwt = require("jsonwebtoken");

// 環境変数=秘密の鍵が使えるようにdotenvを記述して使えるようにします🤗
require("dotenv");

// clientの機能を使えるように設定する
const prisma = new PrismaClient();

//3. PORT=どの番号で画面のURLを設定するかというものです🤗
// 例: 8888の場合は localhost:8888になります🤗
const PORT = 8888;

// jsで書いた文字列をjsonとしてexpressで使えるようにする必要があります🤗
app.use(express.json());

// 5.簡単なAPIの挙動を確認、作成してみます🤗
// getはデータを表示するようなイメージです🤗

app.get("/", (req, res) => {
  res.send("<h1>おおほりは長野で研究しています!!</h1>");
});

//6.新規ユーザー登録のAPIを作成します🤗
app.post("/api/auth/register", async (req, res) => {
  // 送られるものを抜き出します🤗分割代入 es6の新しいおまじないです🤗
  const { username, email, password } = req.body;

  // 暗号化対応=bcryptを使ってハッシュ化する🫠
  const hasedPass = await bcrypt.hash(password, 10);

  // ここがプリズマの文法になります🤗[user]はモデルUserになります🤗
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hasedPass,
    },
  });

  // prismaにデータを送った後にjsonでデータを戻します🤗
  return res.json({ user });

  // 下は消さない
});


// 2025.02.16追加 ログインAPI開発
app.post("/api/auth/login", async (req, res) => { 
  //  email,passwordを受け取る、チェックするために
  const { email, password } = req.body;

  // whereはSQL等で出てくる条件を絞るおまじないです（SQL文です）
  const user = await prisma.user.findUnique({ where: { email} });

  //emailがあるかないかを先ほどuserのところの箱に収納したので、if文でチェックします
  if (!user) {
    return res.status(401).json({
      error: "ユーザーが存在しません",
    });
  }

  // パスワードが一致しているかどうかをチェックします
  const isPasswordCheck = await bcrypt.compare(password, user.password);

  // パスワードがあっているかどうか、保存されているものをちぇっくしているぜ☆
  if (!isPasswordCheck) {
    return res.status(401).json({
      error: "パスワードが違います",
    });
  }

  // emailとパスワードをチェックし、無事見つけ出せたらチケット（token＝乗車券）を発行します
  const token = jwt.sign({ id: user.id }, process.env.KEY, {
    expiresIn: "1d",
  });

  return res.json({ token });

  // この下は消さない
});










// 絶対ここから上に書く（サーバー起動が最後！）

//4.サーバーを起動させましょう🤗イメージはスイッチONにして動かす🤗
app.listen(PORT, () => {
  console.log("server start!!!!!!");
});