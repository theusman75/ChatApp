import { Router } from "express";
import { childRoutes } from "../utils/routes";
import { login, signup } from "../controllers/index";
import validateSchema from "../middlewares/validateSchema";
import { loginSchema, signupSchema } from "../validations/auth";

const AuthRouter = Router();

AuthRouter.post(childRoutes.auth.signup, validateSchema(signupSchema), signup);
AuthRouter.post(childRoutes.auth.login, validateSchema(loginSchema), login);


export default AuthRouter;