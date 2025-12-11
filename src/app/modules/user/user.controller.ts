import { Request, Response } from "express";
import { userService } from "./user.services";
import crypto from "crypto";


export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password)
            return res.status(400).send({ message: "name, email and password are required" });

        const existing: any = await userService.findByEmail(email);
        if (existing)
            return res.status(409).send({ message: "Email already registered" });
        const salt = crypto.randomBytes(16).toString("hex");
        const hashedPassword = crypto
            .createHmac("sha256", salt)
            .update(password)
            .digest("hex");

        const user = await userService.saveUserValues({
            name,
            email,
            password: hashedPassword,
            salt,
            role
        });

        return res.status(201).send(user);

    } catch (err) {
        console.error("createUser error:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId; // numeric or string
        const payload = req.body;

        if (!userId)
            return res.status(400).send({ message: "userId is required" });

        const updated: any = await userService.updateUserValues(userId, payload);

        if (!updated.status)
            return res.status(404).send({ message: updated.message });

        return res.status(200).send(updated);
    } catch (err) {
        console.error("updateUser error:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId;

        if (!userId)
            return res.status(400).send({ message: "userId is required" });

        const deleted = await userService.deleteUserByUserId(userId);

        if (!deleted.status)
            return res.status(404).send({ message: deleted.message });

        return res.status(200).send(deleted);
    } catch (err) {
        console.error("deleteUser error:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const result = await userService.getUsers(req.query);
        if (!result.status) {
            return res.status(400).send(result);
        }
        return res.status(200).send(result);
    } catch (err: any) {
        console.error("getUsers error:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = String(req.query.userId || "");
        if (!userId) return res.status(400).send({ status: false, message: "userId is required", data: [] });

        const result = await userService.getUserByUserId(userId);

        if (!result.status) return res.status(404).send(result);

        return res.status(200).send(result);
    } catch (err: any) {
        console.error("getUser error:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};