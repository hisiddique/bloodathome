import { Link } from "@inertiajs/react";
import { X, Stethoscope, HelpCircle, CalendarCheck, Search, Home } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetClose } from "@/components/ui/sheet";

interface PublicSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicSidebar({ open, onOpenChange }: PublicSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-background border-r border-border">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetClose asChild>
              <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </SheetClose>
          </div>
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
            <Link
              href="/"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              href="/search"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted transition-colors"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Find a Phlebotomist</span>
            </Link>

            <Link
              href="/become-phlebotomist"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted transition-colors"
            >
              <Stethoscope className="w-5 h-5" />
              <span className="font-medium">Become a Mobile Phlebotomist</span>
            </Link>

            <Link
              href="/bookings"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted transition-colors"
            >
              <CalendarCheck className="w-5 h-5" />
              <span className="font-medium">My Bookings & Chat</span>
            </Link>

            <Link
              href="/faq"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">FAQ</span>
            </Link>
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
