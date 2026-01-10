import { useState } from "react";
import { CreditCard, Lock, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useRegion } from "@/contexts/region-context";
import { formatCurrency } from "@/lib/format";
import { ConfirmButton } from "./confirm-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Phlebotomist } from "@/components/phlebotomist/card";

interface PaymentProps {
  phlebotomist: Phlebotomist;
  date: Date;
  timeSlot: string;
  onPaymentComplete: () => void;
  onBack: () => void;
  standalone?: boolean;
}

export function Payment({
  phlebotomist,
  date,
  timeSlot,
  onPaymentComplete,
  onBack,
  standalone = true,
}: PaymentProps) {
  const { t } = useTranslation();
  const { region } = useRegion();
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onPaymentComplete();
  };

  const isFormValid =
    cardNumber.length >= 19 &&
    cardName.length > 2 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  return (
    <div className="pb-32 animate-fade-in">
      <div className="space-y-6">
        {/* Order Summary */}
        <div className="bg-card border border-border rounded-3xl p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            {t('Order Summary')}
          </h2>

          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <img
              src={phlebotomist.image}
              alt={phlebotomist.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground">{phlebotomist.name}</p>
              <p className="text-sm text-muted-foreground">
                {t('Blood Draw Service')}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('Date')}</span>
              <span className="text-foreground">
                {format(date, "EEE, MMM d")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('Time')}</span>
              <span className="text-foreground">{timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('Service Fee')}</span>
              <span className="text-foreground">{formatCurrency(phlebotomist.price, region)}</span>
            </div>
          </div>

          <div className="flex justify-between mt-4 pt-4 border-t border-border">
            <span className="font-semibold text-foreground">{t('Total')}</span>
            <span className="font-bold text-lg text-foreground">
              {formatCurrency(phlebotomist.price, region)}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t('Secure Payment')}
            </span>
          </div>

          <div className="space-y-3">
            {/* Card Number */}
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                placeholder={t('Card number')}
                maxLength={19}
                className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Cardholder Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={t('Cardholder name')}
                className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder={t('MM/YY')}
                  maxLength={5}
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                  placeholder={t('CVV')}
                  maxLength={4}
                  className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('Your payment information is encrypted and secure')}
          </p>
        </div>
      </div>

      <div className={cn(
        "p-4 bg-background border-t border-border",
        standalone ? "fixed bottom-0 left-0 right-0 lg:max-w-2xl" : "mt-6"
      )}>
        <div className="flex flex-col lg:flex-row gap-3">
          <Button variant="outline" onClick={onBack} className="w-full lg:w-auto lg:min-w-[120px] py-4 h-auto rounded-2xl lg:order-first order-last">
            {t('Back')}
          </Button>
          <ConfirmButton
            onClick={handleSubmit}
            disabled={!isFormValid || isProcessing}
          >
            {isProcessing ? t('Processing...') : t('Pay {{amount}}', { amount: formatCurrency(phlebotomist.price, region) })}
          </ConfirmButton>
        </div>
      </div>
    </div>
  );
}

export default Payment;
