import { Request, Response } from "express";
import crypto from "crypto";
import { authService, JwtResponse } from "../helper/auth.services";
import { userService } from "../user/user.services";

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
        const sha256Password = crypto.createHash("sha256").update(password).digest("hex");
        console.log('sha256Password', sha256Password);
        const a = Buffer.from(sha256Password);
        const b = Buffer.from(existing.password ?? "");
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            return res.status(401).send({ message: "Invalid email or password" });
        }
        const payload = {
            sub: existing._id,
            userId: existing.userId,
            email: existing.email,
            role: existing.role,
        };
        const jwtResp: JwtResponse<string> = await authService.createJWT(payload);
        if (!jwtResp.status) {
            console.error("JWT generation failed:", jwtResp.message);
            return res.status(500).send({ message: "Failed to generate token" });
        }

        return res.status(200).send({
            message: "Login successful",
            data: {
                id: existing._id,
                userId: existing.userId,
                email: existing.email,
                role: existing.role,
                token: jwtResp.data,
            },
        });
    } catch (err: any) {
        console.error("login error:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};
