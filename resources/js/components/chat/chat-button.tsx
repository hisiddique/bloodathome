import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatButtonProps {
    onClick: () => void;
    unreadCount?: number;
    label?: string;
    className?: string;
}

export function ChatButton({
    onClick,
    unreadCount = 0,
    label = 'Chat',
    className,
}: ChatButtonProps) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                'fixed bottom-6 right-6 gap-2 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl',
                className,
            )}
        >
            <div className="relative">
                <MessageCircle className="size-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </div>
            <span className="font-medium">{label}</span>
        </Button>
    );
}
