import { useState } from "react";
import {
  Search,
  AlertTriangle,
  Home,
  Building2,
  HeartPulse,
  ChevronLeft,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationSearch } from "@/components/ui/location-search";

type CollectionType = "nhs" | "private" | "home-visit" | "clinic-visit" | null;
type VisitType = "home" | "clinic";
type Step = "collection" | "under16" | "location" | "details";

interface BloodTest {
  id: string;
  name: string;
  description: string;
  price: number;
  clinicPrice: number;
  category: string;
}

const bloodTests: BloodTest[] = [
  {
    id: "advanced-wellness",
    name: "Advanced Wellness Panel",
    description:
      "Comprehensive health screening including FBC, liver, kidney function and more.",
    price: 120.0,
    clinicPrice: 95.0,
    category: "Organ Function",
  },
  {
    id: "thyroid-function",
    name: "Thyroid Function Test",
    description: "Checks thyroid hormones TSH, T3, and T4 levels.",
    price: 130.5,
    clinicPrice: 105.0,
    category: "Hormones",
  },
  {
    id: "diabetes-check",
    name: "Diabetes Check",
    description: "Glucose and HbA1c testing for diabetes screening.",
    price: 85.0,
    clinicPrice: 65.0,
    category: "Organ Function",
  },
  {
    id: "comprehensive-test",
    name: "Comprehensive Test",
    description: "Full blood count, organ function, vitamins and cholesterol.",
    price: 120.0,
    clinicPrice: 95.0,
    category: "Organ Function",
  },
  {
    id: "autoimmune-screen",
    name: "Autoimmune Screen",
    description: "Tests for common autoimmune markers and inflammation.",
    price: 88.5,
    clinicPrice: 68.5,
    category: "Autoimmune",
  },
  {
    id: "iron-study",
    name: "Comprehensive Iron Study",
    description:
      "Checks iron levels, ferritin, TIBC and transferrin saturation.",
    price: 85.5,
    clinicPrice: 65.5,
    category: "Vitamins",
  },
  {
    id: "lipid-profile",
    name: "Lipid Profile",
    description: "Cholesterol, HDL, LDL and triglycerides assessment.",
    price: 75.0,
    clinicPrice: 55.0,
    category: "Organ Function",
  },
  {
    id: "vitamin-panel",
    name: "Vitamin Panel",
    description: "Vitamin D, B12, folate and other essential vitamins.",
    price: 95.0,
    clinicPrice: 75.0,
    category: "Vitamins",
  },
];

const categories = [
  "All",
  "Cancer",
  "Hormones",
  "Vitamins",
  "Organ Function",
  "Autoimmune",
];

const collectionOptions = [
  {
    id: "nhs" as CollectionType,
    title: "NHS Blood Test",
    description: "NHS Test Request Form",
    icon: HeartPulse,
  },
  {
    id: "private" as CollectionType,
    title: "Private Blood Test",
    description: "Private clinic or Hospital blood Test Request",
    icon: Building2,
  },
  {
    id: "home-visit" as CollectionType,
    title: "Home Visit Blood Test",
    description: "Mobile phlebotomist comes to your location",
    icon: Home,
  },
  {
    id: "clinic-visit" as CollectionType,
    title: "Clinic Visit Blood Test",
    description: "Visit a clinic or lab for blood collection",
    icon: Building2,
  },
];

interface PhlebotomistFinderProps {
  onSearch: (data: {
    collectionType: string;
    postCode: string;
    isUnder16: boolean;
    confirmed: boolean;
    selectedTest?: BloodTest;
    visitType?: VisitType;
    coordinates?: [number, number];
  }) => void;
}

export function PhlebotomistFinder({ onSearch }: PhlebotomistFinderProps) {
  const [step, setStep] = useState<Step>("collection");
  const [collectionType, setCollectionType] = useState<CollectionType>(null);
  const [postCode, setPostCode] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | undefined>();
  const [selectedTest, setSelectedTest] = useState<BloodTest | null>(null);
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType>("home");
  const [confirmed, setConfirmed] = useState(false);
  const [isUnder16, setIsUnder16] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSearch = () => {
    if (
      (collectionType === "home-visit" || collectionType === "clinic-visit") &&
      selectedTest &&
      confirmed &&
      isUnder16 !== null
    ) {
      onSearch({
        collectionType: selectedTest.id,
        postCode,
        isUnder16,
        confirmed,
        selectedTest,
        visitType:
          collectionType === "clinic-visit" ? "clinic" : selectedVisitType,
        coordinates,
      });
    } else if (
      collectionType &&
      collectionType !== "home-visit" &&
      collectionType !== "clinic-visit" &&
      isUnder16 !== null
    ) {
      onSearch({
        collectionType,
        postCode,
        isUnder16,
        confirmed: true,
        coordinates,
      });
    }
  };

  const handleSelectCollectionType = (type: CollectionType) => {
    setCollectionType(type);
    setStep("under16");
  };

  const handleLocationSelect = (
    postcodeValue: string,
    coords?: [number, number]
  ) => {
    setPostCode(postcodeValue);
    setCoordinates(coords);
    setStep("details");
  };

  const handleSelectTest = (test: BloodTest) => {
    setSelectedTest(test);
    setConfirmed(false);
  };

  const handleBack = () => {
    if (step === "details") {
      setStep("location");
    } else if (step === "location") {
      setStep("under16");
    } else if (step === "under16") {
      setStep("collection");
      setCollectionType(null);
      setIsUnder16(null);
    }
    setSelectedTest(null);
    setConfirmed(false);
  };

  const handleBackToCollection = () => {
    setStep("under16");
    setPostCode("");
    setCoordinates(undefined);
    setSelectedTest(null);
    setConfirmed(false);
  };

  const getCollectionTypeLabel = () => {
    const option = collectionOptions.find((o) => o.id === collectionType);
    return option?.title || "";
  };

  const filteredTests = bloodTests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isFormValid =
    collectionType === "home-visit" || collectionType === "clinic-visit"
      ? selectedTest && confirmed && isUnder16 !== null
      : collectionType && isUnder16 !== null;

  // Step 1: Collection Type Selection
  if (step === "collection") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Select Collection Type
          </label>
          <div className="grid gap-3">
            {collectionOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectCollectionType(option.id)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Under 16 Question
  if (step === "under16") {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to collection type
        </button>

        {/* Selected Collection Type */}
        <div className="p-4 rounded-xl border border-primary bg-primary/5">
          <div className="flex items-center gap-3">
            {collectionType === "nhs" ? (
              <HeartPulse className="w-6 h-6 text-primary" />
            ) : collectionType === "private" ? (
              <Building2 className="w-6 h-6 text-primary" />
            ) : (
              <Home className="w-6 h-6 text-primary" />
            )}
            <div>
              <h3 className="font-semibold text-foreground">
                {getCollectionTypeLabel()}
              </h3>
            </div>
          </div>
        </div>

        {/* Under 16 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Under 16?{" "}
            <span className="text-muted-foreground text-xs">info</span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsUnder16(true)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                isUnder16 === true
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:bg-accent"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setIsUnder16(false)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                isUnder16 === false
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:bg-accent"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => setStep("location")}
          disabled={isUnder16 === null}
        >
          Continue to Location
        </Button>
      </div>
    );
  }

  // Step 3: Location Search
  if (step === "location") {
    return (
      <LocationSearch
        onLocationSelect={handleLocationSelect}
        onBack={handleBackToCollection}
        collectionTypeLabel={getCollectionTypeLabel()}
      />
    );
  }

  // Step 4: For NHS/Private - show search button
  if (
    collectionType !== "home-visit" &&
    collectionType !== "clinic-visit"
  ) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to location
        </button>

        {/* Location Info */}
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Location:</span>
            <span>{postCode}</span>
          </div>
        </div>

        {/* Selected Collection Type */}
        <div className="p-4 rounded-xl border border-primary bg-primary/5">
          <div className="flex items-center gap-3">
            {collectionType === "nhs" ? (
              <HeartPulse className="w-6 h-6 text-primary" />
            ) : (
              <Building2 className="w-6 h-6 text-primary" />
            )}
            <div>
              <h3 className="font-semibold text-foreground">
                {collectionType === "nhs"
                  ? "NHS Collection"
                  : "Private Collection"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {collectionType === "nhs"
                  ? "We'll help you find nearby NHS blood collection points"
                  : "We'll connect you with private phlebotomy services"}
              </p>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch}>
          <span className="flex items-center justify-center gap-2">
            <Search className="w-5 h-5" />
            Find {collectionType === "nhs" ? "NHS Services" : "Private Services"}
          </span>
        </Button>
      </div>
    );
  }

  // Step 4: For Home Visit or Clinic Visit - show blood test selection
  const isClinicVisit = collectionType === "clinic-visit";
  const displayVisitType = isClinicVisit ? "clinic" : selectedVisitType;
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to location
      </button>

      {/* Location Info */}
      <div className="p-3 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Location:</span>
          <span>{postCode}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for tests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 rounded-full border-border bg-card"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Visit Type Toggle - Only show for Home Visit */}
      {!isClinicVisit && (
        <div className="flex gap-2 p-1 bg-muted rounded-full w-fit">
          <button
            onClick={() => setSelectedVisitType("home")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedVisitType === "home"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Home Visit
          </button>
          <button
            onClick={() => setSelectedVisitType("clinic")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedVisitType === "clinic"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Clinic / Lab Visit
          </button>
        </div>
      )}

      {/* Blood Test Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className={`p-4 rounded-xl border transition-all ${
              selectedTest?.id === test.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-gradient-to-br from-accent/30 to-accent/10 hover:border-primary/50"
            }`}
          >
            <span className="inline-block px-3 py-1 text-xs font-medium text-primary border border-primary/30 rounded-full mb-3">
              {displayVisitType === "home" ? "Home Visit" : "Clinic / Lab Visit"}
            </span>
            <h3 className="font-semibold text-foreground mb-1">{test.name}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {test.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">
                {(displayVisitType === "home"
                  ? test.price
                  : test.clinicPrice
                ).toFixed(2)}{" "}
                GBP
              </span>
              <button
                onClick={() => handleSelectTest(test)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTest?.id === test.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {selectedTest?.id === test.id ? "Selected" : "Book now"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Test Notice */}
      {selectedTest && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-primary">
            Selected: {selectedTest.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {selectedTest.description}
          </p>
          <div className="font-semibold text-foreground">
            Total:{" "}
            {(displayVisitType === "home"
              ? selectedTest.price
              : selectedTest.clinicPrice
            ).toFixed(2)}{" "}
            GBP
          </div>
          <div className="flex items-start gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Please ensure you follow any fasting requirements before your
              appointment.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Checkbox */}
      {selectedTest && (
        <div className="flex items-start gap-3">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
            className="mt-0.5 border-primary data-[state=checked]:bg-primary"
          />
          <label
            htmlFor="confirm"
            className="text-sm text-foreground cursor-pointer"
          >
            I confirm that I have read & understood the notices listed above
          </label>
        </div>
      )}

      {/* Search Button */}
      <Button onClick={handleSearch} disabled={!isFormValid}>
        <span className="flex items-center justify-center gap-2">
          <Search className="w-5 h-5" />
          Search for Phlebotomists
        </span>
      </Button>
    </div>
  );
}

export default PhlebotomistFinder;
