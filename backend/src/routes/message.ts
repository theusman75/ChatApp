import { Router } from "express";
import { childRoutes } from "../utils/routes";
import { getMessages } from "../controllers/index";
import validateSchema from "../middlewares/validateSchema";
import verifyToken from "../middlewares/verifyToken";
import { getMessagesSchema } from "../validations/message";


const MessageRouter = Router();

MessageRouter.get(childRoutes.message.getMessages, verifyToken, validateSchema(getMessagesSchema, 'query'), getMessages);

export default MessageRouter;