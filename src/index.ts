import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "./types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET!;
const MONGO_URI = process.env.MONGO_URI!;
const client = new MongoClient(MONGO_URI);

let db = client.db();

client.connect().then(() => console.log("Connected to MongoDB"));

app.get("/", async (req: Request, res: Response) => {
  res.json({ Msg: "success" });
});

// 注册
app.post("/register", async (req: Request, res: Response) => {
  const { name, avatar, passwd } = req.body;
  if (!name || !passwd) {
    return res.status(400).json({ Msg: "Name and password are required" });
  }

  const existingUser = await db.collection("users").findOne({ name }) as User | null;
  if (existingUser) {
    return res.status(400).json({ Msg: "Username already exists" });
  }

  const saltRounds = 12;
  const hash = await bcrypt.hash(passwd, saltRounds);

  const newUser: User = {
    name,
    avatar: avatar || "",
    passwd_hash: hash,
  };

  const result = await db.collection("users").insertOne(newUser);
  res.json({ Msg: "success", insertedId: result.insertedId });
});

// 登录
app.post("/login", async (req: Request, res: Response) => {
  const { name, passwd } = req.body;
  if (!name || !passwd) {
    return res.status(400).json({ Msg: "Name and password are required" });
  }

  const user = await db.collection("users").findOne({ name }) as User | null;
  if (!user) {
    return res.status(400).json({ Msg: "Username or password mistake" });
  }

  const match = await bcrypt.compare(passwd, user.passwd_hash);
  if (!match) {
    return res.status(400).json({ Msg: "Username or password mistake" });
  }

  const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "1y" });
  res.json({ token });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
