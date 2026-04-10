import { Router } from "express";
import { childRoutes } from "../utils/routes";
import { getAllConversations } from "../controllers/index";
import validateSchema from "../middlewares/validateSchema";
import verifyToken from "../middlewares/verifyToken";
import { getAllConversationsSchema } from "../validations/conversation";


const ConversationRouter = Router();

ConversationRouter.get(childRoutes.conversation.getAllConversations, verifyToken, validateSchema(getAllConversationsSchema, 'query'), getAllConversations);

export default ConversationRouter;