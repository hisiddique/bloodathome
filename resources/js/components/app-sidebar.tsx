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
import { type NavItem, type PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    CreditCard,
    DollarSign,
    Heart,
    LayoutGrid,
    MapPin,
    MessageCircle,
    Package,
    User,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const patientNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My Bookings',
        href: '/bookings',
        icon: Calendar,
    },
    {
        title: 'Messages',
        href: '/chat',
        icon: MessageCircle,
    },
    {
        title: 'Addresses',
        href: '/addresses',
        icon: MapPin,
    },
    {
        title: 'Payment Methods',
        href: '/payment-methods',
        icon: CreditCard,
    },
    {
        title: 'Medical Info',
        href: '/medical-info',
        icon: Heart,
    },
    {
        title: 'Dependents',
        href: '/dependents',
        icon: Users,
    },
    {
        title: 'Profile',
        href: '/profile',
        icon: User,
    },
];

const providerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Bookings',
        href: '/bookings',
        icon: Calendar,
    },
    {
        title: 'Services',
        href: '/services',
        icon: Package,
    },
    {
        title: 'Availability',
        href: '/availability',
        icon: Clock,
    },
    {
        title: 'Service Areas',
        href: '/service-areas',
        icon: MapPin,
    },
    {
        title: 'Earnings',
        href: '/earnings',
        icon: DollarSign,
    },
    {
        title: 'Messages',
        href: '/chat',
        icon: MessageCircle,
    },
    {
        title: 'Profile',
        href: '/profile',
        icon: User,
    },
];

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const isProvider = auth?.isProvider;
    const navItems = isProvider ? providerNavItems : patientNavItems;
    const sectionLabel = isProvider ? 'Provider Portal' : 'Patient Portal';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <RoleNavMain items={navItems} label={sectionLabel} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

function RoleNavMain({ items, label }: { items: NavItem[]; label: string }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
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
