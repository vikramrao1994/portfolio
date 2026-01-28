import { Body, Card, Grid, Heading } from "@publicplan/kern-react-kit";
import { useLocale, useTranslations } from "next-intl";
import Image from "@/components/Image";
import { useSiteContent } from "@/context/SiteContentContext";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import type { Language } from "@/lib/siteSchema";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";

const AboutMe = () => {
  const SITE = useSiteContent();
  const language = useLocale() as Language;
  const { isMobile } = useBreakpointFlags();
  const t = useTranslations();
  return (
    <Card.Root
      id="about"
      size="small"
      style={{ ...cardRootStyle, height: "inherit" }}
      aria-label="About Me"
    >
      <Card.Container>
        <Card.Header>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: spacing(2),
              width: "100%",
            }}
          >
            <Image src="/aboutme.webp" alt="About Me Icon" width={50} height={50} />
            <Heading title={t("aboutMe")} type={"medium"} headerElement={"h2"} />
          </div>
        </Card.Header>
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
      </Card.Container>
    </Card.Root>
  );
};

export default AboutMe;
