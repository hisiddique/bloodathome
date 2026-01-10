import { useState } from "react";
import { router, Head, useForm } from "@inertiajs/react";
import { User, Mail, Phone, MapPin, FileText, CheckCircle } from "lucide-react";
import { ConfirmButton } from "@/components/booking/confirm-button";
import { toast } from "sonner";
import PublicLayout from "@/layouts/public-layout";

export default function BecomePhlebotomist() {
  const [isComplete, setIsComplete] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    experience: "",
    certifications: "",
    bio: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.fullName || !data.email || !data.phone || !data.experience) {
      toast.error("Missing fields", {
        description: "Please fill in all required fields",
      });
      return;
    }

    // In a real app, this would post to a backend endpoint
    // post('/phlebotomist/register', {
    //   onSuccess: () => {
    //     setIsComplete(true);
    //   },
    // });

    // For now, simulate success
    setTimeout(() => {
      setIsComplete(true);
    }, 1500);
  };

  if (isComplete) {
    return (
      <>
        <Head title="Registration Complete" />

        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
            Registration Complete!
          </h1>
          <p className="text-muted-foreground text-center mb-8 max-w-xs">
            Thank you for registering. Our team will review your application and get
            back to you within 2-3 business days.
          </p>
          <ConfirmButton onClick={() => router.visit("/")}>
            Back to Home
          </ConfirmButton>
          <button
            onClick={() => router.visit("/login")}
            className="mt-4 text-primary font-medium"
          >
            Sign In
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Become a Mobile Phlebotomist" />

      <div className="min-h-screen bg-background pb-8">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
            Become a Mobile Phlebotomist
          </h1>
          <div className="bg-accent/50 rounded-2xl p-4 mb-6">
            <h2 className="font-semibold text-foreground mb-2">Join Our Network</h2>
            <p className="text-sm text-muted-foreground">
              Working as a mobile phlebotomist is a great way to earn extra money
              alongside your main role. You can accept appointments that suit your
              availability, giving you full control over when and how often you work.
              Because you'll be visiting patients on your own, we require all
              applicants to have strong clinical experience under supervision. We also
              request a current DBS check, recent training documentation, two
              references, and proof of insurance. If you're missing anything, we're
              happy to point you in the right direction to get it sorted.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Service Area *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => setData("address", e.target.value)}
                  placeholder="City or postcode"
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Years of Experience *
              </label>
              <select
                value={data.experience}
                onChange={(e) => setData("experience", e.target.value)}
                className="w-full px-4 py-4 bg-card border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
              >
                <option value="">Select experience</option>
                <option value="0-1">Less than 1 year</option>
                <option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option>
                <option value="5+">5+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Certifications
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={data.certifications}
                  onChange={(e) => setData("certifications", e.target.value)}
                  placeholder="e.g., NPA, CPT, etc."
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                About You
              </label>
              <textarea
                value={data.bio}
                onChange={(e) => setData("bio", e.target.value)}
                placeholder="Tell us about yourself and why you want to join..."
                rows={4}
                className="w-full px-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="pt-4">
              <ConfirmButton type="submit" disabled={processing}>
                {processing ? "Submitting..." : "Submit Registration"}
              </ConfirmButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

BecomePhlebotomist.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
