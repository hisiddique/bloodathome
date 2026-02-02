import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';

export interface ConversationItem {
    id: string;
    name: string;
    avatar?: string | null;
    last_message: {
        content: string;
        created_at: string;
        is_from_current_user: boolean;
    };
    unread_count: number;
    booking_id: string;
}

export interface ConversationListProps {
    conversations: ConversationItem[];
    basePath: string;
    emptyMessage?: string;
}

export function ConversationList({
    conversations,
    basePath,
    emptyMessage = 'No conversations yet',
}: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-2">
            {conversations.map((conversation) => (
                <Link
                    key={conversation.id}
                    href={`${basePath}/${conversation.id}`}
                >
                    <Card className="cursor-pointer transition-colors hover:bg-accent">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="relative">
                                    <Avatar className="size-12">
                                        <AvatarImage
                                            src={
                                                conversation.avatar ||
                                                '/placeholder.svg'
                                            }
                                            alt={conversation.name}
                                        />
                                        <AvatarFallback>
                                            {conversation.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    {conversation.unread_count > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0 text-xs"
                                        >
                                            {conversation.unread_count}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="mb-1 flex items-start justify-between gap-2">
                                        <h3 className="font-semibold">
                                            {conversation.name}
                                        </h3>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {format(
                                                new Date(
                                                    conversation.last_message.created_at,
                                                ),
                                                'MMM d, h:mm a',
                                            )}
                                        </span>
                                    </div>
                                    <p
                                        className={`truncate text-sm ${
                                            conversation.unread_count > 0
                                                ? 'font-medium text-foreground'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {conversation.last_message
                                            .is_from_current_user && 'You: '}
                                        {conversation.last_message.content}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
