import PublicLayoutTemplate from '@/layouts/public/public-header-layout';
import { type ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
    hideFooter?: boolean;
}

export default function PublicLayout({ children, hideFooter }: PublicLayoutProps) {
    return (
        <PublicLayoutTemplate hideFooter={hideFooter}>
            {children}
        </PublicLayoutTemplate>
    );
}
