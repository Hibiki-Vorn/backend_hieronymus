import { User, Post, Comment, AuthenticatedRequest } from "./types";
import { MongoClient, ObjectId } from "mongodb";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;
const MONGO_URI = process.env.MONGO_URI!;
const client = new MongoClient(MONGO_URI);

let db = client.db("userData");

const usersCol = db.collection<User>("users");
const postsCol = db.collection<Post>("posts");
const commentsCol = db.collection<Comment>("comments");

client.connect().then(async () => {
    await db.collection("loggedOut_token").createIndex(
        { exp: 1 },
        { expireAfterSeconds: 0 }
    );
});

export const register = async (req: Request, res: Response) => {
    const { name, avatar, passwd } = req.body;
    if (!name || !passwd) {
        return res.status(400).json({ Msg: "Name and password are required" });
    }

    const existingUser = await usersCol.findOne({ name }) as User | null;
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

    const result = await usersCol.insertOne(newUser);
    res.json({ Msg: "success", insertedId: result.insertedId });

}

export const login = async (req: Request, res: Response) => {
    const { name, passwd } = req.body;
    if (!name || !passwd) {
        return res.status(400).json({ Msg: "Name and password are required" });
    }

    const user = await usersCol.findOne({ name }) as User | null;
    if (!user) {
        return res.status(400).json({ Msg: "Username or password mistake" });
    }

    const match = await bcrypt.compare(passwd, user.passwd_hash);
    if (!match) {
        return res.status(400).json({ Msg: "Username or password mistake" });
    }

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "1y" });
    res.json({ token });
}

export const logout = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        const verified = jwt.verify(token, JWT_SECRET) as { exp: number };

        await db.collection("loggedOut_token").insertOne({
            token,
            exp: new Date(verified.exp * 1000),
        });

        res.json({ Msg: "Logged out successfully" });
    } catch (err) {
        res.status(400).json({ Msg: "Invalid token" });
    }
}

export const newpost = async (req: AuthenticatedRequest, res: Response) => {
    const { content } = req.body;

    const post_result = await postsCol.insertOne({
        user: req.user ,
        content: content,
        createdAt: new Date(),
    })

    res.json({ post_id: post_result.insertedId })

}

export const delpost = async (req: Request, res: Response) => {
    const { post_id } = req.body;

    const post_result = await postsCol.findOne({
        _id: new ObjectId(post_id)
    }) as Post

    res.json({ post_id: post_result })

}

export const commentPost = async (req: AuthenticatedRequest, res: Response) => {
    const { post_id, content } = req.body;

    if (await postsCol.findOne({_id: new ObjectId(post_id)}) === null) {
        return res.status(404).json({ Msg: "Post not Found" })
    }

    const commentPost_result = await commentsCol.insertOne({
        content: content,
        Father_ptr: new ObjectId(post_id),
        FatherType: "Post",
        createdAt: new Date(),
        has_subComment: false,
        user: req?.user
    })

    res.json({ post_id: commentPost_result.insertedId })

}

export const delcomment = async (req: Request, res: Response) => {
    const { comment_id } = req.body;

    const comment_result = await commentsCol.findOne({
        _id: comment_id
    }) as Post

    res.json({ post_id: comment_result })

}

export const replyComment = async (req: AuthenticatedRequest, res: Response) => {
    const { comment_id, content } = req.body;

    if (await commentsCol.findOne({_id: new ObjectId(comment_id)}) === null) {
        return res.status(404).json({ Msg: "Comment not Found" })
    }

    await commentsCol.updateOne(
        { _id: new ObjectId(comment_id) },
        { $set: { has_subComment: true } } // ✅ 必须加 $set
    )

    const commentPost_result = await commentsCol.insertOne({
        content: content,
        Father_ptr: new ObjectId(comment_id),
        FatherType: "Comment",
        createdAt: new Date(),
        has_subComment: false,
        user: req?.user
    })

    res.json({ post_id: commentPost_result.insertedId })

}

export const getPostComment = async (req: Request, res: Response) => {
    const postIdStr = req.query.post_id as string;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    if (!postIdStr) return res.status(400).json({ Msg: "post_id required" });

    const postId = new ObjectId(postIdStr);

    const postExists = await postsCol.findOne({ _id: postId });
    if (!postExists) return res.status(404).json({ Msg: "Post not Found" });

    const comments = await commentsCol
        .find({ Father_ptr: postId, FatherType: "Post" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray();

    res.json(comments);
}

export const getCommentReply = async (req: Request, res: Response) => {
    const commentIdStr = req.query.comment_id as string;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    if (!commentIdStr) return res.status(400).json({ Msg: "comment_id required" });

    const commentId = new ObjectId(commentIdStr);

    const commentExists = await commentsCol.findOne({ _id: commentId });
    if (!commentExists) return res.status(404).json({ Msg: "Comment not Found" });

    const replies = await commentsCol
        .find({ Father_ptr: commentId, FatherType: "Comment" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray();

    res.json(replies);
}

export const likePost = async (req: Request, res: Response) => {
    const { post_id } = req.body;
    const userId = new ObjectId(req.user!.id);

    const post = await postsCol.findOne({ _id: new ObjectId(post_id) });
    if (!post) return res.status(404).json({ Msg: "Post not found" });

    const hasLiked = post.likes?.some((id: ObjectId) => id.equals(userId));

    if (hasLiked) {
        await postsCol.updateOne(
            { _id: new ObjectId(post_id) },
            { $pull: { likes: userId } }
        );
    } else {
        await postsCol.updateOne(
            { _id: new ObjectId(post_id) },
            { $addToSet: { likes: userId } }
        );
    }

    res.json({ liked: !hasLiked });
};

export const likeComment = async (req: Request, res: Response) => {
    const { comment_id } = req.body;
    const userId = new ObjectId(req.user!.id);

    const comment = await commentsCol.findOne({ _id: new ObjectId(comment_id) });
    if (!comment) return res.status(404).json({ Msg: "Comment not found" });

    const hasLiked = comment.likes?.some((id: ObjectId) => id.equals(userId));

    if (hasLiked) {
        await commentsCol.updateOne(
            { _id: new ObjectId(comment_id) },
            { $pull: { likes: userId } }
        );
    } else {
        await commentsCol.updateOne(
            { _id: new ObjectId(comment_id) },
            { $addToSet: { likes: userId } }
        );
    }

    res.json({ liked: !hasLiked });
};

export const favoritePost = async (req: Request, res: Response) => {
    const { post_id } = req.body;
    const userId = new ObjectId(req.user!.id);

    const post = await postsCol.findOne({ _id: new ObjectId(post_id) });
    if (!post) return res.status(404).json({ Msg: "Post not found" });

    const hasFavorited = post.favorites?.some((id: ObjectId) => id.equals(userId));

    if (hasFavorited) {
        await postsCol.updateOne(
            { _id: new ObjectId(post_id) },
            { $pull: { favorites: userId } }
        );
    } else {
        await postsCol.updateOne(
            { _id: new ObjectId(post_id) },
            { $addToSet: { favorites: userId } }
        );
    }

    res.json({ favorited: !hasFavorited });
};

export const favoriteComment = async (req: Request, res: Response) => {
    const { comment_id } = req.body;
    const userId = new ObjectId(req.user!.id);

    const comment = await commentsCol.findOne({ _id: new ObjectId(comment_id) });
    if (!comment) return res.status(404).json({ Msg: "Comment not found" });

    const hasFavorited = comment.favorites?.some((id: ObjectId) => id.equals(userId));

    if (hasFavorited) {
        await commentsCol.updateOne(
            { _id: new ObjectId(comment_id) },
            { $pull: { favorites: userId } }
        );
    } else {
        await commentsCol.updateOne(
            { _id: new ObjectId(comment_id) },
            { $addToSet: { favorites: userId } }
        );
    }

    res.json({ favorited: !hasFavorited });
};
