import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/responses';
import { ERROR_CODES } from '../../utils/errorCodes';
import { prisma } from '../../lib/prisma';

const getAllConversations = async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const { userId } = req.decodedToken;

        const pageNumber = Number(page);
        const pageSizeNumber = Number(pageSize);
        const skip = (pageNumber - 1) * pageSizeNumber;
        const take = pageSizeNumber;

        const where = {
            OR: [
                { userAId: String(userId) },
                { userBId: String(userId) },
            ],
        };

        const totalConversations = await prisma.conversation.count({ where });

        const conversations = await prisma.conversation.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            include: {
                userA: {
                    select: { id: true, name: true, email: true },
                },
                userB: {
                    select: { id: true, name: true, email: true },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        message: true,
                        senderId: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!conversations) {
            errorResponse(
                res,
                ERROR_CODES.BAD_REQUEST.code,
                'Conversations not found'
            );
            return
        }

        const result = conversations.map((c) => ({
            id: c.id,
            otherUser: c.userAId === String(userId) ? c.userB : c.userA,
            lastMessage: c.messages[0] ?? null,
            createdAt: c.createdAt,
        }));

        successResponse(
            res,
            {
                conversations: result,
                totalConversations,
                totalPages: Math.ceil(totalConversations / pageSizeNumber),
                currentPage: pageNumber,
                pageSize: pageSizeNumber,
            },
            'Conversations fetched successfully.'
        );
    } catch (error) {
        errorResponse(
            res,
            ERROR_CODES.BAD_REQUEST.code,
            error
        );
    }
};

export default getAllConversations;