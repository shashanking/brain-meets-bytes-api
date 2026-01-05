import { Router } from "express";
import { pollController } from "./polls.controller";

const router = Router();

router.post("/", pollController.createPoll.bind(pollController));
router.get("/", pollController.getAllPolls.bind(pollController));
router.get("/", pollController.getPoll.bind(pollController));
router.post("/vote", pollController.votePoll.bind(pollController));
router.put("/", pollController.updatePoll.bind(pollController));
router.get("/PollResult", pollController.getPollResult.bind(pollController));

export default router;
