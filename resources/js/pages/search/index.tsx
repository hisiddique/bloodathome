import { useState } from "react";
import { router, Head, Link } from "@inertiajs/react";
import { Menu } from "lucide-react";
import { ChatButton } from "@/components/booking/chat-button";
import { PublicSidebar } from "@/components/public-sidebar";
import { PhlebotomistFinder } from "@/components/phlebotomist/finder";

export default function FindPhlebotomist() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSearch = (data: {
    collectionType: string;
    postCode: string;
    isUnder16: boolean;
    confirmed: boolean;
    selectedTest?: {
      id: string;
      name: string;
      price: number;
      clinicPrice: number;
    };
    visitType?: "home" | "clinic";
    coordinates?: [number, number];
  }) => {
    // Navigate to search results with the selected options
    const params = new URLSearchParams({
      collection: data.collectionType,
      under16: String(data.isUnder16),
    });

    if (data.postCode) {
      params.set("postcode", data.postCode);
    }

    if (data.coordinates) {
      params.set("lng", String(data.coordinates[0]));
      params.set("lat", String(data.coordinates[1]));
    }

    if (data.selectedTest) {
      params.set("testId", data.selectedTest.id);
      params.set("testName", data.selectedTest.name);
      params.set(
        "price",
        String(
          data.visitType === "home"
            ? data.selectedTest.price
            : data.selectedTest.clinicPrice
        )
      );
    }

    if (data.visitType) {
      params.set("visitType", data.visitType);
    }

    router.visit(`/search/results?${params.toString()}`);
  };

  return (
    <>
      <Head title="Find a Mobile Phlebotomist" />

      <div className="min-h-screen bg-background">
        <PublicSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* Header with Menu */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img
              src="/assets/logo.png"
              alt="BloodAtHome"
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-primary text-center mb-2">
            Find a Mobile Phlebotomist
          </h1>
          <p className="text-muted-foreground text-center text-sm">
            Please complete this form and we will connect you with your nearest
            mobile phlebotomists.
          </p>
        </div>

        {/* Phlebotomist Finder Form */}
        <div className="px-6 pb-8">
          <PhlebotomistFinder onSearch={handleSearch} />
        </div>

        <ChatButton />
      </div>
    </>
  );
}
