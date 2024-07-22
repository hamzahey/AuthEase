import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3001;
const saltRounds = 10;

const db = new pg.Client(
  {
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "password",
    port: 5432,
  }
);
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  
  try {
    const checkResult = db.query("SELECT * FROM users WHERE email = $1",[
      email
    ]);

    if ((await checkResult).rows.length>0){
      res.send("Email already exists. Try Loggin in!");
    }else{
      // Password Hashing - Encryption
      bcrypt.hash(password, saltRounds, async (err, hash)=>{
        if (err) {
          console.log(err);
        }

        const result = db.query("INSERT INTO users (email, password) VALUES ($1, $2)",[
          email, hash
        ]);
        console.log(result);
        res.render("secrets.ejs")
      });
      
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    try {
      const result = db.query("SELECT * FROM users WHERE email = $1",[
        email
      ]);
      if ((await result).rows.length > 0) {
      console.log((await result).rows[0].password);
        const user = (await result).rows[0];
        const storedPassword = user.password;
  
        if (password === storedPassword) {
          res.render("secrets.ejs");
        } else {
          res.send("Incorrect Password");
        }
      } else {
        res.send("User not found");
      }
    } catch (error) {
      console.log(error);
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
