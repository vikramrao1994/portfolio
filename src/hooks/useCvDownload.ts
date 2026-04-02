import { useLocale } from "next-intl";
import { useCallback, useState } from "react";
import { useSiteContent } from "@/context/SiteContentContext";

export function useCvDownload() {
  const site = useSiteContent();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const download = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cv?lang=${locale}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(site),
      });

      if (!res.ok) throw new Error("CV generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Vikram_Rao_CV_${locale.toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }, [site, locale]);

  return { download, loading };
}
