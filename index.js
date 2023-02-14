const path = require("path");
const cors = require("cors");
const express = require("express");
const ejs = require("ejs");
const app = express();

const clientId = "id do oauth";
const clientSecret = "client secret do oauth";
const redirectUri = "url que será redirecionado no oauth";

app.listen(80, () => console.log("Listening on port 80."));

app.use(express.static(path.join(__dirname, "public")));
app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "/pages"));
app.use(cors());

app.get("/auth/discord", (req, res) => {
  res.render("index");
});

app.get("/auth/authorized", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(404).json({
      error: "Não foi encontrado o código.",
    });
  }
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
      grant_type: "authorization_code",
      scope: "identify guilds",
    }),
  });

  const tokenData = await tokenResponse.json();
  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization: `${tokenData.token_type} ${tokenData.access_token}`,
    },
  });

  const userData = await userResponse.json();

  if (userData.username) {
    res.render("authorized", {
      user: `${userData.username}#${userData.discriminator}`,
    });
    let userId = userData.id;
    // faça oq vc quiser com esse id, adiciona em algum banco de dados (mongodb, sql), ou oq vc preferir.
    console.log(`Auth: ${userData.username}#${userData.discriminator}`);
  } else {
    res.render("err");
  }
});

app.get("/", (__, res) => res.redirect("/auth/discord"));
