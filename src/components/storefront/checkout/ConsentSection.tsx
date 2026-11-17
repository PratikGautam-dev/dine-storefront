// Consent step of checkout: DPDP, Privacy Policy (mirrors DPDP) and Marketing, each Agree / Disagree. Asked once per restaurant; a customer who already
// answered sees their choices pre-selected. The choices are saved by the cart page when the order is placed.
import { CheckoutSection } from "./CheckoutSection";

export type ConsentChoice = boolean | null;
export type ConsentState = { dpdp: ConsentChoice; marketing: ConsentChoice };

type Props = {
  restaurantName: string | null;
  value: ConsentState;
  onChange: (next: ConsentState) => void;
  alreadyOnFile: boolean;
};

function Row({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  value: ConsentChoice;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  const box = "h-4 w-4 accent-[var(--sf-primary,#b91c1c)]";
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="font-sf-body text-[14px] font-bold text-sf-on-surface">{label}</p>
        {hint && <p className="font-sf-body text-[11.5px] text-sf-text-muted">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-4 font-sf-body text-[13px] text-sf-on-surface">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            className={box}
            checked={value === true}
            disabled={disabled}
            onChange={() => onChange?.(true)}
            aria-label={`${label}: agree`}
          />
          Agree
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            className={box}
            checked={value === false}
            disabled={disabled}
            onChange={() => onChange?.(false)}
            aria-label={`${label}: disagree`}
          />
          Disagree
        </label>
      </div>
    </div>
  );
}

export function ConsentSection({ restaurantName, value, onChange, alreadyOnFile }: Props) {
  return (
    <CheckoutSection
      step={5}
      title="Consent"
      subtitle={
        alreadyOnFile
          ? "Your choices for this restaurant are on file. You can change them here."
          : `${restaurantName ?? "The restaurant"} needs your choices before your first order.`
      }
    >
      <p className="mb-2 font-sf-body text-[12.5px] leading-snug text-sf-text-muted">
        We collect your name, phone number and order details to take and deliver your order, under the Digital Personal Data Protection Act, 2023
        (DPDP). The Privacy Policy follows your DPDP choice. Marketing (offers and updates) is optional and separate.
      </p>
      <div data-testid="consent-section" className="divide-y divide-sf-border-divider/60">
        <Row label="DPDP" hint="Required to place an order" value={value.dpdp} onChange={(v) => onChange({ ...value, dpdp: v })} />
        <Row label="Privacy Policy" hint="Same as DPDP" value={value.dpdp} disabled />
        <Row label="Marketing" hint="Offers and updates, optional" value={value.marketing} onChange={(v) => onChange({ ...value, marketing: v })} />
      </div>
    </CheckoutSection>
  );
}
