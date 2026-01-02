import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthService } from "./auth.services";

export const createAuthMiddleware = (
    authService: AuthService
): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.url === "/login") {
            return next();
        }

        try {
            const authHeader = req.headers.authorization as string | undefined;
            const tokenHeader = req.headers.token as string | undefined;

            let token: string | undefined;

            if (authHeader) {
                const parts = authHeader.split(" ");
                if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                    token = parts[1].trim();
                } else {
                    token = authHeader.trim();
                }
            } else if (tokenHeader) {
                token = tokenHeader.trim();
            }

            if (!token) {
                return res.status(401).send({
                    status: false,
                    message: "Please pass token",
                    data: [],
                });
            }
            const jwtVerifyResult = await authService.jwtVerify(token);
            if (!jwtVerifyResult?.status || !jwtVerifyResult.data) {
                return res.status(401).send({
                    status: false,
                    message: jwtVerifyResult?.message ?? "Invalid token",
                    data: [],
                });
            }
            const payload = jwtVerifyResult.data as any;
            (req as any).user = {
                userId: payload.userId,
                MembershipId: payload.MembershipId ?? null,
                RoleId: payload.RoleId,
            };

            return next();
        } catch (error) {
            console.error("Error during token verification:", error);
            return res.status(500).send({
                status: false,
                message: "Internal Server Error",
                data: [],
            });
        }
    };
};
