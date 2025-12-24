import { Router } from "express";
import { createAuthMiddleware } from "./helper/auth.middleware";
import { AuthService } from "./helper/auth.services";
import userRoutes from "./user/user.routes";
import loginRoutes from "./login/login.routes";
import roleRoutes from "./role/role.routes";
import categoryRoutes from "./category/category.routes";
import threadsRoutes from "./threads/threads.routes"
import topicsRoutes from "./topic/topic.routes"
import membershipRoutes from "./membership/membership.routes";
const router = Router();

const authService = new AuthService();
const authMiddleware = createAuthMiddleware(authService);

router.use("/users", authMiddleware, userRoutes);
router.use("/roles", authMiddleware, roleRoutes);
router.use("/category", authMiddleware, categoryRoutes);
router.use("/threads", authMiddleware, threadsRoutes);
router.use("/topics", authMiddleware, topicsRoutes);
router.use("/membership", authMiddleware, membershipRoutes);
router.use("/login", loginRoutes);

export default router;
