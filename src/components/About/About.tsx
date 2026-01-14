import { cardRootStyle } from "@/styles/styles";
import { Body, Card, Grid, Heading } from "@publicplan/kern-react-kit";
import Image from "@/components/Image";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { spacing } from "@/utils/utils";
import { SITE } from "@/lib/content";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";

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
              gap: spacing(2),
              width: "100%",
            }}
          >
            <Image
              src="/aboutme.webp"
              alt="About Me Icon"
              width={50}
              height={50}
            />
            <Heading
              title={translations.aboutMe[language]}
              type={"medium"}
              headerElement={"h2"}
            />
          </div>
        </Card.Header>
        <Grid
          style={{
            marginBottom: isMobile ? spacing(2) : spacing(6),
            marginTop: spacing(2),
          }}
        >
          {SITE.about_me.map((paragraph, index) => (
            <Body key={index} text={paragraph[language]} size="small" />
          ))}
        </Grid>
      </Card.Container>
    </Card.Root>
  );
};

export default AboutMe;
