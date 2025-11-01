import { Request, Response } from "express";
import axios, { AxiosError } from 'axios';
import { MulterRequest } from "./types";
import fs from "fs";

export const ocr = async (req: MulterRequest, res: Response) => {
    try {
        const filePath = req.file.path;
        const imageBuffer = fs.readFileSync(filePath);

        const response = await axios.post(
            'http://python-service:5000/ocr',
            imageBuffer,
            { headers: { 'Content-Type': 'application/octet-stream' } }
        );

        fs.unlinkSync(filePath);
        res.json(response.data);
    } catch (err: unknown) {
        res.status(500).json({ error: (err as AxiosError).message });
    }
}
