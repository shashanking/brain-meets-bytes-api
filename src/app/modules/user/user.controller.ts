import { Request, Response } from "express";
import { userService } from "./user.services";
import { createHash } from "crypto";
import { generateTempPassword, sendTempPasswordEmail } from "../helper/mail.services";

class UserController {

    async createUser(req: Request, res: Response) {
        try {
            const { name, email, password, RoleId, ProfilePic, hasmembership, MembershipId } = req.body;
            if (!name || !email || !password) {
                return res.status(400).send({
                    message: "name, email and password are required"
                });
            }

            const existing: any = await userService.findByEmail(email);
            if (existing) {
                return res.status(409).send({
                    message: "Email already registered"
                });
            }

            const hashedPassword = createHash("sha256")
                .update(password)
                .digest("hex");

            const user = await userService.saveUserValues({
                name,
                email,
                password: hashedPassword,
                RoleId,
                ProfilePic,
                hasmembership,
                MembershipId,
            });

            return res.status(201).send(user);

        } catch (err) {
            console.error("createUser error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.query.userId;
            const payload = req.body;

            if (!userId) {
                return res.status(400).send({
                    message: "userId is required"
                });
            }

            const updated: any = await userService.updateUserValues(userId, payload);

            if (!updated.status) {
                return res.status(404).send({
                    message: updated.message
                });
            }

            return res.status(200).send(updated);

        } catch (err) {
            console.error("updateUser error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.query.userId;

            if (!userId) {
                return res.status(400).send({
                    message: "userId is required"
                });
            }

            const deleted = await userService.deleteUserByUserId(userId);

            if (!deleted.status) {
                return res.status(404).send({
                    message: deleted.message
                });
            }

            return res.status(200).send(deleted);

        } catch (err) {
            console.error("deleteUser error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const result = await userService.getUsers(req.query);

            if (!result.status) {
                return res.status(400).send(result);
            }

            return res.status(200).send(result);

        } catch (err) {
            console.error("getUsers error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async getUser(req: Request, res: Response) {
        try {
            const userId = String(req.query.userId || "");

            if (!userId) {
                return res.status(400).send({
                    status: false,
                    message: "userId is required",
                    data: []
                });
            }

            const result = await userService.getUserByUserId(userId);

            if (!result.status) {
                return res.status(404).send(result);
            }

            return res.status(200).send(result);

        } catch (err) {
            console.error("getUser error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).send({
                    message: "Email is required",
                });
            }

            const user: any = await userService.findByEmail(email);

            if (!user) {
                return res.status(404).send({
                    message: "User not found",
                });
            }
            const tempPassword = generateTempPassword();
            const hashedPassword = createHash("sha256")
                .update(tempPassword)
                .digest("hex");
            await userService.updatePasswordByEmail(email, hashedPassword);
            await sendTempPasswordEmail(email, tempPassword);
            return res.status(200).send({
                status: true,
                message: "Temporary password sent to your email",
            });
        } catch (error: any) {
            console.error("forgotPassword error:", error);
            return res.status(500).send({
                message: "Internal server error",
            });
        }
    }
}

export const userController = new UserController();
