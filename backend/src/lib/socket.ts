import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { prisma } from './prisma';

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*', // restrict in production
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a personal room using userId so we can target them directly
        socket.on('join', (userId: string) => {
            socket.join(userId);
            console.log(`User ${userId} joined their room`);
        });

        // Handle sending a message
        socket.on('sendMessage', async ({ senderId, secondUserId, message }) => {
            try {
                // Sort IDs to find the correct conversation
                const [userAId, userBId] = [senderId, secondUserId].sort();

                // Find or create conversation
                const conversation = await prisma.conversation.upsert({
                    where: { userAId_userBId: { userAId, userBId } },
                    create: { userAId, userBId },
                    update: { updatedAt: new Date() },
                });

                // Save message to DB
                const newMessage = await prisma.message.create({
                    data: {
                        message,
                        conversationId: conversation.id,
                        senderId,
                    },
                    select: {
                        id: true,
                        message: true,
                        createdAt: true,
                        sender: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                });

                // Emit to both sender and receiver
                io.to(senderId).to(secondUserId).emit('newMessage', {
                    conversationId: conversation.id,
                    message: newMessage,
                });
            } catch (error) {
                console.error('sendMessage error:', error);
                socket.emit('error', { message: 'Failed to send message.' });
            }
        });

        // Typing indicators
        socket.on('typing', ({ senderId, secondUserId }) => {
            socket.to(secondUserId).emit('userTyping', { userId: senderId });
        });

        socket.on('stopTyping', ({ senderId, secondUserId }) => {
            socket.to(secondUserId).emit('userStoppedTyping', { userId: senderId });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};