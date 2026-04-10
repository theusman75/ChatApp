import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../../utils/responses';
import { ERROR_CODES } from '../../utils/errorCodes';
import { prisma } from '../../lib/prisma';


const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;

        // Convert pagination values to numbers
        const pageNumber = Number(page);
        const pageSizeNumber = Number(pageSize);
        const skip = (pageNumber - 1) * pageSizeNumber;
        const take = pageSizeNumber;

        // Fetch total count with filters
        const totalUsers = await prisma.user.count();

        // Fetch filtered + paginated users
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' },
            skip,
            take,
        });

        // Remove password field
        const safeUsers = users.map(({ password, ...rest }) => ({ ...rest }));

        // Send paginated response
        successResponse(
            res,
            {
                users: safeUsers,
                totalUsers,
                totalPages: Math.ceil(totalUsers / pageSizeNumber),
                currentPage: pageNumber,
                pageSize: pageSizeNumber
            },
            'Users fetched successfully.'
        );
    } catch (error) {
        errorResponse(
            res,
            ERROR_CODES.BAD_REQUEST.code,
            error
        );
    }
};

export default getAllUsers;