import { Router } from "express";
import { threadController } from "./threads.controller";

const router = Router();

router.post("/", threadController.createThread.bind(threadController));
router.put("/", threadController.updateThread.bind(threadController));
router.delete("/", threadController.deleteThread.bind(threadController));
router.get("/", threadController.getThreads.bind(threadController));
router.get("/FulldetailsofThreads", threadController.FulldetailsofThreads.bind(threadController));
router.get("/one", threadController.getThreads.bind(threadController));
router.post("/like", threadController.likeThread.bind(threadController));
router.post("/comments", threadController.addComment.bind(threadController));
router.get("/comments", threadController.getComments.bind(threadController));
router.post("/comments/reply", threadController.replyComment.bind(threadController));
router.get("/comments/reply", threadController.getreplyComments.bind(threadController));
router.post("/comments/like", threadController.likeComment.bind(threadController));
router.get("/comments/like", threadController.getCommentswithlike.bind(threadController));
router.post("/report", threadController.report.bind(threadController));
router.get("/getReports", threadController.getReports.bind(threadController));
router.get("/getSavedUsersFrThread", threadController.getSavedUsersForThread.bind(threadController));
router.post("/save", threadController.saveThread.bind(threadController));
router.get("/getMySavedThreads", threadController.getMySavedThreads.bind(threadController));



export default router;
