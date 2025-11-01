import express, { Request, Response, RequestHandler } from "express";
import * as user_action from "./user_action";
import * as middleware from "./middleware";
import * as relink from "./relink" 
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/replyComment", middleware.authenticateToken, user_action.replyComment as RequestHandler)

app.post("/commentPost", middleware.authenticateToken, user_action.commentPost as RequestHandler)

app.post("/newpost", middleware.authenticateToken, user_action.newpost as RequestHandler)

app.post("/favoriteComment", middleware.authenticateToken, user_action.favoriteComment)

app.get("/", async (req: Request, res: Response) => res.json({ Msg: "success" }))

app.post("/favoritePost", middleware.authenticateToken, user_action.favoritePost)

app.post("/likeComment", middleware.authenticateToken, user_action.likeComment)

app.post("/delcomment", middleware.authenticateToken, user_action.delcomment)

app.post("/likePost", middleware.authenticateToken, user_action.likePost)

app.post("/delpost", middleware.authenticateToken, user_action.delpost)

app.post("/ocr", middleware.ocr(), relink.ocr as RequestHandler)

app.get("/getCommentReply", user_action.getCommentReply)

app.get("/getPostComment", user_action.getPostComment)

app.post("/register", user_action.register)

app.post("/logout", user_action.logout)

app.post("/login", user_action.login)


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
