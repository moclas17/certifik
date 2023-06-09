import express, { Express, Request, Response } from "express";
import cors from "cors";

import { router } from "./routes";
export const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/", router);
app.use("*", (req: Request, res: Response) =>
  res.status(404).json({ error: "Not Found" })
);
