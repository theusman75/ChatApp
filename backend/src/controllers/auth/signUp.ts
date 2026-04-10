import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/responses';
import { ERROR_CODES } from '../../utils/errorCodes';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password, } = req.body;

        const findUser = await prisma.user.findUnique({
            where: { email }
        });

        if (findUser) {
            errorResponse(
                res,
                ERROR_CODES.BAD_REQUEST.code,
                'Email already used. Email should be unique.'
            )
            return
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash
            },
        });

        const payload = { userId: user.id }
        const token = jwt.sign(payload, process.env.JWT_TOKEN_SECRET as string)

        const { password: savedPassword, ...safeUser } = user;

        successResponse(
            res,
            { ...safeUser, token },
            'Registration successfull'
        )
    } catch (error) {
        errorResponse(
            res,
            ERROR_CODES.BAD_REQUEST.code,
            error
        )
    }
};

export default signup;