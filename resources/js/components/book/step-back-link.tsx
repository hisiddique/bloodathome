import { ChevronLeft } from 'lucide-react';

interface StepBackLinkProps {
    label: string;
    onClick: () => void;
}

export function StepBackLink({ label, onClick }: StepBackLinkProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
            <ChevronLeft className="w-4 h-4" />
            {label}
        </button>
    );
}
