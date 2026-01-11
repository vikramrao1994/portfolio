"use client";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import Image from "@/components/Image";
import { SITE } from "@/lib/content";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";
import { Body, Card, Grid, Heading, Link } from "@publicplan/kern-react-kit";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";

const Education = () => {
  const { isDesktop } = useBreakpointFlags();
  const { language } = useLanguage();
  return (
    <Card.Root
      id="education"
      size="small"
      aria-label="Education"
      style={cardRootStyle}
    >
      <Card.Container>
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
            <Image
              src="/school.webp"
              alt="Education Icon"
              width={50}
              height={50}
            />
            <Heading
              title={translations.education[language]}
              type={"medium"}
              headerElement={"h2"}
            />
          </div>
        </Card.Header>
        {SITE.education.map((edu, index) => (
          <Grid
            key={index}
            style={{
              marginBottom: spacing(2),
              display: "flex",
              alignItems: "center",
              gap: spacing(3),
              justifyContent: isDesktop ? "space-between" : "flex-start",
            }}
          >
            <Image
              src={edu.logo}
              alt={edu.degree}
              height={70}
              width={60}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Body isBold text={edu.degree} />
              <Body text={edu.course[language]} size={"small"} />
              <Body text={edu.school} size={"small"} />
              <Body text={edu.location[language]} size={"small"} />
              {!isDesktop && <Body isBold text={edu.duration} size={"small"} />}
              <Link
                href={edu.certificate}
                icon={{
                  "aria-hidden": true,
                  name: "open-in-new",
                  size: "default",
                }}
                target="_blank"
                iconLeft
                title="View Degree"
                aria-label={`View ${edu.degree} Degree Certificate`}
                variant="small"
              />
            </div>
            {isDesktop && (
              <div style={{ marginLeft: "auto" }}>
                <Body isBold text={edu.duration} size={"small"} />
              </div>
            )}
          </Grid>
        ))}
      </Card.Container>
    </Card.Root>
  );
};

export default Education;
