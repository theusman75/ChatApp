import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responses';
import { ERROR_CODES } from '../utils/errorCodes';

interface DecodedToken {
    userId: string;
    iat?: number;
    exp?: number;
}

interface AuthRequest extends Request {
    decodedToken?: DecodedToken;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        errorResponse(
            res,
            ERROR_CODES.UNAUTHORIZED.code,
            ERROR_CODES.UNAUTHORIZED.message
        )
        return
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET as string) as DecodedToken;
        req.decodedToken = decoded;
        next();
    } catch (err: any) {
        errorResponse(
            res,
            ERROR_CODES.FORBIDDEN.code,
            ERROR_CODES.FORBIDDEN.message
        )
    }
};

export default verifyToken;