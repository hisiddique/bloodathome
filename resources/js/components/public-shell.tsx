interface PublicShellProps {
    children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            {children}
        </div>
    );
}
