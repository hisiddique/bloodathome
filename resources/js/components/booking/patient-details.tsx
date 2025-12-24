import { useState } from "react";
import { format } from "date-fns";
import { Calendar, X } from "lucide-react";
import { BookingHeader } from "./header";
import { ConfirmButton } from "./confirm-button";
import { ChatButton } from "./chat-button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientDetailsProps {
  date: Date;
  timeSlot: string;
  isUnder16?: boolean;
  onContinue: (details: PatientDetails) => void;
  onBack: () => void;
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4">
        <BookingHeader title="Patient Details" onBack={onBack} />
      </div>

      <div className="px-4 space-y-6">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Name of Adult with Parental Responsibility
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={details.guardianName}
                  onChange={(e) => handleChange("guardianName", e.target.value)}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Age of Patient<span className="text-destructive">*</span>
                </label>
                <Select
                  value={details.patientAge}
                  onValueChange={(value) => handleChange("patientAge", value)}
                >
                  <SelectTrigger className="w-full px-4 py-3 h-auto bg-card border border-border rounded-xl text-foreground">
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Patient Name<span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={details.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your Email<span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              value={details.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Address 1 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Address 1<span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={details.address1}
            onChange={(e) => handleChange("address1", e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Address 2 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Address 2
          </label>
          <input
            type="text"
            value={details.address2}
            onChange={(e) => handleChange("address2", e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* City and Post Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              City<span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={details.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Post Code<span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={details.postCode}
              onChange={(e) =>
                handleChange("postCode", e.target.value.toUpperCase())
              }
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Phone<span className="text-destructive">*</span>
          </label>
          <input
            type="tel"
            value={details.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

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

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <ConfirmButton onClick={handleSubmit} disabled={!isFormValid}>
          Continue to Payment
        </ConfirmButton>
      </div>

      <ChatButton />
    </div>
  );
}

export default PatientDetails;
