import { Request, Response } from "express";
import crypto from "crypto";
import { authService, JwtResponse } from "../helper/auth.services";
import { userService } from "../user/user.services";
import MembershipModel from "../membership/membership.model";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password) {
            return res.status(400).send({ message: "email and password are required" });
        }
        const existing: any = await userService.findByEmail(email);
        if (!existing) {
            return res.status(401).send({ message: "Invalid email or password" });
        }
        const sha256Password = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        const a = Buffer.from(sha256Password);
        const b = Buffer.from(existing.password ?? "");

        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            return res.status(401).send({ message: "Invalid email or password" });
        }
        const payload = {
            sub: existing._id,
            userId: existing.userId,
            email: existing.email,
            role: existing.RoleId
        };

        const jwtResp = await authService.createJWT(payload);
        if (!jwtResp.status) {
            return res.status(500).send({ message: "Failed to generate token" });
        }
        let membership: any[] = [];
        if (existing.hasmembership && existing.MembershipId) {
            membership = await MembershipModel.find({
                MembershipId: existing.MembershipId,
                isActive: true
            })
                .select("-__v -createdAt -updatedAt")
                .lean();
        }
        return res.status(200).send({
            message: "Login successful",
            data: {
                id: existing._id,
                userId: existing.userId,
                email: existing.email,
                role: existing.RoleId,
                hasmembership: existing.hasmembership || false,
                token: jwtResp.data,
                membership,
            }
        });
    } catch (err: any) {
        console.error("login error:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};