import { Request, Response } from "express";
import { membershipService } from "./membership.services";

class MembershipController {

    createMembership = async (req: Request, res: Response) =>
        res.status(201).send(await membershipService.createMembership(req.body));

    updateMembership = async (req: Request, res: Response) =>
        res.send(await membershipService.updateMembership(req.query.MembershipId, req.body));

    deleteMembership = async (req: Request, res: Response) =>
        res.send(await membershipService.deleteMembership(req.query.MembershipId));

    getMemberships = async (req: Request, res: Response) =>
        res.send(await membershipService.getMemberships(req.query));

    FulldetailsofMemberships = async (req: Request, res: Response) =>
        res.send(await membershipService.getMemberships(req.query));

    getMembership = async (req: Request, res: Response) =>
        res.send(await membershipService.getMembershipById(String(req.query.MembershipId)));



}

export const membershipController = new MembershipController();
