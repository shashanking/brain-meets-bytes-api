import { Router } from "express";
import { articleController } from "./article.controller";

const router = Router();

router.post("/like", articleController.reactArticle.bind(articleController));
router.get("/like", articleController.getArticleReactionStatus.bind(articleController));
router.post("/comments", articleController.addComment.bind(articleController));
router.get("/comments", articleController.getComments.bind(articleController));
router.post("/comments/like", articleController.likeComment.bind(articleController));
router.get("/comments/count", articleController.getCommentReactionCount.bind(articleController));
// router.post("/comments/like", articleController.likeComment.bind(articleController));
// router.get("/comments/like", articleController.getCommentswithlike.bind(articleController));



export default router;
