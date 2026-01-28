import { Body, Label } from "@publicplan/kern-react-kit";
import { useLocale } from "next-intl";
import { useState } from "react";
import Image from "@/components/Image";
import { usePathname, useRouter } from "@/i18n/navigation";
import { spacing } from "@/utils/utils";

const LANGUAGES = [
  { code: "en", label: "EN", flag: "/usa.webp" },
  { code: "de", label: "DE", flag: "/germany.webp" },
];

interface LanguageButton {
  code: string;
  label: string;
  flag: string;
  selected: boolean;
  onSelect: (code: string) => void;
}

const LanguageButton: React.FC<LanguageButton> = ({ code, label, flag, selected, onSelect }) => {
  return (
    <button
      id="print-button"
      type="button"
      className="kern-btn kern-btn--secondary"
      onClick={() => onSelect(code)}
      aria-haspopup="listbox"
      aria-expanded={selected}
    >
      <span
        aria-hidden
        style={{
          background: "transparent",
        }}
      >
        <Image src={flag} alt={`${label} Flag`} width={20} height={20} />
      </span>
      <Label className={"kern-label"}>{label}</Label>
    </button>
  );
};
const LanguageSwitcher = () => {
  const language = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((l) => l.code === language);

  if (!current) {
    return null;
  }

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <LanguageButton
        onSelect={() => setOpen((o) => !o)}
        label={current.label}
        code={current.code}
        flag={current.flag}
        selected={false}
      />
      {open && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            padding: 0,
            width: "100%",
            background: "#fff",
            border: `2px solid #171A2B`,
            borderRadius: spacing(0.5),
            zIndex: 1000,
            marginTop: spacing(0.5),
            listStyle: "none",
          }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === language}
              tabIndex={0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing(1),
                padding: spacing(1),
                cursor: "pointer",
                background: l.code === language ? "#f0f4ff" : undefined,
                fontWeight: l.code === language ? 600 : 400,
                border: "none",
                width: "100%",
                textAlign: "left",
              }}
              onClick={() => {
                router.replace(pathname, { locale: l.code });
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.replace(pathname, { locale: l.code });
                  setOpen(false);
                }
              }}
            >
              <Image src={l.flag} alt={`${l.label} Flag`} width={20} height={20} />
              <Body className={"kern-label"} size="small" text={l.label} />
            </button>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
