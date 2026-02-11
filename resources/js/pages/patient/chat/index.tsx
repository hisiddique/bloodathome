import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ConversationList, type ConversationItem } from '@/components/chat';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';

interface Conversation {
    id: string;
    phlebotomist_id: string;
    phlebotomist_name: string;
    phlebotomist_image: string | null;
    last_message: {
        content: string;
        created_at: string;
        is_from_patient: boolean;
    };
    unread_count: number;
    booking_id: string;
}

interface ChatIndexProps {
    conversations?: Conversation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Messages',
        href: '/chat',
    },
];

export default function ChatIndex({ conversations = [] }: ChatIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter((conversation) =>
        conversation.phlebotomist_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
    );

    const conversationItems: ConversationItem[] = filteredConversations.map(
        (conversation) => ({
            id: conversation.id,
            name: conversation.phlebotomist_name,
            avatar: conversation.phlebotomist_image,
            last_message: {
                content: conversation.last_message.content,
                created_at: conversation.last_message.created_at,
                is_from_current_user: conversation.last_message.is_from_patient,
            },
            unread_count: conversation.unread_count,
            booking_id: conversation.booking_id,
        }),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Messages</h1>
                    <p className="text-muted-foreground">
                        Chat with your phlebotomists
                    </p>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {conversationItems.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MessageCircle className="mb-4 size-16 text-muted-foreground" />
                            <CardTitle className="mb-2">
                                {searchQuery
                                    ? 'No conversations found'
                                    : 'No messages yet'}
                            </CardTitle>
                            <CardDescription>
                                {searchQuery
                                    ? 'Try a different search term'
                                    : 'Your conversations with phlebotomists will appear here'}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ) : (
                    <ConversationList
                        conversations={conversationItems}
                        basePath="/chat"
                    />
                )}
            </div>
        </AppLayout>
    );
}
