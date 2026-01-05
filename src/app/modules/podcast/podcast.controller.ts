import { Request, Response } from "express";
import { podcastService } from "./podcast.services";

class PodcastController {

    async reactPodcast(req: Request, res: Response) {
        try {
            const { sanityPodcastId, podcastName, reaction } = req.body;
            const userId = (req as any).user?.userId;

            if (!sanityPodcastId || !podcastName || !reaction) {
                return res.status(400).send({
                    status: false,
                    message: "sanityPodcastId, podcastName and reaction are required"
                });
            }

            if (!["like", "dislike"].includes(reaction)) {
                return res.status(400).send({
                    status: false,
                    message: "reaction must be like or dislike"
                });
            }

            const result = await podcastService.togglePodcastReaction(
                sanityPodcastId,
                podcastName,
                userId,
                reaction
            );

            return res.status(200).send(result);
        } catch (error) {
            console.error("reactPodcast error:", error);
            return res.status(500).send({
                status: false,
                message: "Internal server error"
            });
        }
    }

    async getPodcastReactionStatus(req: Request, res: Response) {
        try {
            const { sanityPodcastId } = req.query;
            const userId = (req as any).user?.userId;

            if (!sanityPodcastId) {
                return res.status(400).send({
                    status: false,
                    message: "sanityPodcastId is required"
                });
            }

            const result = await podcastService.getPodcastReactionStatus(
                sanityPodcastId as string,
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
            console.error("getPodcastReactionStatus error:", error);
            return res.status(500).send({
                status: false,
                message: "Internal server error"
            });
        }
    }

    async addComment(req: Request, res: Response) {
        try {
            const { sanityPodcastId, comment, parentCommentId } = req.body;
            const userId = (req as any).user?.userId;

            if (!sanityPodcastId || !comment) {
                return res.status(400).send({
                    status: false,
                    message: "sanityPodcastId and comment are required"
                });
            }

            const result = await podcastService.addPodcastComment(
                sanityPodcastId,
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

            const result = await podcastService.togglePodcastCommentLike(
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
            const { sanityPodcastId } = req.query;

            if (!sanityPodcastId) {
                return res.status(400).send({
                    status: false,
                    message: "sanityPodcastId is required"
                });
            }

            const comments = await podcastService.getPodcastComments(
                sanityPodcastId as string
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
                await podcastService.getPodcastCommentReactionCount(
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

    savePodcast = async (req: Request, res: Response) => {
        const sanityPodcastId = (req.body.sanityPodcastId);
        const userId = (req as any).user?.userId;
        if (!sanityPodcastId) {
            return res.status(400).send({
                message: "sanityPodcastId is required"
            });
        }
        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }
        const result = await podcastService.toggleSavePodcast(
            sanityPodcastId,
            userId
        );
        return res.status(result.status ? 200 : 400).send(result);
    };

    getSavedUsersForPodcast = async (req: Request, res: Response) => {
        const sanityPodcastId = req.query.sanityPodcastId as string;
        const userId = (req as any).user?.userId;
        if (!sanityPodcastId) {
            return res.status(400).send({
                message: "sanityPodcastId is required"
            });
        }

        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }

        const result = await podcastService.getSavedUsersForMyPodcast(
            sanityPodcastId,
            userId,
            req.query
        );

        return res.status(result.status ? 200 : 403).send(result);
    };

    getMySavedPodcasts = async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }
        const result = await podcastService.getMySavedPodcasts(
            userId,
            req.query
        );

        return res.status(200).send(result);
    };

}

export const podcastController = new PodcastController();
