import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import AppLogo from './app-logo';
import { cn, isSameUrl } from '@/lib/utils';
import type { PageProps } from '@/types';

interface PublicHeaderProps {
    onMenuToggle: () => void;
}

export function PublicHeader({ onMenuToggle }: PublicHeaderProps) {
    const { props, url } = usePage<PageProps>();
    const { auth } = props;
    const { t } = useTranslation();

    const isAuthenticated = !!auth?.user;

    // Determine dashboard URL based on user role
    const getDashboardUrl = () => {
        return '/dashboard';
    };

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
                        <span>{t('Become a Phlebotomist')}</span>
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
                        <>
                            <Link
                                href="/bookings"
                                className="hidden lg:inline-flex text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
                            >
                                {t('My Bookings')}
                            </Link>
                            <Button variant="ghost" className="hidden lg:inline-flex" asChild>
                                <Link href={getDashboardUrl()}>
                                    {t('Dashboard')}
                                </Link>
                            </Button>
                        </>
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
