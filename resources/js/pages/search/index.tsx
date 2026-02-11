import { router, Head } from "@inertiajs/react";
import { ChatButton } from "@/components/ui/chat-button";
import { PhlebotomistFinder } from "@/components/phlebotomist/finder";
import PublicLayout from "@/layouts/public-layout";

export default function FindPhlebotomist() {
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
    // Navigate to booking wizard
    router.visit('/book');
  };

  return (
    <>
      <Head title="Find a Mobile Phlebotomist" />

      <div className="min-h-screen bg-background">
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

FindPhlebotomist.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
