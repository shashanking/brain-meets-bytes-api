import { Router } from "express";
import userRoutes from "./user/user.routes";
import loginRoutes from "./login/login.routes";

const router = Router();
router.use("/users", userRoutes);
router.use("/login", loginRoutes);

export default router;
