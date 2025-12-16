import { Request, Response } from "express";
import { topicService } from "./topic.services";

class TopicController {

    async createTopic(req: Request, res: Response) {
        try {
            const payload = {
                title: req.body.title,
                route: req.body.route,
                isActive: req.body.isActive
            };
            if (!payload.title || !payload.route) {
                return res.status(400).send({
                    message: "title and route are required"
                });
            }

            const existing: any = await topicService.findByRoute(payload.route);
            if (existing) {
                return res.status(409).send({
                    message: "route already exists"
                });
            }
            const Topic = await topicService.saveTopicValues(payload);
            return res.status(201).send(Topic);
        } catch (err) {
            console.error("createTopic error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async updateTopic(req: Request, res: Response) {
        try {
            const TopicId = req.query.TopicId;
            const payload = req.body;

            if (!TopicId) {
                return res.status(400).send({
                    message: "TopicId is required"
                });
            }

            const updated: any = await topicService.updateTopicValues(TopicId, payload);

            if (!updated.status) {
                return res.status(404).send({
                    message: updated.message
                });
            }

            return res.status(200).send(updated);

        } catch (err) {
            console.error("updateTopic error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async deleteTopic(req: Request, res: Response) {
        try {
            const TopicId = req.query.TopicId;

            if (!TopicId) {
                return res.status(400).send({
                    message: "TopicId is required"
                });
            }

            const deleted = await topicService.deleteTopicByTopicId(TopicId);

            if (!deleted.status) {
                return res.status(404).send({
                    message: deleted.message
                });
            }

            return res.status(200).send(deleted);

        } catch (err) {
            console.error("deleteTopic error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async getTopics(req: Request, res: Response) {
        try {
            const result = await topicService.getTopics(req.query);

            if (!result.status) {
                return res.status(400).send(result);
            }

            return res.status(200).send(result);

        } catch (err) {
            console.error("getTopics error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }

    async getTopic(req: Request, res: Response) {
        try {
            const TopicId = String(req.query.TopicId || "");

            if (!TopicId) {
                return res.status(400).send({
                    status: false,
                    message: "TopicId is required",
                    data: []
                });
            }

            const result = await topicService.getTopicByTopicId(TopicId);

            if (!result.status) {
                return res.status(404).send(result);
            }

            return res.status(200).send(result);

        } catch (err) {
            console.error("getTopic error:", err);
            return res.status(500).send({
                message: "Internal server error"
            });
        }
    }
}

export const topicController = new TopicController();
