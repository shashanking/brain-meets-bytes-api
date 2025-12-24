import { Router } from "express";
import { membershipController } from "./membership.controller";

const router = Router();

router.post("/", membershipController.createMembership.bind(membershipController));
router.put("/", membershipController.updateMembership.bind(membershipController));
router.delete("/", membershipController.deleteMembership.bind(membershipController));
router.get("/one", membershipController.getMembership.bind(membershipController));
router.get("/", membershipController.getMemberships.bind(membershipController));

export default router;
