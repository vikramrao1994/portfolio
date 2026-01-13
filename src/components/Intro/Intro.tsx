import { spacing } from "@/utils/utils";
import { Badge, Body, Button, Card, Heading } from "@publicplan/kern-react-kit";
import Image from "@/components/Image";
import { SITE } from "@/lib/content";
import { cardRootStyle } from "@/styles/styles";
import Counter from "@/components/Counter";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const Intro = () => {
  const { isMobile } = useBreakpointFlags();
  const { language } = useLanguage();
  return (
    <Card.Root
      id="introduction"
      size="small"
      aria-label="Introduction"
      style={cardRootStyle}
    >
      <Card.Container>
        <div style={{ position: "relative", width: "100%" }}>
          <Image
            alt="clip"
            src="/clip.webp"
            width={30}
            height={30}
            style={{ position: "absolute", top: 0, right: 0, zIndex: 2 }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            margin: `${spacing(2)}px 0`,
          }}
        >
          <Image
            alt="Profile"
            src="/portrait.webp"
            width={180}
            height={180}
            style={{
              borderRadius: "50%",
              border: "6px solid #e0e0e0",
              boxShadow: "0 0 0 8px #f5f5f5, 0 4px 24px rgba(0,0,0,0.08)",
              objectFit: "cover",
              backgroundImage:
                "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
            }}
          />
        </div>
        <Card.Header>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing(2),
              width: "100%",
            }}
          >
            <Heading
              title={`${translations.titleGreeting[language]} ${SITE.heading.name}`}
              type={"large"}
              headerElement={"h1"}
            />
            <Image src="/smile.webp" alt="Smile Icon" width={50} height={50} />
          </div>
          <Heading
            headerElement="h2"
            title={SITE.heading.subheadline[language]}
            type="small"
            style={{ textAlign: "center", width: "100%" }}
          />
          {SITE.heading.open_to_oppertunities && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                marginTop: spacing(1),
              }}
            >
              <Badge
                variant="info"
                title={translations.oppertunitiesBadge[language]}
                showIcon={true}
                aria-hidden={true}
              />
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginTop: spacing(2),
            }}
          >
            <Image
              src="/address.webp"
              alt="Address Icon"
              width={24}
              height={24}
            />
            <Body
              isBold
              style={{
                marginLeft: spacing(1),
                padding: 0,
                textAlign: "center",
              }}
            >
              {SITE.heading.address[language]}
            </Body>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              gap: isMobile ? spacing(4) : spacing(8),
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: spacing(1),
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "3em",
                  textAlign: "right",
                }}
              >
                <Counter
                  target={Number(SITE.heading.years_of_experience)}
                  duration={2000}
                />
              </span>
              <Body
                text={translations.yearsOfExperience[language]}
                size="small"
                style={{ marginLeft: spacing(2) }}
              />
            </div>
          </div>
        </Card.Header>
        {/* <Card.Body style={{ textAlign: "center" }}>
          {SITE.executive_summary}
        </Card.Body> */}
        <Card.Footer
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: spacing(1),
            marginBottom: spacing(2),
          }}
        >
          <a
            href={`/CV_Vikram_${language.toUpperCase()}.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <Button
              aria-label="Download CV"
              icon={{ name: "download" }}
              isBlock={isMobile}
              iconLeft
              text={translations.viewCv[language]}
              variant="secondary"
            />
          </a>
        </Card.Footer>
      </Card.Container>
    </Card.Root>
  );
};
export default Intro;
