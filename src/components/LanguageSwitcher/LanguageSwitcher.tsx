import { spacing } from "@/utils/utils";
import { Body, Label } from "@publicplan/kern-react-kit";
import ExportedImage from "next-image-export-optimizer";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

const LanguageButton: React.FC<LanguageButton> = ({
  code,
  label,
  flag,
  selected,
  onSelect,
}) => {
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
        <ExportedImage
          src={flag}
          alt={label + " Flag"}
          width={20}
          height={20}
        />
      </span>
      <Label className={"kern-label"}>{label}</Label>
    </button>
  );
};
const LanguageSwitcher = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = searchParams?.get("lang") || "en";
  const [open, setOpen] = useState(false);

  const updateLangInUrl = (lang: "en" | "de") => {
    const params = new URLSearchParams(
      Array.from(searchParams?.entries() || []),
    );
    params.set("lang", lang);
    router.replace(`?${params.toString()}`);
  };

  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <div
      style={{ position: "relative", display: "flex", alignItems: "center" }}
    >
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
          role="listbox"
        >
          {LANGUAGES.map((l) => (
            <li
              key={l.code}
              role="option"
              aria-selected={l.code === language}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: spacing(1),
                cursor: "pointer",
                background: l.code === language ? "#f0f4ff" : undefined,
                fontWeight: l.code === language ? 600 : 400,
              }}
              onClick={() => {
                updateLangInUrl(l.code as "en" | "de");
                setOpen(false);
              }}
            >
              <ExportedImage
                src={l.flag}
                alt={l.label + " Flag"}
                width={20}
                height={20}
              />
              <Body className={"kern-label"} size="small" text={l.label} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;
