import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import { useEffect, useRef } from 'react';

export interface Message {
    id: string;
    content: string;
    is_from_current_user: boolean;
    created_at: string;
    read_at: string | null;
}

export interface MessageThreadProps {
    messages: Message[];
    emptyMessage?: string;
    className?: string;
}

function groupMessagesByDate(messages: Message[]) {
    const groups: { date: Date; messages: Message[] }[] = [];

    messages.forEach((message) => {
        const messageDate = new Date(message.created_at);
        const existingGroup = groups.find((group) =>
            isSameDay(group.date, messageDate),
        );

        if (existingGroup) {
            existingGroup.messages.push(message);
        } else {
            groups.push({
                date: messageDate,
                messages: [message],
            });
        }
    });

    return groups;
}

function formatDateHeader(date: Date): string {
    if (isToday(date)) {
        return 'Today';
    }
    if (isYesterday(date)) {
        return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
}

export function MessageThread({
    messages,
    emptyMessage = 'No messages yet. Start a conversation!',
    className,
}: MessageThreadProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <ScrollArea className={className} ref={scrollRef}>
            <div className="space-y-6 p-4">
                {groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        <div className="mb-4 flex justify-center">
                            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                                {formatDateHeader(group.date)}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {group.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        message.is_from_current_user
                                            ? 'justify-end'
                                            : 'justify-start'
                                    }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                            message.is_from_current_user
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        <p className="text-sm">
                                            {message.content}
                                        </p>
                                        <p
                                            className={`mt-1 text-xs ${
                                                message.is_from_current_user
                                                    ? 'text-primary-foreground/70'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {format(
                                                new Date(message.created_at),
                                                'h:mm a',
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
