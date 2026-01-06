import { Request, Response } from "express";
import { articleService } from "./article.services";

class ArticleController {

    async reactArticle(req: Request, res: Response) {
        try {
            const { sanityArticleId, articleName, reaction } = req.body;
            const userId = (req as any).user?.userId;

            if (!sanityArticleId || !articleName || !reaction) {
                return res.status(400).send({
                    status: false,
                    message: "sanityArticleId, articleName and reaction are required"
                });
            }

            if (!["like", "dislike"].includes(reaction)) {
                return res.status(400).send({
                    status: false,
                    message: "reaction must be like or dislike"
                });
            }

            const result = await articleService.toggleArticleReaction(
                sanityArticleId,
                articleName,
                userId,
                reaction
            );

            return res.status(200).send(result);
        } catch (error) {
            console.error("reactArticle error:", error);
            return res.status(500).send({
                status: false,
                message: "Internal server error"
            });
        }
    }

    async getArticleReactionStatus(req: Request, res: Response) {
        try {
            const { sanityArticleId } = req.query;
            const userId = (req as any).user?.userId;
            if (!sanityArticleId) {
                return res.status(400).send({
                    status: false,
                    message: "sanityArticleId is required"
                });
            }
            const result = await articleService.getArticleReactionStatus(
                sanityArticleId as string,
                userId
            );
            if (!result) {
                return res.status(404).send({
                    status: false,
                    message: "No data found"
                });
            }
            return res.status(200).send({
                status: true,
                data: result
            });
        } catch (error) {
            console.error("getArticleReactionStatus error:", error);
            return res.status(500).send({
                status: false,
                message: "Internal server error"
            });
        }
    }

    async addComment(req: Request, res: Response) {
        try {
            const { sanityArticleId, comment, parentCommentId } = req.body;
            const userId = (req as any).user?.userId;

            if (!sanityArticleId || !comment) {
                return res.status(400).send({
                    status: false,
                    message: "sanityArticleId and comment are required"
                });
            }

            const result = await articleService.addArticleComment(
                sanityArticleId,
                userId,
                comment,
                parentCommentId
            );

            return res.status(201).send({
                status: true,
                data: result
            });
        } catch (error: any) {
            return res.status(400).send({
                status: false,
                message: error.message
            });
        }
    }

    async likeComment(req: Request, res: Response) {
        try {
            const { CommentId } = req.body;
            const userId = (req as any).user?.userId;

            if (!CommentId) {
                return res.status(400).send({
                    status: false,
                    message: "CommentId is required"
                });
            }

            const result = await articleService.toggleArticleCommentLike(
                Number(CommentId),
                userId
            );

            return res.status(200).send(result);
        } catch (error) {
            console.log(error);

            return res.status(500).send({
                status: false,
                message: "Internal server error"
            });
        }
    }

    async getComments(req: Request, res: Response) {
        try {
            const { sanityArticleId } = req.query;

            if (!sanityArticleId) {
                return res.status(400).send({
                    status: false,
                    message: "sanityArticleId is required"
                });
            }

            const comments = await articleService.getArticleComments(
                sanityArticleId as string
            );

            return res.status(200).send({
                status: true,
                data: comments
            });
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: "Internal server error"
            });
        }
    }

    async getCommentReactionCount(req: Request, res: Response) {
        try {
            const { CommentId } = req.query;

            if (!CommentId) {
                return res.status(400).send({
                    status: false,
                    message: "CommentId is required"
                });
            }

            const result =
                await articleService.getArticleCommentReactionCount(
                    Number(CommentId)
                );

            if (!result) {
                return res.status(404).send({
                    status: false,
                    message: "No data found"
                });
            }

            return res.status(200).send({
                status: true,
                data: result
            });
        } catch (error) {
            return res.status(500).send({
                status: false,
                message: "Internal server error"
            });
        }
    }

    saveArticle = async (req: Request, res: Response) => {
        const sanityArticleId = (req.body.sanityArticleId);
        const userId = (req as any).user?.userId;
        if (!sanityArticleId) {
            return res.status(400).send({
                message: "sanityArticleId is required"
            });
        }
        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }
        const result = await articleService.toggleSaveArticle(
            sanityArticleId,
            userId
        );
        return res.status(result.status ? 200 : 400).send(result);
    };

    getSavedUsersForArticle = async (req: Request, res: Response) => {
        const sanityArticleId = req.query.sanityArticleId as string;
        const userId = (req as any).user?.userId;
        if (!sanityArticleId) {
            return res.status(400).send({
                message: "sanityArticleId is required"
            });
        }
        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }
        const result = await articleService.getSavedUsersForMyArticle(
            sanityArticleId,
            userId,
            req.query
        );
        return res.status(result.status ? 200 : 403).send(result);
    };

    getMySavedArticle = async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }
        const result = await articleService.getMySavedArticles(
            userId,
            req.query
        );
        return res.status(200).send(result);
    };

}

export const articleController = new ArticleController();
