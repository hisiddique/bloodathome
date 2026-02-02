import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

export interface ChatMessage {
    id: string;
    content: string;
    sender_type: 'patient' | 'provider';
    sender_id: string;
    created_at: string;
    read_at: string | null;
}

export interface UseChatPollingOptions {
    bookingId: string;
    role: 'patient' | 'provider';
    pollingInterval?: number;
    enabled?: boolean;
}

export interface UseChatPollingReturn {
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useChatPolling({
    bookingId,
    role,
    pollingInterval = 5000,
    enabled = true,
}: UseChatPollingOptions): UseChatPollingReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const endpoint =
                role === 'patient'
                    ? `/patient/chat/${bookingId}/messages`
                    : `/provider/chat/${bookingId}/messages`;

            const response = await fetch(endpoint, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            setMessages(data.messages || data);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load messages',
            );
        } finally {
            setLoading(false);
        }
    }, [bookingId, role]);

    const refetch = useCallback(() => {
        router.reload({ only: ['messages'] });
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        fetchMessages();

        const interval = setInterval(() => {
            refetch();
        }, pollingInterval);

        return () => clearInterval(interval);
    }, [enabled, fetchMessages, refetch, pollingInterval]);

    return { messages, loading, error, refetch };
}
