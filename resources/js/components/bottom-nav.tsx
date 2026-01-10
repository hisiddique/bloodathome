import { Link, usePage } from '@inertiajs/react';
import { Home, Search, CalendarCheck, User, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, isSameUrl } from '@/lib/utils';
import type { SharedData } from '@/types';

interface NavItemProps {
    icon: LucideIcon;
    label: string;
    href: string;
    isActive: boolean;
}

function NavItem({ icon: Icon, label, href, isActive }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-0 flex-1 transition-colors",
                isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
        >
            <Icon className={cn("h-5 w-5", isActive && "fill-current")} aria-hidden="true" />
            <span className="text-xs font-medium truncate">{label}</span>
        </Link>
    );
}

export function BottomNav() {
    const page = usePage<SharedData>();
    const { t } = useTranslation();

    const navItems = [
        { icon: Home, label: t('Home'), href: '/' },
        { icon: Search, label: t('Find'), href: '/search' },
        { icon: CalendarCheck, label: t('Bookings'), href: '/bookings' },
        { icon: User, label: t('Account'), href: '/login' },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        isActive={isSameUrl(page.url, item.href)}
                    />
                ))}
            </div>
        </nav>
    );
}
