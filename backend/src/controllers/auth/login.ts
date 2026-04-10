import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/responses';
import { ERROR_CODES } from '../../utils/errorCodes';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            errorResponse(
                res,
                ERROR_CODES.CONFLICT.code,
                'Email/Password incorrect'
            )
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            errorResponse(
                res,
                ERROR_CODES.CONFLICT.code,
                'Email/Password incorrect'
            )
            return
        }

        const payload = { userId: user.id }
        const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET as string)

        const { password: savedPassword, ...safeUser } = user;

        successResponse(
            res,
            {
                ...safeUser,
                token
            },
            'Login successfull'
        )
    } catch (error) {
        errorResponse(
            res,
            ERROR_CODES.BAD_REQUEST.code,
            error
        )
    }
};

export default login;