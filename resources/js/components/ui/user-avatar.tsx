import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

/**
 * Derives initials from a full name string.
 * "Michael Adeyemi" -> "MA", "Alice" -> "A"
 */
function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

/**
 * Generates a deterministic background colour class based on the name string.
 * The same name always produces the same colour.
 */
function getAvatarColorClass(name: string): string {
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export interface UserAvatarProps {
    name: string;
    imageUrl?: string | null;
    className?: string;
    fallbackClassName?: string;
}

export function UserAvatar({
    name,
    imageUrl,
    className,
    fallbackClassName,
}: UserAvatarProps) {
    const initials = getInitials(name || 'U');
    const colorClass = getAvatarColorClass(name || 'U');

    return (
        <Avatar className={className}>
            {imageUrl ? (
                <AvatarImage src={imageUrl} alt={name} />
            ) : null}
            <AvatarFallback
                className={cn(colorClass, 'text-white font-semibold', fallbackClassName)}
            >
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
