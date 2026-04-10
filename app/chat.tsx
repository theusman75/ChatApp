import { RootState } from '@/redux/types';
import { endpoints, networkCallHandler } from '@/services/networkService';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage, InputToolbar } from "react-native-gifted-chat";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const PAGE_SIZE = 20;

const Chat = () => {
    const { user } = useLocalSearchParams();
    const parsedUser = user && !Array.isArray(user) && JSON.parse(user);

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const { userData } = useSelector((state: RootState) => state.persistSlice);
    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const formatMessage = (msg: any): IMessage => ({
        _id: msg.id,
        text: msg.message,
        createdAt: new Date(msg.createdAt),
        user: {
            _id: msg.sender.id,
            name: msg.sender.name,
        },
    });

    const fetchMessages = useCallback(async () => {
        const { success, data } = await networkCallHandler({
            url: endpoints.getMessages,
            params: {
                secondUserId: parsedUser.id,
                page: 1,
                pageSize: PAGE_SIZE,
            },
        });

        if (success) {
            // GiftedChat expects newest messages first
            const formatted = data?.data?.messages.map(formatMessage).reverse();
            setMessages(formatted);
        }
    }, [parsedUser.id]);

    useEffect(() => {
        fetchMessages();

        const socket = connectSocket(userData?.id);

        // Receive new message
        socket.on('newMessage', ({ message }: { conversationId: string; message: any }) => {
            setMessages((prev) => GiftedChat.append(prev, [formatMessage(message)]));
        });

        // Typing indicator
        socket.on('userTyping', () => setIsTyping(true));
        socket.on('userStoppedTyping', () => setIsTyping(false));

        return () => {
            socket.off('newMessage');
            socket.off('userTyping');
            socket.off('userStoppedTyping');
            disconnectSocket();
        };
    }, []);

    const onSend = () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const socket = getSocket();
        socket?.emit('sendMessage', {
            senderId: userData?.id,
            secondUserId: parsedUser.id,
            message: trimmed,
        });

        setText('');

        // Stop typing indicator on send
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        socket?.emit('stopTyping', {
            senderId: userData?.id,
            secondUserId: parsedUser.id,
        });
    };

    const onInputChange = (value: string) => {
        setText(value);

        const socket = getSocket();
        socket?.emit('typing', {
            senderId: userData?.id,
            secondUserId: parsedUser.id,
        });

        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socket?.emit('stopTyping', {
                senderId: userData?.id,
                secondUserId: parsedUser.id,
            });
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Feather name="arrow-left" size={24} color="black" onPress={() => router.back()} />
                <View>
                    <Text style={styles.title}>{parsedUser.name}</Text>
                    {isTyping && (
                        <Text style={styles.typingText}>typing...</Text>
                    )}
                </View>
            </View>

            <GiftedChat
                messages={messages}
                messagesContainerStyle={{ backgroundColor: '#F7F7FC' }}
                user={{ _id: userData?.id }}
                isTyping={isTyping}
                renderInputToolbar={(props) => (
                    <InputToolbar
                        {...props}
                        containerStyle={styles.toolbar}
                        primaryStyle={{ alignItems: 'center' }}
                    />
                )}
                renderComposer={() => (
                    <View style={[styles.inputContainer, { minHeight: 48 }]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Message"
                            placeholderTextColor="#777"
                            value={text}
                            onChangeText={onInputChange}
                            onSubmitEditing={onSend}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={onSend}>
                            <FontAwesome name="send" size={24} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                )}
                renderSend={() => null}
            />
        </SafeAreaView>
    );
};

export default Chat;

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
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    typingText: {
        fontSize: 12,
        color: '#8e8e93',
        marginTop: 2,
    },
    toolbar: {
        borderTopWidth: 0,
        padding: 6,
        backgroundColor: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 4,
        backgroundColor: '#F7F7FC',
    },
    sendButton: {
        paddingHorizontal: 8,
    },
});