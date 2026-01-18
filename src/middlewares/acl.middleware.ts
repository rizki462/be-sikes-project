import { Response, NextFunction } from "express";
import { IReqUser } from "./auth.middleware";

export default (roles: string[]) => {
    return (req: IReqUser, res: Response, next: NextFunction) => {
        const role = req.user?.role;

        if(!role || !roles.includes(role)) {
            console.log("ACL reject: Role Mismatch");
            return res.status(403).json({
                message: "Forbiden",
                data: null
            });
        };

        next();
    };
};