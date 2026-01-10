import { useState, useEffect } from "react";
import { router, Head, usePage } from "@inertiajs/react";
import { Search, SlidersHorizontal, MapPin, Building2, Map, List } from "lucide-react";
import { BookingHeader } from "@/components/booking/header";
import { PhlebotomistCard, type Phlebotomist } from "@/components/phlebotomist/card";
import { ChatButton } from "@/components/booking/chat-button";
import { LocationMap } from "@/components/booking/location-map";
import PublicLayout from "@/layouts/public-layout";

interface Lab {
  id: string;
  name: string;
  image: string;
  rating: number;
  distance: string;
  price: number;
  available: boolean;
  address: string;
  type: "lab";
}

interface SearchResultsProps {
  phlebotomists?: Phlebotomist[];
  labs?: Lab[];
  collection?: string;
  visitType?: string;
  testName?: string;
  price?: string;
  postcode?: string;
  lng?: string;
  lat?: string;
  mapboxToken?: string;
}

const mockPhlebotomists: Phlebotomist[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 4.9,
    distance: "0.8 mi",
    price: 45,
    available: true,
    experience: "8 years",
  },
  {
    id: "2",
    name: "Michael Chen",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 4.8,
    distance: "1.2 mi",
    price: 40,
    available: true,
    experience: "5 years",
  },
  {
    id: "3",
    name: "Emily Williams",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    rating: 4.7,
    distance: "1.5 mi",
    price: 42,
    available: false,
    experience: "6 years",
  },
  {
    id: "4",
    name: "David Brown",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    rating: 4.9,
    distance: "2.0 mi",
    price: 50,
    available: true,
    experience: "10 years",
  },
];

const mockLabs: Lab[] = [
  {
    id: "lab-1",
    name: "City Medical Laboratory",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150",
    rating: 4.8,
    distance: "0.5 mi",
    price: 35,
    available: true,
    address: "123 High Street, London EC1A 1BB",
    type: "lab",
  },
  {
    id: "lab-2",
    name: "HealthFirst Diagnostics",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=150",
    rating: 4.7,
    distance: "1.0 mi",
    price: 38,
    available: true,
    address: "45 Medical Centre, London W1G 9QP",
    type: "lab",
  },
  {
    id: "lab-3",
    name: "QuickTest Clinic",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=150",
    rating: 4.6,
    distance: "1.8 mi",
    price: 32,
    available: true,
    address: "78 Wellness Road, London NW3 2PT",
    type: "lab",
  },
];

export default function SearchResults({
  phlebotomists,
  labs,
  collection = "",
  visitType = "home",
  testName = "",
  price = "",
  postcode = "",
  lng,
  lat,
  mapboxToken = "",
}: SearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number]>(
    lng && lat ? [parseFloat(lng), parseFloat(lat)] : [-0.1276, 51.5074]
  );
  const [showMap, setShowMap] = useState(true); // Mobile view toggle

  const isHomeVisit = visitType === "home";
  const isClinicVisit = visitType === "clinic";
  const isNHS = collection === "nhs";
  const isPrivate = collection === "private";

  // Use provided data or fallback to mock data
  const displayPhlebotomists = phlebotomists || mockPhlebotomists;
  const displayLabs = labs || mockLabs;

  // Filter based on visit type
  const filteredPhlebotomists = displayPhlebotomists.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.distance.includes(searchQuery)
  );

  const filteredLabs = displayLabs.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProfile = (id: string) => {
    router.visit(`/phlebotomist/${id}`);
  };

  const handleBookNow = (provider: Phlebotomist | Lab) => {
    const params = new URLSearchParams({
      provider_id: provider.id,
      provider_type: "rating" in provider ? "phlebotomist" : "lab",
      test_name: testName,
      price: price.toString(),
      visit_type: visitType,
      collection,
      postcode,
    });
    router.visit(`/booking?${params.toString()}`);
  };

  const getTitle = () => {
    if (isNHS) return "NHS Blood Collection Points";
    if (isPrivate) return "Private Clinics";
    if (isClinicVisit) return "Clinics & Labs Near You";
    return "Mobile Phlebotomists Near You";
  };

  return (
    <PublicLayout>
      <Head title={getTitle()} />

      <div className="min-h-screen bg-background">
        {/* Header - Mobile only, desktop uses PublicLayout header */}
        <div className="px-4 lg:hidden">
          <BookingHeader title={getTitle()} onBack={() => router.visit("/search")} />
        </div>

        {/* Desktop: Split View | Mobile: Stacked */}
        <div className="lg:grid lg:grid-cols-[1fr_450px] xl:grid-cols-[1fr_500px] lg:h-[calc(100vh-4rem)]">
          {/* Left Side: Map (Sticky on Desktop) */}
          <div id="map-panel" role="tabpanel" aria-labelledby="map-tab" className={`${showMap ? 'block' : 'hidden'} lg:block h-64 lg:h-full lg:sticky lg:top-16 bg-muted/30`}>
            {postcode ? (
              <LocationMap
                center={coordinates}
                zoom={13}
                mapboxToken={mapboxToken}
                markers={[{ id: "user", coordinates, label: postcode }]}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Map view</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Results List (Scrollable on Desktop) */}
          <div id="list-panel" role="tabpanel" aria-labelledby="list-tab" className={`${!showMap ? 'block' : 'hidden'} lg:block lg:overflow-y-auto lg:h-full bg-background`}>
            <div className="p-4 space-y-4">
              {/* Desktop Header */}
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-foreground mb-2">{getTitle()}</h1>
              </div>

              {/* Location Info */}
              {postcode && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Searching near: {postcode}
                  </span>
                </div>
              )}

              {/* Test Info Banner */}
              {testName && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Selected Test:</span> {testName}
                    {price && (
                      <span className="ml-2 font-semibold text-primary">£{price}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Mobile View Toggle */}
              <div role="tablist" aria-label="View options" className="flex gap-2 lg:hidden">
                <button
                  id="map-tab"
                  role="tab"
                  aria-selected={showMap}
                  aria-controls="map-panel"
                  onClick={() => setShowMap(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                    showMap
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span className="text-sm font-medium">Map</span>
                </button>
                <button
                  id="list-tab"
                  role="tab"
                  aria-selected={!showMap}
                  aria-controls="list-panel"
                  onClick={() => setShowMap(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                    !showMap
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm font-medium">List</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    aria-label="Search phlebotomists or clinics"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isHomeVisit
                        ? "Search by name or location..."
                        : "Search clinics or labs..."
                    }
                    className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button aria-label="Open filters" className="p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-colors">
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Results Count */}
              <p className="text-sm text-muted-foreground">
                {isHomeVisit || isNHS || isPrivate
                  ? `${filteredPhlebotomists.length} phlebotomists found`
                  : `${filteredLabs.length} clinics & labs found`}
              </p>

              {/* Results List - Phlebotomists */}
              {(isHomeVisit || isNHS || isPrivate) && (
                <div className="space-y-4">
                  {filteredPhlebotomists.map((phlebotomist) => (
                    <div key={phlebotomist.id} className="animate-fade-in">
                      <PhlebotomistCard
                        phlebotomist={phlebotomist}
                        isSelected={selectedId === phlebotomist.id}
                        onSelect={() => {
                          setSelectedId(phlebotomist.id);
                          handleBookNow(phlebotomist);
                        }}
                        onViewProfile={() => handleViewProfile(phlebotomist.id)}
                      />
                    </div>
                  ))}

                  {filteredPhlebotomists.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No phlebotomists found</p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-primary font-medium"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Results List - Labs/Clinics */}
              {isClinicVisit && (
                <div className="space-y-4">
                  {filteredLabs.map((lab) => (
                    <div
                      key={lab.id}
                      className="animate-fade-in p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        <img
                          src={lab.image}
                          alt={lab.name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-foreground">{lab.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{lab.distance}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-foreground">
                                £{lab.price}
                              </span>
                              <p className="text-xs text-muted-foreground">per test</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {lab.address}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm font-medium text-foreground">
                                {lab.rating}
                              </span>
                            </div>
                            <button
                              onClick={() => handleBookNow(lab)}
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredLabs.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No clinics or labs found</p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-primary font-medium"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <ChatButton />
      </div>
    </PublicLayout>
  );
}
