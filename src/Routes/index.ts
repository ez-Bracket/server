import { Router } from "express";

import { UserController } from "../controllers/User.controller";
import { UserMiddleware } from "../middlewares/User.middleware";
import { userRoutes } from "./user.routes";

const userMiddleware = new UserMiddleware();

export const routes = Router();

routes.use("/users", userRoutes);
routes.use("/login", userMiddleware.isActive, new UserController().login);
routes.get("/profile", userMiddleware.tokenExists, new UserController().profile);
