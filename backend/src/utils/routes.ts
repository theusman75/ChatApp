export const parentRoutes = {
    auth: '/auth',
    user: '/user',
    conversation: '/conversation',
    message: '/message',
};

export const childRoutes = {
    auth: {
        signup: "/signup",
        login: "/login"
    },
    user: {
        getAllUsers: "/get-all-users"
    },
    conversation: {
        getAllConversations: "/get-all-conversations"
    },
    message: {
        getMessages: "/get-messages"
    }
};
