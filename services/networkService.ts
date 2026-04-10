import axios, { AxiosRequestConfig, Method } from 'axios';
import { store } from '../redux/store';

interface NetworkCallOptions {
    url: string;
    method?: Method;
    data?: any;
    params?: Record<string, any>;   // query params
    headers?: Record<string, string>;
}

interface NetworkCallResponse<T = any> {
    success: boolean;
    data?: T;
    error?: any;
}

const base_url = process.env.EXPO_PUBLIC_BASE_URL;

export const endpoints = {
    login: `${base_url}/auth/login`,
    signup: `${base_url}/auth/signup`,
    getAllConversations: `${base_url}/conversation/get-all-conversations`,
    getAllUsers: `${base_url}/user/get-all-users`,
    getMessages: `${base_url}/message/get-messages`,
};

export const networkCallHandler = async <T = any>({
    url,
    method = 'GET',
    data,
    params,
    headers: extraHeaders,
}: NetworkCallOptions): Promise<NetworkCallResponse<T>> => {
    try {
        const state = store?.getState();
        const token = state?.persistSlice?.userData?.token;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...extraHeaders,
        };

        const config: AxiosRequestConfig = {
            url,
            method,
            headers,
            ...(data && { data }),
            ...(params && { params }),
        };

        const response = await axios.request<T>(config);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.error(`[${method}] ${url} failed:`, error?.response ?? error);
        return { success: false, error: error?.response?.data?.error ?? error };
    }
};