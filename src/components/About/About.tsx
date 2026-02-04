import { Body, Grid } from "@publicplan/kern-react-kit";
import { useLocale, useTranslations } from "next-intl";
import Section from "@/components/Section";
import { useSiteContent } from "@/context/SiteContentContext";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import type { Language } from "@/lib/siteSchema";
import { spacing } from "@/utils/utils";

const AboutMe = () => {
  const SITE = useSiteContent();
  const language = useLocale() as Language;
  const { isMobile } = useBreakpointFlags();
  const t = useTranslations();
  return (
    <Section
      id="about"
      ariaLabel="About Me"
      title={t("aboutMe")}
      icon={{ src: "/aboutme.webp", alt: "About Me Icon" }}
      style={{ height: "inherit" }}
    >
      <Grid
        style={{
          marginBottom: isMobile ? spacing(2) : spacing(6),
          marginTop: spacing(2),
        }}
      >
        {SITE.about_me.map((paragraph, index) => (
          <Body key={`para-${index}-${language}`} text={paragraph[language]} size="small" />
        ))}
      </Grid>
    </Section>
  );
};

export default AboutMe;
