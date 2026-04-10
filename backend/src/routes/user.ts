import { Router } from "express";
import { childRoutes } from "../utils/routes";
import { getAllUsers } from "../controllers/index";
import validateSchema from "../middlewares/validateSchema";
import { getAllUsersSchema } from "../validations/user/index";
import verifyToken from "../middlewares/verifyToken";


const UserRouter = Router();

UserRouter.get(childRoutes.user.getAllUsers, verifyToken, validateSchema(getAllUsersSchema, 'query'), getAllUsers);

export default UserRouter;