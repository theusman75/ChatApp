import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { errorResponse } from "../utils/responses";
import { ERROR_CODES } from "../utils/errorCodes";


const validateSchema =
    <T>(schema: ObjectSchema<T>, location: "body" | "params" | "query" = "body") =>
        (req: Request, res: Response, next: NextFunction): void => {
            const { error, value } = schema.validate(req[location], { abortEarly: false });

            if (error) {
                errorResponse(
                    res,
                    ERROR_CODES.BAD_REQUEST.code,
                    error.details.map((detail) => ({
                        message: detail.message,
                        // path: detail.path,
                    }))
                )
                return
            }

            req.body = value;
            next();
        };

export default validateSchema