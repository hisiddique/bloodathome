import { useState } from "react";
import { CreditCard, Lock, Calendar, User, Check } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useRegion } from "@/contexts/region-context";
import { formatCurrency } from "@/lib/format";
import { ConfirmButton } from "./confirm-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { type Phlebotomist } from "@/components/phlebotomist/card";
import { type UserPaymentMethod } from "@/types";

interface PaymentProps {
  phlebotomist: Phlebotomist;
  date: Date;
  timeSlot: string;
  onPaymentComplete: () => void;
  onBack: () => void;
  standalone?: boolean;
  userPaymentMethods?: UserPaymentMethod[];
}

export function Payment({
  phlebotomist,
  date,
  timeSlot,
  onPaymentComplete,
  onBack,
  standalone = true,
  userPaymentMethods = [],
}: PaymentProps) {
  const { t } = useTranslation();
  const { region } = useRegion();
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [useNewCard, setUseNewCard] = useState(userPaymentMethods.length === 0);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveNewCard, setSaveNewCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pre-select default payment method
  useState(() => {
    if (userPaymentMethods.length > 0 && !selectedPaymentMethodId) {
      const defaultMethod = userPaymentMethods.find(pm => pm.is_default);
      if (defaultMethod) {
        setSelectedPaymentMethodId(defaultMethod.id);
        setUseNewCard(false);
      }
    }
  });

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

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower === 'visa') return '💳';
    if (brandLower === 'mastercard') return '💳';
    if (brandLower === 'amex') return '💳';
    return '💳';
  };

  const isFormValid = useNewCard
    ? cardNumber.length >= 19 &&
      cardName.length > 2 &&
      expiry.length === 5 &&
      cvv.length >= 3
    : selectedPaymentMethodId.length > 0;

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

          {/* Saved Payment Methods */}
          {userPaymentMethods.length > 0 && !useNewCard && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">
                {t('Select Payment Method')}
              </h3>
              <div className="space-y-2">
                {userPaymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPaymentMethodId(method.id)}
                    className={cn(
                      "w-full p-4 bg-card border rounded-2xl text-left transition-all",
                      selectedPaymentMethodId === method.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground capitalize">
                            {method.card_brand} •••• {method.card_last_four}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t('Expires')} {method.card_exp_month}/{method.card_exp_year}
                          </div>
                        </div>
                      </div>
                      {selectedPaymentMethodId === method.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUseNewCard(true)}
                className="w-full rounded-2xl py-3 h-auto"
              >
                {t('Use a different card')}
              </Button>
            </div>
          )}

          {/* New Card Form */}
          {useNewCard && (
            <div className="space-y-3">
              {userPaymentMethods.length > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground">
                    {t('Enter Card Details')}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseNewCard(false)}
                    className="text-xs"
                  >
                    {t('Use saved card')}
                  </Button>
                </div>
              )}
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

              {/* Save Card Option (for logged-in users) */}
              {userPaymentMethods !== undefined && (
                <div className="flex items-start gap-3 p-4 bg-accent/30 rounded-xl border border-border">
                  <Checkbox
                    id="saveCard"
                    checked={saveNewCard}
                    onCheckedChange={(checked) => setSaveNewCard(checked === true)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="saveCard"
                    className="text-sm text-foreground leading-relaxed cursor-pointer"
                  >
                    {t('Save this card to my profile for future bookings')}
                  </label>
                </div>
              )}
            </div>
          )}

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
