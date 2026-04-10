import { clearPersistSlice } from '@/redux/slices/persist/persistSlice';
import { RootState } from '@/redux/types';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { endpoints, networkCallHandler } from '../services/networkService';

interface OtherUser {
    id: string;
    name: string;
    email: string;
}

interface LastMessage {
    id: string;
    message: string;
    senderId: string;
    createdAt: string;
}

interface Conversation {
    id: string;
    otherUser: OtherUser;
    lastMessage: LastMessage | null;
    createdAt: string;
    updatedAt: string;
}

interface ChatListProps {
    userId: string;
    onSelectConversation: (conversation: Conversation) => void;
}

const PAGE_SIZE = 20;

const ChatItem = ({ conversation }: { conversation: Conversation; }) => {
    const { userData } = useSelector((state: RootState) => state.persistSlice)

    const { otherUser, lastMessage } = conversation;
    const isMyMessage = lastMessage?.senderId === userData?.id;

    return (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.navigate({
                pathname: '/chat',
                params: { user: JSON.stringify(conversation.otherUser) }
            })}
            activeOpacity={0.7}
        >
            <Text style={styles.name} numberOfLines={1}>
                {otherUser.name}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
                {lastMessage
                    ? `${isMyMessage ? 'You: ' : ''}${lastMessage.message}`
                    : 'No messages yet'}
            </Text>
        </TouchableOpacity>
    );
};

const Separator = () => <View style={styles.separator} />;

const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No conversations yet</Text>
        <Text style={styles.emptySubtitle}>Start a chat to see it here.</Text>
    </View>
);

const ChatList: React.FC<ChatListProps> = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const dispatch = useDispatch();

    const fetchConversations = useCallback(async (pageNumber = 1, replace = false) => {
        const { success, data } = await networkCallHandler({
            url: endpoints.getAllConversations,
            params: { page: pageNumber, pageSize: PAGE_SIZE },
        });

        if (success) {
            const { conversations, totalPages } = data.data as { conversations: Conversation[]; totalPages: number };
            setConversations((prev) =>
                replace ? conversations : [...prev, ...conversations]
            );
            setTotalPages(totalPages);
            setPage(pageNumber);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                setLoading(true);
                await fetchConversations(1, true);
                setLoading(false);
            })();
        }, [fetchConversations])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchConversations(1, true);
        setRefreshing(false);
    }, [fetchConversations]);

    const onEndReached = useCallback(async () => {
        if (loadingMore || page >= totalPages) return;
        setLoadingMore(true);
        await fetchConversations(page + 1);
        setLoadingMore(false);
    }, [loadingMore, page, totalPages, fetchConversations]);

    const logout = () => {
        dispatch(clearPersistSlice())
        router.replace('/auth/login')
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.heading}>Chats</Text>
                <Feather name="log-out" size={24} color="black" onPress={logout} />
            </View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatItem conversation={item} />}
                ItemSeparatorComponent={Separator}
                ListEmptyComponent={EmptyState}
                ListFooterComponent={
                    loadingMore
                        ? <ActivityIndicator style={styles.loadingMore} color="#007AFF" />
                        : null
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.3}
                showsVerticalScrollIndicator={false}
            />

            <Pressable style={styles.fab} onPress={() => router.navigate('/users')}>
                <AntDesign name="plus" size={24} color="white" />
            </Pressable>
        </SafeAreaView>
    );
};

export default ChatList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 32,
        paddingHorizontal: 16
    },
    heading: {
        fontSize: 24,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatItem: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    lastMessage: {
        fontSize: 14,
        color: '#8e8e93',
    },
    separator: {
        height: 1,
        backgroundColor: '#f2f2f7',
        marginHorizontal: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8e8e93',
    },
    loadingMore: {
        paddingVertical: 16,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 52,
        right: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    }
});