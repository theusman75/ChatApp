import { RootState } from '@/redux/types';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { endpoints, networkCallHandler } from '../services/networkService';


interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

interface AllUsersScreenProps {
    currentUserId: string;
    onSelectUser: (user: User) => void;
}

const PAGE_SIZE = 20;

const UserItem = ({ user }: { user: User }) => {
    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => router.replace({
                pathname: '/chat',
                params: { user: JSON.stringify(user) }
            })}
            activeOpacity={0.7}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.name} numberOfLines={1}>
                    {user.name}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                    {user.email}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const Separator = () => <View style={styles.separator} />;

const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No users found</Text>
    </View>
);

const AllUsersScreen: React.FC<AllUsersScreenProps> = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { userData } = useSelector((state: RootState) => state.persistSlice)

    const fetchUsers = useCallback(async (pageNumber = 1, replace = false) => {
        const { success, data } = await networkCallHandler({
            url: endpoints.getAllUsers,
            params: { page: pageNumber, pageSize: PAGE_SIZE },
        });

        if (success) {
            const { users, totalPages } = data.data as { users: User[]; totalPages: number };
            const filtered = users.filter((u: User) => u.id !== userData?.id);
            setUsers((prev) => replace ? filtered : [...prev, ...filtered]);
            setTotalPages(totalPages);
            setPage(pageNumber);
        }
    }, [userData?.id]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await fetchUsers(1, true);
            setLoading(false);
        })();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchUsers(1, true);
        setRefreshing(false);
    }, [fetchUsers]);

    const onEndReached = useCallback(async () => {
        if (loadingMore || page >= totalPages) return;
        setLoadingMore(true);
        await fetchUsers(page + 1);
        setLoadingMore(false);
    }, [loadingMore, page, totalPages, fetchUsers]);

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
                <Feather name="arrow-left" size={24} color="black" onPress={() => router.back()} />
                <Text style={styles.title}>Users</Text>
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <UserItem user={item} />}
                ItemSeparatorComponent={Separator}
                ListEmptyComponent={<EmptyState />}
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
        </SafeAreaView>
    );
};

export default AllUsersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
        paddingHorizontal: 16
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    userInfo: {
        flex: 1,
        gap: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    email: {
        fontSize: 13,
        color: '#8e8e93',
    },
    separator: {
        height: 1,
        backgroundColor: '#f2f2f7',
        marginLeft: 74,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 16,
        color: '#8e8e93',
    },
    loadingMore: {
        paddingVertical: 16,
    },
});