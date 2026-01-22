import { Body, Card, Grid, Heading } from "@publicplan/kern-react-kit";
import Image from "@/components/Image";
import { useLanguage } from "@/context/LanguageContext";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { SITE } from "@/lib/content";
import { translations } from "@/lib/translations";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";

const AboutMe = () => {
  const { language } = useLanguage();
  const { isMobile } = useBreakpointFlags();
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
            <Heading title={translations.aboutMe[language]} type={"medium"} headerElement={"h2"} />
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
