import { Link, usePage } from "@inertiajs/react";
import { Stethoscope, HelpCircle, CalendarCheck, Search, Home } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn, isSameUrl } from "@/lib/utils";
import type { SharedData } from "@/types";

interface PublicSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicSidebar({ open, onOpenChange }: PublicSidebarProps) {
  const page = usePage<SharedData>();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Find a Phlebotomist' },
    { href: '/become-phlebotomist', icon: Stethoscope, label: 'Become a Mobile Phlebotomist' },
    { href: '/bookings', icon: CalendarCheck, label: 'My Bookings & Chat' },
    { href: '/faq', icon: HelpCircle, label: 'FAQ' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-background border-r border-border">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-3">
          {/* Primary Actions */}
          <Link
            href="/register"
            onClick={() => onOpenChange(false)}
            className="block w-full py-3.5 bg-foreground text-background rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
          >
            Sign up
          </Link>

          <Link
            href="/login"
            onClick={() => onOpenChange(false)}
            className="block w-full py-3.5 bg-card border border-border text-foreground rounded-lg font-semibold text-center hover:bg-muted transition-colors"
          >
            Log in
          </Link>
        </div>

        <div className="border-t border-border">
          <nav className="py-2">
            {navItems.map((item) => {
              const isActive = isSameUrl(page.url, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    isActive
                      ? "bg-muted text-foreground font-semibold"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HB</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">There's more to love</p>
              <p className="text-xs text-muted-foreground">in the app.</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default PublicSidebar;
