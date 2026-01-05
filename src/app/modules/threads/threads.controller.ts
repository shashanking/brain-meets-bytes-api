import { Request, Response } from "express";
import { threadsService } from "./threads.services";

class ThreadController {

    createThread = async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).send({ message: "Unauthorized" });
        }

        const payload = {
            ...req.body,
            userId
        };
        return res.status(201).send(
            await threadsService.createThreads(payload)
        );
    };

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
        const userId = (req as any).user?.userId;

        if (!ThreadId || !userId) {
            return res.status(400).send({
                message: "ThreadId is required"
            });
        }
        const result = await threadsService.toggleLike(
            ThreadId,
            userId
        );
        return res.status(200).send(result);
    };

    addComment = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);
        const userId = (req as any).user?.userId;
        const { comments } = req.body;

        if (!ThreadId || !userId || !comments) {
            return res.status(400).send({
                message: "ThreadId and comment are required"
            });
        }

        const result = await threadsService.addComment(
            ThreadId,
            userId,
            comments
        );
        return res.status(201).send(result);
    };

    likeComment = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);
        const CommentId = Number(req.query.CommentId);
        const userId = (req as any).user?.userId;

        if (!ThreadId || !CommentId || !userId) {
            return res.status(400).send({
                message: "ThreadId and CommentId are required"
            });
        }

        const result = await threadsService.toggleCommentLike(
            ThreadId,
            CommentId,
            userId
        );

        return res.status(200).send(result);
    };

    getCommentswithlike = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);
        const userId = (req as any).user?.userId;

        if (!ThreadId) {
            return res.status(400).send({
                message: "ThreadId is required"
            });
        }

        const data = await threadsService.getThreadComments(
            ThreadId,
            userId
        );

        return res.status(200).send({
            status: true,
            data
        });
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
        const userId = (req as any).user?.userId;
        const { parentCommentId, comments } = req.body;

        if (!ThreadId || !parentCommentId || !userId || !comments) {
            return res.status(400).send({
                message: "Invalid request"
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

    getreplyComments = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);
        const parentCommentId = Number(req.query.parentCommentId);

        const result = await threadsService.getreplyComment(
            ThreadId,
            parentCommentId
        );

        return res.status(200).send(result);
    };

    report = async (req: Request, res: Response) => {
        const ThreadId = Number(req.body.ThreadId);
        const userId = (req as any).user?.userId;
        const { reason } = req.body;

        if (!ThreadId || !userId || !reason) {
            return res.status(400).send({
                message: "ThreadId and reason are required"
            });
        }

        const result = await threadsService.reportThread(
            ThreadId,
            userId,
            reason
        );

        return res.status(result.status ? 200 : 400).send(result);
    };

    getReports = async (req: Request, res: Response) => {
        const result = await threadsService.getReportedThreads(req.query);
        return res.status(200).send(result);
    };

    saveThread = async (req: Request, res: Response) => {
        const ThreadId = Number(req.body.ThreadId);
        const userId = (req as any).user?.userId;
        if (!ThreadId) {
            return res.status(400).send({
                message: "ThreadId is required"
            });
        }
        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }
        const result = await threadsService.toggleSaveThread(
            ThreadId,
            userId
        );
        return res.status(result.status ? 200 : 400).send(result);
    };

    getSavedUsersForThread = async (req: Request, res: Response) => {
        const ThreadId = Number(req.query.ThreadId);
        const userId = (req as any).user?.userId;
        if (!ThreadId) {
            return res.status(400).send({
                message: "ThreadId is required"
            });
        }

        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }

        const result = await threadsService.getSavedUsersForMyThread(
            ThreadId,
            userId,
            req.query
        );

        return res.status(result.status ? 200 : 403).send(result);
    };

    getMySavedThreads = async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).send({
                message: "Unauthorized"
            });
        }
        const result = await threadsService.getMySavedThreads(
            userId,
            req.query
        );

        return res.status(200).send(result);
    };

}

export const threadController = new ThreadController();
