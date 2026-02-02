import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Clock,
    DollarSign,
    Folder,
    LayoutGrid,
    MapPin,
    MessageCircle,
    Package,
    User,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/provider/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Bookings',
        href: '/provider/bookings',
        icon: Calendar,
    },
    {
        title: 'Services',
        href: '/provider/services',
        icon: Package,
    },
    {
        title: 'Availability',
        href: '/provider/availability',
        icon: Clock,
    },
    {
        title: 'Service Areas',
        href: '/provider/service-areas',
        icon: MapPin,
    },
    {
        title: 'Earnings',
        href: '/provider/earnings',
        icon: DollarSign,
    },
    {
        title: 'Messages',
        href: '/provider/chat',
        icon: MessageCircle,
    },
    {
        title: 'Profile',
        href: '/provider/profile',
        icon: User,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function ProviderSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/provider/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
