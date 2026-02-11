import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageThread, type Message } from '@/components/chat';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { useEffect } from 'react';

const CHAT_POLLING_INTERVAL = 5000; // 5 seconds

interface ChatMessage {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_type: 'patient' | 'provider';
    message: string;
    created_at: string;
}

interface Booking {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_avatar?: string;
}

interface ProviderChatShowProps {
    booking: Booking;
    messages: ChatMessage[];
    auth: {
        user: {
            id: string;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Messages',
        href: '/chat',
    },
    {
        title: 'Conversation',
        href: '#',
    },
];

export default function ProviderChatShow({
    booking,
    messages = [],
    auth,
}: ProviderChatShowProps) {
    const { data, setData, post, processing, reset } = useForm({
        message: '',
    });

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['messages'],
            });
        }, CHAT_POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.message.trim()) {
            return;
        }

        post(`/chat/${booking.id}`, {
            onSuccess: () => {
                reset();
            },
        });
    };

    const threadMessages: Message[] = messages.map((message) => ({
        id: message.id,
        content: message.message,
        is_from_current_user: message.sender_type === 'provider',
        created_at: message.created_at,
        read_at: null,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat - ${booking.patient_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <Card className="flex flex-1 flex-col">
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={booking.patient_avatar} />
                                <AvatarFallback>
                                    {booking.patient_name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">
                                    {booking.patient_name}
                                </CardTitle>
                                <CardDescription>
                                    Booking #{booking.id}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col p-0">
                        <MessageThread
                            messages={threadMessages}
                            emptyMessage="No messages yet. Start the conversation!"
                            className="flex-1"
                        />

                        <div className="border-t p-4">
                            <form
                                onSubmit={handleSubmit}
                                className="flex gap-2"
                            >
                                <Input
                                    value={data.message}
                                    onChange={(e) =>
                                        setData('message', e.target.value)
                                    }
                                    placeholder="Type your message..."
                                    disabled={processing}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={processing || !data.message.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
