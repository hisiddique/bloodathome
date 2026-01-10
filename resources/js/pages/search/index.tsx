import { router, Head } from "@inertiajs/react";
import { ChatButton } from "@/components/booking/chat-button";
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
