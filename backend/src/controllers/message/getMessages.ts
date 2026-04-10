import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/responses';
import { ERROR_CODES } from '../../utils/errorCodes';
import { prisma } from '../../lib/prisma';

const getMessages = async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 20, secondUserId } = req.query;
        const { userId } = req.decodedToken;

        const pageNumber = Number(page);
        const pageSizeNumber = Number(pageSize);
        const skip = (pageNumber - 1) * pageSizeNumber;
        const take = pageSizeNumber;

        // Sort IDs to match the deduplication logic used when creating conversations
        const [userAId, userBId] = [userId, String(secondUserId)].sort();

        // Find the conversation between these two users
        const conversation = await prisma.conversation.findUnique({
            where: { userAId_userBId: { userAId, userBId } },
        });

        if (!conversation) {
            successResponse(
                res,
                {
                    messages: [],
                    totalMessages: 0,
                    totalPages: 0,
                    currentPage: pageNumber,
                    pageSize: pageSizeNumber,
                },
                'No conversation found.'
            );
            return
        }

        const where = { conversationId: conversation.id };

        const totalMessages = await prisma.message.count({ where });

        const messages = await prisma.message.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            select: {
                id: true,
                message: true,
                createdAt: true,
                sender: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        successResponse(
            res,
            {
                messages: messages.reverse(), // chronological order
                totalMessages,
                totalPages: Math.ceil(totalMessages / pageSizeNumber),
                currentPage: pageNumber,
                pageSize: pageSizeNumber,
            },
            'Messages fetched successfully.'
        );
    } catch (error) {
        errorResponse(res, ERROR_CODES.BAD_REQUEST.code, error);
    }
};

export default getMessages;