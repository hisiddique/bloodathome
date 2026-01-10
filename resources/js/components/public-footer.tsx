import { Link } from '@inertiajs/react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppLogo from './app-logo';

export function PublicFooter() {
    const { t } = useTranslation();

    return (
        <footer className="hidden lg:block border-t border-border bg-background">
            {/* Main footer content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-4 gap-8">
                    {/* Column 1: Logo */}
                    <div>
                        <AppLogo />
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                >
                                    {t('About Us')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                >
                                    {t('Contact Us')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                >
                                    {t('FAQ')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Legal */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                >
                                    {t('Privacy Policy')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms-of-service"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                                >
                                    {t('Terms of Service')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Social */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
                                aria-label="Follow us on Facebook"
                            >
                                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
                                aria-label="Follow us on Twitter"
                            >
                                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
                                aria-label="Follow us on Instagram"
                            >
                                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright row - separated */}
            <div className="border-t border-border">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-sm text-muted-foreground text-center">
                        {t('© {{year}} BloodAtHome. All rights reserved.', { year: new Date().getFullYear() })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
