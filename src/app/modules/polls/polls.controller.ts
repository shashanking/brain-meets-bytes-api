import { Request, Response } from "express";
import { pollService } from "./polls.services";

class PollController {

    async createPoll(req: Request, res: Response) {
        try {
            const { title, description, options } = req.body;
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).send({
                    status: false,
                    message: "Unauthorized"
                });
            }

            if (!title || !options) {
                return res.status(400).send({
                    status: false,
                    message: "title and options are required"
                });
            }

            const poll = await pollService.createPoll(
                title,
                description,
                options,
                userId
            );

            return res.status(201).send({
                status: true,
                data: poll
            });
        } catch (error: any) {
            return res.status(400).send({
                status: false,
                message: error.message
            });
        }
    }

    async updatePoll(req: Request, res: Response) {
        try {
            const PollId = Number(req.query.PollId);
            const { title, description } = req.body;
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).send({
                    status: false,
                    message: "Unauthorized"
                });
            }

            if (!PollId) {
                return res.status(400).send({
                    status: false,
                    message: "PollId is required"
                });
            }

            if (!title && !description) {
                return res.status(400).send({
                    status: false,
                    message: "Nothing to update"
                });
            }

            const poll = await pollService.updatePoll(
                PollId,
                title,
                description,
                userId
            );

            return res.status(200).send({
                status: true,
                data: poll
            });

        } catch (error: any) {
            return res.status(403).send({
                status: false,
                message: error.message
            });
        }
    }

    async getAllPolls(req: Request, res: Response) {
        const polls = await pollService.getAllPolls();
        return res.status(200).send({ status: true, data: polls });
    }

    async getPoll(req: Request, res: Response) {
        try {
            const PollId = Number(req.query.PollId);

            if (!PollId) {
                return res.status(400).send({
                    status: false,
                    message: "PollId is required"
                });
            }

            const poll = await pollService.getPollById(PollId);

            if (!poll) {
                return res.status(404).send({
                    status: false,
                    message: "Poll not found"
                });
            }

            return res.status(200).send({
                status: true,
                data: poll
            });
        } catch {
            return res.status(500).send({
                status: false,
                message: "Internal server error"
            });
        }
    }

    async votePoll(req: Request, res: Response) {
        try {
            const { PollId, OptionId } = req.body;
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).send({
                    status: false,
                    message: "Unauthorized"
                });
            }

            if (!PollId || !OptionId) {
                return res.status(400).send({
                    status: false,
                    message: "PollId and OptionId are required"
                });
            }

            const result = await pollService.votePoll(
                Number(PollId),
                Number(OptionId),
                userId
            );

            return res.status(200).send(result);
        } catch (error: any) {
            return res.status(400).send({
                status: false,
                message: error.message
            });
        }
    }

    async getPollResult(req: Request, res: Response) {
        try {
            const PollId = Number(req.query.PollId);
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).send({
                    status: false,
                    message: "Unauthorized"
                });
            }

            if (!PollId) {
                return res.status(400).send({
                    status: false,
                    message: "PollId is required"
                });
            }

            const result = await pollService.getPollResult(
                PollId,
                userId
            );

            return res.status(200).send({
                status: true,
                data: result
            });
        } catch (error: any) {
            return res.status(403).send({
                status: false,
                message: error.message
            });
        }
    }

}

export const pollController = new PollController();
