import { Request, Response, NextFunction } from "express";

export const mintBatch = async (req: Request, res: Response):Promise<any>  => {
    try {
        
    } catch (error) {
        console.log("el error: ",error);
        res.status(500).send({ status: "error:", error: error.message });
    }
}