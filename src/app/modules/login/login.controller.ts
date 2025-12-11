import { Request, Response } from "express";
import crypto from "crypto";
import { createJWT, JwtResponse } from "../helper/auth.services";
import { userService } from "../user/user.services";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body ?? {};

        if (!email || !password) {
            return res.status(400).send({ message: "email and password are required" });
        }

        const existing = await userService.findByEmail(email);
        if (!existing) {
            return res.status(401).send({ message: "Invalid email or password" });
        }
        const storedHash: string | undefined = (existing as any).password;
        const salt: string | undefined = (existing as any).salt;

        if (!storedHash || !salt) {
            console.error("User record missing password or salt", existing);
            return res.status(500).send({ message: "User stored without password/salt" });
        }

        const hashedInput = crypto.createHmac("sha256", salt).update(password).digest("hex");
        if (hashedInput !== storedHash) {
            return res.status(401).send({ message: "Invalid email or password" });
        }
        const payload = {
            sub: (existing as any)._id,         // mongo id
            userId: (existing as any).userId,   // optional numeric id
            email: (existing as any).email,
            role: (existing as any).role ?? "user",
        };
        const jwtResp: JwtResponse<string> = await createJWT(payload);

        if (!jwtResp.status) {
            console.error("JWT generation failed:", jwtResp.message);
            return res.status(500).send({ message: "Failed to generate token" });
        }
        return res.status(200).send({
            message: "Login successful",
            token: jwtResp.data,
            user: {
                id: (existing as any)._id,
                userId: (existing as any).userId,
                email: (existing as any).email,
                role: (existing as any).role,
            },
        });
    } catch (err: any) {
        console.error("login error:", err);
        return res.status(500).send({ message: "Internal server error" });
    }
};
