import { Link, usePage } from '@inertiajs/react';
import { CalendarCheck, ChevronDown, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLogo from './app-logo';
import { isSameUrl, cn } from '@/lib/utils';
import type { PageProps } from '@/types';

interface PublicHeaderProps {
    onMenuToggle: () => void;
}

export function PublicHeader({ onMenuToggle }: PublicHeaderProps) {
    const { props, url } = usePage<PageProps>();
    const { auth } = props;
    const { t } = useTranslation();

    const isAuthenticated = !!auth?.user;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Left: Logo + Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onMenuToggle}
                        aria-label="Open navigation menu"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-6">
                    <Link
                        href="/"
                        prefetch
                        className={cn(
                            "text-sm font-medium transition-colors duration-200 hover:text-primary",
                            isSameUrl(url, '/')
                                ? "text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <span>{t('Home')}</span>
                    </Link>
                    <Link
                        href="/book"
                        prefetch
                        className={cn(
                            "text-sm font-medium transition-colors duration-200 hover:text-primary",
                            isSameUrl(url, '/book')
                                ? "text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <span>{t('Book Now')}</span>
                    </Link>
                    <Link
                        href="/become-phlebotomist"
                        prefetch
                        className={cn(
                            "text-sm font-medium transition-colors duration-200 hover:text-primary",
                            isSameUrl(url, '/become-phlebotomist')
                                ? "text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <span>{t('Become a Provider')}</span>
                    </Link>
                    <Link
                        href="/faq"
                        prefetch
                        className={cn(
                            "text-sm font-medium transition-colors duration-200 hover:text-primary",
                            isSameUrl(url, '/faq')
                                ? "text-foreground"
                                : "text-muted-foreground"
                        )}
                    >
                        <span>{t('FAQ')}</span>
                    </Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="hidden lg:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary focus-visible:outline-none">
                                    {auth.user?.full_name || 'User'}
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="flex items-center gap-2">
                                        <LayoutDashboard className="h-4 w-4" />
                                        {t('Dashboard')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/bookings" className="flex items-center gap-2">
                                        <CalendarCheck className="h-4 w-4" />
                                        {t('My Bookings')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" method="post" as="button" className="flex w-full items-center gap-2 text-destructive">
                                        <LogOut className="h-4 w-4" />
                                        {t('Log out')}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" className="hidden lg:inline-flex" asChild>
                                <Link href="/login">
                                    {t('Log in')}
                                </Link>
                            </Button>
                            <Button className="hidden lg:inline-flex" asChild>
                                <Link href="/register">
                                    {t('Sign up')}
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
