import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import { MessageThread, MessageInput, type Message } from '@/components/chat';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const CHAT_POLLING_INTERVAL = 5000; // 5 seconds

interface ChatMessage {
    id: string;
    message: string;
    sender_type: 'patient' | 'provider';
    sender_id: string;
    created_at: string;
    read_at: string | null;
}

interface ChatShowProps {
    conversation: {
        id: string;
        booking_id: string;
        provider_id: string;
        phlebotomist_name: string;
        phlebotomist_image: string | null;
    };
    messages?: ChatMessage[];
}

export default function ChatShow({ conversation, messages = [] }: ChatShowProps) {
    const [isPolling, setIsPolling] = useState(true);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Messages',
            href: '/chat',
        },
        {
            title: conversation.phlebotomist_name,
            href: `/chat/${conversation.id}`,
        },
    ];

    useEffect(() => {
        if (!isPolling) {
            return;
        }

        const interval = setInterval(() => {
            router.reload({
                only: ['messages'],
            });
        }, CHAT_POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [isPolling]);

    const threadMessages: Message[] = messages.map((message) => ({
        id: message.id,
        content: message.message,
        is_from_current_user: message.sender_type === 'patient',
        created_at: message.created_at,
        read_at: message.read_at,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat with ${conversation.phlebotomist_name}`} />

            <div className="flex h-[calc(100vh-8rem)] flex-1 flex-col gap-4 overflow-x-auto p-4">
                <Card className="mb-4">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <UserAvatar
                                name={conversation.phlebotomist_name}
                                imageUrl={conversation.phlebotomist_image}
                                className="size-12"
                            />
                            <div>
                                <CardTitle className="text-lg">
                                    {conversation.phlebotomist_name}
                                </CardTitle>
                                <CardDescription>
                                    Booking #{conversation.booking_id.slice(0, 8)}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Card className="flex flex-1 flex-col overflow-hidden">
                    <MessageThread
                        messages={threadMessages}
                        className="flex-1"
                    />
                    <MessageInput
                        action={`/chat/${conversation.booking_id}`}
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
