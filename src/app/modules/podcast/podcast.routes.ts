import { Router } from "express";
import { podcastController } from "./podcast.controller";

const router = Router();

router.post("/like", podcastController.reactPodcast.bind(podcastController));
router.get("/like", podcastController.getPodcastReactionStatus.bind(podcastController));
router.post("/comments", podcastController.addComment.bind(podcastController));
router.get("/comments", podcastController.getComments.bind(podcastController));
router.post("/comments/like", podcastController.likeComment.bind(podcastController));
router.get("/comments/count", podcastController.getCommentReactionCount.bind(podcastController));
// router.post("/comments/like", podcastController.likeComment.bind(podcastController));
// router.get("/comments/like", podcastController.getCommentswithlike.bind(podcastController));



export default router;
