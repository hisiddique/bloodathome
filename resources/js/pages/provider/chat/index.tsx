import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ConversationList, type ConversationItem } from '@/components/chat';
import ProviderLayout from '@/layouts/provider-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';

interface Conversation {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_avatar?: string;
    booking_id: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
}

interface ProviderChatIndexProps {
    conversations: Conversation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/provider/dashboard',
    },
    {
        title: 'Messages',
        href: '/provider/chat',
    },
];

export default function ProviderChatIndex({
    conversations = [],
}: ProviderChatIndexProps) {
    const conversationItems: ConversationItem[] = conversations.map(
        (conversation) => ({
            id: conversation.id,
            name: conversation.patient_name,
            avatar: conversation.patient_avatar,
            last_message: {
                content: conversation.last_message,
                created_at: conversation.last_message_at,
                is_from_current_user: false,
            },
            unread_count: conversation.unread_count,
            booking_id: conversation.booking_id,
        }),
    );

    return (
        <ProviderLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Messages
                    </h2>
                    <p className="text-muted-foreground">
                        Chat with your patients
                    </p>
                </div>

                {conversations.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No conversations yet
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Conversations</CardTitle>
                            <CardDescription>
                                {conversations.length} active conversation
                                {conversations.length !== 1 ? 's' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ConversationList
                                conversations={conversationItems}
                                basePath="/provider/chat"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </ProviderLayout>
    );
}
