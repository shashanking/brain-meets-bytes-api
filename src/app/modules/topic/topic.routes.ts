import { Router } from "express";
import { topicController } from "./topic.controller";

const router = Router();

router.post("/", topicController.createTopic.bind(topicController));
router.put("/", topicController.updateTopic.bind(topicController));
router.delete("/", topicController.deleteTopic.bind(topicController));
router.get("/", topicController.getTopics.bind(topicController));
router.get("/one", topicController.getTopic.bind(topicController));

export default router;
