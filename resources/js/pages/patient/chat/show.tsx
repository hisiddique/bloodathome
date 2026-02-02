import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageThread, MessageInput, type Message } from '@/components/chat';
import PatientLayout from '@/layouts/patient-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const CHAT_POLLING_INTERVAL = 5000; // 5 seconds

interface ChatMessage {
    id: string;
    content: string;
    is_from_patient: boolean;
    created_at: string;
    read_at: string | null;
}

interface ChatShowProps {
    conversation: {
        id: string;
        phlebotomist_id: string;
        phlebotomist_name: string;
        phlebotomist_image: string | null;
        booking_id: string;
    };
    messages?: ChatMessage[];
}

export default function ChatShow({ conversation, messages = [] }: ChatShowProps) {
    const [isPolling, setIsPolling] = useState(true);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Messages',
            href: '/patient/chat',
        },
        {
            title: conversation.phlebotomist_name,
            href: `/patient/chat/${conversation.id}`,
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
        content: message.content,
        is_from_current_user: message.is_from_patient,
        created_at: message.created_at,
        read_at: message.read_at,
    }));

    return (
        <PatientLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat with ${conversation.phlebotomist_name}`} />

            <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col p-6">
                <Card className="mb-4">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-12">
                                <AvatarImage
                                    src={
                                        conversation.phlebotomist_image ||
                                        '/placeholder.svg'
                                    }
                                    alt={conversation.phlebotomist_name}
                                />
                                <AvatarFallback>
                                    {conversation.phlebotomist_name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
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
                        action={`/patient/chat/${conversation.id}/messages`}
                    />
                </Card>
            </div>
        </PatientLayout>
    );
}
