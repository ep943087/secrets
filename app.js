require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
const port = process.env.port || 3000;
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

userSchema.statics.verifyCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Cannot loggin");
  if (user.password !== password) throw new Error("Cannot loggin");
  return user;
};

const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.verifyCredentials(email, password);
    res.render("secrets");
  } catch (e) {
    console.log(e);
    res.render("login");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const newUser = new User({ email, password });

  try {
    await newUser.save();
    res.render("secrets");
  } catch (e) {
    console.log("Errors");
  }
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});
