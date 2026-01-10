import { PublicShell } from '@/components/public-shell';
import { PublicHeader } from '@/components/public-header';
import { PublicSidebar } from '@/components/public-sidebar';
import { PublicFooter } from '@/components/public-footer';
import { BottomNav } from '@/components/bottom-nav';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

interface PublicHeaderLayoutProps extends PropsWithChildren {
    hideFooter?: boolean;
}

export default function PublicHeaderLayout({ children, hideFooter = false }: PublicHeaderLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <PublicShell>
            <PublicHeader onMenuToggle={() => setSidebarOpen(true)} />
            <PublicSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
            <main className="flex-1 pb-16 lg:pb-0">
                {children}
            </main>
            {!hideFooter && <PublicFooter />}
            <BottomNav />
        </PublicShell>
    );
}
