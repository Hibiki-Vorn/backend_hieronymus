import { Request, Response } from "express";
import { JwtPayload } from "./types";
import jwt from "jsonwebtoken";
import multer from "multer";

const JWT_SECRET = process.env.JWT_SECRET!;

const upload = multer({ dest: "uploads/" });

export const ocr = () => upload.single("image")


export const authenticateToken = (req: Request, res: Response, next: Function) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Require token" });
        
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (typeof decoded === "string") {
        return res.status(403).json({ error: "Invalid token format" });
        }
        
        req.user = decoded as JwtPayload; 
        next();
    } catch {
        return res.status(403).json({ error: "Invalid token" });
    }
}
