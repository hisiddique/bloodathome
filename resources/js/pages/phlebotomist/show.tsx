import { router, Head } from "@inertiajs/react";
import { MapPin, Star, Clock, Award, Calendar, ArrowRight } from "lucide-react";
import { BookingHeader } from "@/components/booking/header";
import { ConfirmButton } from "@/components/booking/confirm-button";
import { ChatButton } from "@/components/booking/chat-button";
import { type Phlebotomist } from "@/components/phlebotomist/card";

interface PhlebotomistProfileData extends Phlebotomist {
  bio: string;
  reviews: number;
  specialties: string[];
}

interface PhlebotomistProfileProps {
  phlebotomist?: PhlebotomistProfileData;
  id: string;
}

const mockPhlebotomists: Record<string, PhlebotomistProfileData> = {
  "1": {
    id: "1",
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    rating: 4.9,
    distance: "0.8 mi",
    price: 45,
    available: true,
    experience: "8 years",
    bio: "I'm a certified phlebotomist with 8 years of experience in mobile blood collection. I specialize in pediatric and geriatric care, ensuring a comfortable experience for all patients.",
    reviews: 156,
    specialties: ["Pediatric", "Geriatric", "Difficult veins"],
  },
  "2": {
    id: "2",
    name: "Michael Chen",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 4.8,
    distance: "1.2 mi",
    price: 40,
    available: true,
    experience: "5 years",
    bio: "With 5 years in phlebotomy, I pride myself on quick and painless blood draws. My patients always leave satisfied with my professional and friendly approach.",
    reviews: 98,
    specialties: ["Quick draws", "Anxiety management", "Corporate wellness"],
  },
  "3": {
    id: "3",
    name: "Emily Williams",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    rating: 4.7,
    distance: "1.5 mi",
    price: 42,
    available: false,
    experience: "6 years",
    bio: "I bring compassion and expertise to every blood draw. Having worked in hospitals and private practices, I understand the importance of patient comfort.",
    reviews: 87,
    specialties: ["Hospital experience", "Home visits", "Lab coordination"],
  },
  "4": {
    id: "4",
    name: "David Brown",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    rating: 4.9,
    distance: "2.0 mi",
    price: 50,
    available: true,
    experience: "10 years",
    bio: "With a decade of experience, I've performed over 10,000 blood draws. I specialize in complex draws and work with major testing laboratories.",
    reviews: 203,
    specialties: ["Complex draws", "Multiple vials", "Research studies"],
  },
};

export default function PhlebotomistProfile({ phlebotomist, id }: PhlebotomistProfileProps) {
  const displayPhlebotomist = phlebotomist || mockPhlebotomists[id] || mockPhlebotomists["1"];

  if (!displayPhlebotomist) {
    return (
      <>
        <Head title="Phlebotomist Not Found" />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Phlebotomist not found</p>
        </div>
      </>
    );
  }

  const handleBookNow = () => {
    router.visit(`/booking?phlebotomist_id=${displayPhlebotomist.id}`);
  };

  return (
    <>
      <Head title={`${displayPhlebotomist.name} - Profile`} />

      <div className="min-h-screen bg-background pb-32">
        <div className="px-4">
          <BookingHeader title="Profile" onBack={() => window.history.back()} />
        </div>

        {/* Profile Header */}
        <div className="px-4 mb-6">
          <div className="bg-card rounded-3xl p-6 border border-border">
            <div className="flex gap-4 mb-4">
              <img
                src={displayPhlebotomist.image}
                alt={displayPhlebotomist.name}
                className="w-24 h-24 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground mb-1">
                  {displayPhlebotomist.name}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">
                    {displayPhlebotomist.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({displayPhlebotomist.reviews} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{displayPhlebotomist.distance} away</span>
                </div>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                displayPhlebotomist.available
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  displayPhlebotomist.available ? "bg-green-500" : "bg-muted-foreground"
                }`}
              />
              {displayPhlebotomist.available ? "Available Now" : "Currently Unavailable"}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-accent/50 rounded-2xl p-4 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                {displayPhlebotomist.experience}
              </p>
              <p className="text-xs text-muted-foreground">Experience</p>
            </div>
            <div className="bg-accent/50 rounded-2xl p-4 text-center">
              <Award className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                {displayPhlebotomist.reviews}+
              </p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
            <div className="bg-accent/50 rounded-2xl p-4 text-center">
              <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">
                £{displayPhlebotomist.price}
              </p>
              <p className="text-xs text-muted-foreground">Per visit</p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="px-4 mb-6">
          <h2 className="font-semibold text-foreground mb-3">About</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {displayPhlebotomist.bio}
          </p>
        </div>

        {/* Specialties */}
        <div className="px-4 mb-6">
          <h2 className="font-semibold text-foreground mb-3">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {displayPhlebotomist.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1.5 bg-card border border-border rounded-full text-sm text-foreground"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Book Now Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <ConfirmButton onClick={handleBookNow} disabled={!displayPhlebotomist.available}>
            <span className="flex items-center justify-center gap-2">
              Book Appointment
              <ArrowRight className="w-5 h-5" />
            </span>
          </ConfirmButton>
        </div>

        <ChatButton />
      </div>
    </>
  );
}
