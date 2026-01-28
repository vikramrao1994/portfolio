import { Badge, Body, Button, Card, Heading } from "@publicplan/kern-react-kit";
import { useLocale, useTranslations } from "next-intl";
import Avatar from "@/components/Avatar";
import Counter from "@/components/Counter";
import Image from "@/components/Image";
import { useSiteContent } from "@/context/SiteContentContext";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";

const Intro = () => {
  const { isMobile } = useBreakpointFlags();
  const language = useLocale() as "en" | "de";
  const SITE = useSiteContent();
  const t = useTranslations();
  return (
    <Card.Root id="introduction" size="small" aria-label="Introduction" style={cardRootStyle}>
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
          <Avatar
            size={180}
            borderStyle={{
              border: "6px solid #e0e0e0",
              boxShadow: "0 0 0 8px #f5f5f5, 0 4px 24px rgba(0,0,0,0.08)",
              backgroundImage: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
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
              title={`${t("titleGreeting")} ${SITE.heading.name}`}
              type={"large"}
              headerElement={"h1"}
            />
            <Image src="/smile.webp" alt="Smile Icon" width={50} height={50} />
          </div>
          <Heading
            headerElement="h2"
            title={SITE.heading.subheadline[language] ?? ""}
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
              <Badge variant="info" title={t("oppertunitiesBadge")} showIcon={true} />
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
            <Image src="/address.webp" alt="Address Icon" width={24} height={24} />
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
                <Counter target={Number(SITE.heading.years_of_experience)} duration={2000} />
              </span>
              <Body text={t("yearsOfExperience")} size="small" style={{ marginLeft: spacing(2) }} />
            </div>
          </div>
        </Card.Header>
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
            href={`/api/cv?lang=${language}`}
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
              text={t("viewCv")}
              variant="secondary"
            />
          </a>
        </Card.Footer>
      </Card.Container>
    </Card.Root>
  );
};
export default Intro;
