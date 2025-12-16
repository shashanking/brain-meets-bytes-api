import { Request, Response } from "express";
import { threadsService } from "./threads.services";

class ThreadController {

    createThread = async (req: Request, res: Response) =>
        res.status(201).send(await threadsService.createThreads(req.body));

    updateThread = async (req: Request, res: Response) =>
        res.send(await threadsService.updateThreads(req.query.ThreadId, req.body));

    deleteThread = async (req: Request, res: Response) =>
        res.send(await threadsService.deleteThreads(req.query.ThreadId));

    getThreads = async (req: Request, res: Response) =>
        res.send(await threadsService.getThreads(req.query));

    FulldetailsofThreads = async (req: Request, res: Response) =>
        res.send(await threadsService.FullgetThreads(req.query));

    getThread = async (req: Request, res: Response) =>
        res.send(await threadsService.getThreadsById(String(req.query.ThreadId)));


    likeThread = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);
        const { userId } = req.body;
        if (!ThreadId || !userId) {
            return res.status(400).send({
                message: "ThreadId and userId are required"
            });
        }
        const result = await threadsService.toggleLike(ThreadId, userId);
        return res.status(200).send(result);
    };

    addComment = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);
        const { userId, comments } = req.body;
        if (!ThreadId || !userId || !comments) {
            return res.status(400).send({
                message: "ThreadId, userId and content are required"
            });
        }
        const result = await threadsService.addComment(ThreadId, userId, comments);
        return res.status(201).send(result);
    };

    getComments = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);

        if (!ThreadId) {
            return res.status(400).send({
                message: "ThreadId is required"
            });
        }

        const result = await threadsService.getComments(ThreadId);
        return res.status(200).send(result);
    };

    replyComment = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);
        const { parentCommentId, userId, comments } = req.body;
        if (!ThreadId || !parentCommentId || !userId || !comments) {
            return res.status(400).send({
                message: "ThreadId, parentCommentId, userId and content are required"
            });
        }
        const result = await threadsService.replyComment(
            ThreadId,
            parentCommentId,
            userId,
            comments
        );
        return res.status(result.status ? 201 : 400).send(result);
    };


}

export const threadController = new ThreadController();
