import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar, X, MapPin } from "lucide-react";
import { BookingHeader } from "./header";
import { ConfirmButton } from "./confirm-button";
import { ChatButton } from "./chat-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type UserData, type UserAddress } from "@/types";

interface PatientDetailsProps {
  date: Date;
  timeSlot: string;
  isUnder16?: boolean;
  onContinue: (details: PatientDetails) => void;
  onBack: () => void;
  standalone?: boolean;
  userData?: UserData | null;
  userAddresses?: UserAddress[];
}

export interface PatientDetails {
  name: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  postCode: string;
  phone: string;
  notes: string;
  guardianName?: string;
  patientAge?: string;
  guardianConfirmed?: boolean;
}

export function PatientDetails({
  date,
  timeSlot,
  isUnder16,
  onContinue,
  onBack,
  standalone = true,
  userData = null,
  userAddresses = [],
}: PatientDetailsProps) {
  const [details, setDetails] = useState<PatientDetails>({
    name: "",
    email: "",
    address1: "",
    address2: "",
    city: "London",
    postCode: "",
    phone: "",
    notes: "",
    guardianName: "",
    patientAge: "",
    guardianConfirmed: false,
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  // Pre-fill user data on mount
  useEffect(() => {
    if (userData) {
      setDetails(prev => ({
        ...prev,
        name: userData.name || prev.name,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
      }));

      // Pre-select default address if available
      const defaultAddress = userAddresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        handleAddressSelection(defaultAddress.id);
      }
    }
  }, [userData, userAddresses]);

  const handleAddressSelection = (addressId: string) => {
    if (addressId === "new") {
      setSelectedAddressId("new");
      setDetails(prev => ({
        ...prev,
        address1: "",
        address2: "",
        city: "London",
        postCode: "",
      }));
      return;
    }

    const address = userAddresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setDetails(prev => ({
        ...prev,
        address1: address.address_line1,
        address2: address.address_line2 || "",
        city: address.town_city,
        postCode: address.postcode,
      }));
    }
  };

  const handleChange = (
    field: keyof PatientDetails,
    value: string | boolean
  ) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const baseValidation =
    details.name.trim() &&
    details.email.trim() &&
    details.address1.trim() &&
    details.city.trim() &&
    details.postCode.trim() &&
    details.phone.trim();

  const under16Validation = isUnder16
    ? details.guardianName?.trim() &&
      details.patientAge &&
      details.guardianConfirmed
    : true;

  const isFormValid = baseValidation && under16Validation;

  const handleSubmit = () => {
    if (isFormValid) {
      onContinue(details);
    }
  };

  const content = (
    <>
      <div className={standalone ? "px-4" : ""}>
        <BookingHeader title="Patient Details" onBack={onBack} />
      </div>

      <div className={standalone ? "px-4 space-y-6" : "space-y-6"}>
        {/* Selected Date/Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Selected Dates/Times
          </label>
          <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-sm text-foreground font-medium">
              {format(date, "dd/MM/yyyy")}
            </span>
            <span className="text-sm text-foreground">{timeSlot}</span>
            <button className="ml-auto p-1.5 bg-primary hover:bg-primary/90 rounded-lg transition-colors">
              <X className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Under 16 Guardian Fields */}
        {isUnder16 && (
          <div className="space-y-4 p-4 bg-accent/30 rounded-xl border border-border">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="guardian-name" className="text-sm font-medium text-foreground">
                  Name of Adult with Parental Responsibility
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="guardian-name"
                  value={details.guardianName}
                  onChange={(e) => handleChange("guardianName", e.target.value)}
                  aria-required="true"
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="patient-age" className="text-sm font-medium text-foreground">
                  Age of Patient<span className="text-destructive">*</span>
                </label>
                <Select
                  value={details.patientAge}
                  onValueChange={(value) => handleChange("patientAge", value)}
                >
                  <SelectTrigger id="patient-age" aria-required="true" className="w-full px-4 py-3 h-auto bg-card border border-border rounded-xl text-foreground">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 16 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {i} {i === 1 ? "year" : "years"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="guardianConfirm"
                checked={details.guardianConfirmed}
                onCheckedChange={(checked) =>
                  handleChange("guardianConfirmed", checked === true)
                }
                className="mt-0.5"
              />
              <label
                htmlFor="guardianConfirm"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                I confirm that I have parental responsibility for this child,
                and will be present at the blood draw. (We will need to check
                your ID)
              </label>
            </div>
          </div>
        )}

        {/* Name and Email */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="patient-name" className="text-sm font-medium text-foreground">
              Patient Name<span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="patient-name"
              value={details.name}
              onChange={(e) => handleChange("name", e.target.value)}
              aria-required="true"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="patient-email" className="text-sm font-medium text-foreground">
              Your Email<span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              id="patient-email"
              value={details.email}
              onChange={(e) => handleChange("email", e.target.value)}
              aria-required="true"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Saved Addresses for Logged-in Users */}
        {userAddresses.length > 0 && (
          <div className="space-y-2">
            <label htmlFor="saved-address" className="text-sm font-medium text-foreground">
              Saved Addresses
            </label>
            <Select
              value={selectedAddressId}
              onValueChange={handleAddressSelection}
            >
              <SelectTrigger id="saved-address" className="w-full px-4 py-3 h-auto bg-card border border-border rounded-xl text-foreground">
                <SelectValue placeholder="Select a saved address or enter new" />
              </SelectTrigger>
              <SelectContent>
                {userAddresses.map((address) => (
                  <SelectItem key={address.id} value={address.id}>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{address.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {address.address_line1}, {address.town_city}, {address.postcode}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="new">
                  <div className="font-medium">Enter new address</div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Address 1 */}
        <div className="space-y-2">
          <label htmlFor="patient-address" className="text-sm font-medium text-foreground">
            Address 1<span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="patient-address"
            value={details.address1}
            onChange={(e) => handleChange("address1", e.target.value)}
            aria-required="true"
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Address 2 */}
        <div className="space-y-2">
          <label htmlFor="patient-address2" className="text-sm font-medium text-foreground">
            Address 2
          </label>
          <input
            type="text"
            id="patient-address2"
            value={details.address2}
            onChange={(e) => handleChange("address2", e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* City and Post Code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="patient-city" className="text-sm font-medium text-foreground">
              City<span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="patient-city"
              value={details.city}
              onChange={(e) => handleChange("city", e.target.value)}
              aria-required="true"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="patient-postcode" className="text-sm font-medium text-foreground">
              Post Code<span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="patient-postcode"
              value={details.postCode}
              onChange={(e) =>
                handleChange("postCode", e.target.value.toUpperCase())
              }
              aria-required="true"
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="patient-phone" className="text-sm font-medium text-foreground">
            Phone<span className="text-destructive">*</span>
          </label>
          <input
            type="tel"
            id="patient-phone"
            value={details.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            aria-required="true"
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Save Address Option (for logged-in users with new address) */}
        {userData && selectedAddressId === "new" && (
          <div className="flex items-start gap-3 p-4 bg-accent/30 rounded-xl border border-border">
            <Checkbox
              id="saveAddress"
              checked={saveNewAddress}
              onCheckedChange={(checked) => setSaveNewAddress(checked === true)}
              className="mt-0.5"
            />
            <label
              htmlFor="saveAddress"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              Save this address to my profile for future bookings
            </label>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Notes</label>
          <textarea
            value={details.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Please tell us anything else we might need to know about your requirements including: details about specific collection(s), availability or accessibility restrictions, or previous problems you may have had having your blood taken."
            rows={4}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      <div className={cn(
        "p-4 bg-background border-t border-border",
        standalone ? "fixed bottom-0 left-0 right-0 lg:max-w-2xl" : "mt-6"
      )}>
        <div className="flex flex-col lg:flex-row gap-3">
          {!standalone && (
            <Button variant="outline" onClick={onBack} className="w-full lg:w-auto lg:min-w-[120px] py-4 h-auto rounded-2xl">
              Back
            </Button>
          )}
          <ConfirmButton onClick={handleSubmit} disabled={!isFormValid}>
            Continue to Payment
          </ConfirmButton>
        </div>
      </div>

      <ChatButton />
    </>
  );

  if (!standalone) {
    return content;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {content}
    </div>
  );
}

export default PatientDetails;
