import { Router } from "express";
import { parentRoutes } from "../utils/routes";
import AuthRouter from "./auth";
import UserRouter from "./user";
import ConversationRouter from "./conversation";
import MessageRouter from "./message";

const router = Router();

router.use(parentRoutes.auth, AuthRouter)
router.use(parentRoutes.user, UserRouter)
router.use(parentRoutes.conversation, ConversationRouter)
router.use(parentRoutes.message, MessageRouter)

export default router;