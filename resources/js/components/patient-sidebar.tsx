import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CreditCard,
    Folder,
    Heart,
    LayoutGrid,
    MapPin,
    MessageCircle,
    Plus,
    User,
} from 'lucide-react';
import AppLogo from './app-logo';

const patientNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/patient/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Book Now',
        href: '/booking',
        icon: Plus,
    },
    {
        title: 'My Bookings',
        href: '/patient/bookings',
        icon: Calendar,
    },
    {
        title: 'Messages',
        href: '/patient/chat',
        icon: MessageCircle,
    },
    {
        title: 'Addresses',
        href: '/patient/addresses',
        icon: MapPin,
    },
    {
        title: 'Payment Methods',
        href: '/patient/payment-methods',
        icon: CreditCard,
    },
    {
        title: 'Medical Info',
        href: '/patient/medical-info',
        icon: Heart,
    },
    {
        title: 'Profile',
        href: '/patient/profile',
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

export function PatientSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/patient/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={patientNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Patient Portal</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={page.url.startsWith(
                                resolveUrl(item.href),
                            )}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
