import { Router } from "express";
import { blogRouter } from "./blogRoutes";
import { userRouter } from "./userRoutes";
import { ReadFileName } from "../utils/upload";

const routers = Router()
const allRotures = [blogRouter,userRouter]
routers.use('/api/v1',...allRotures)
routers.get('/uploads/:filename',ReadFileName)
export {routers}