import { Body, Card, Grid, Heading, Link } from "@publicplan/kern-react-kit";
import { useLocale, useTranslations } from "next-intl";
import Image from "@/components/Image";
import { useSiteContent } from "@/context/SiteContentContext";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import type { Language } from "@/lib/siteSchema";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";

const Education = () => {
  const SITE = useSiteContent();
  const { isDesktop } = useBreakpointFlags();
  const t = useTranslations();
  const language = useLocale() as Language;
  return (
    <Card.Root id="education" size="small" aria-label="Education" style={cardRootStyle}>
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
            <Image src="/school.webp" alt="Education Icon" width={50} height={50} />
            <Heading title={t("education")} type={"medium"} headerElement={"h2"} />
          </div>
        </Card.Header>
        {SITE.education.map((edu, index) => (
          <Grid
            key={`edu-${index}-${language}`}
            style={{
              marginBottom: spacing(2),
              display: "flex",
              alignItems: "center",
              gap: spacing(3),
              justifyContent: isDesktop ? "space-between" : "flex-start",
            }}
          >
            <Image src={edu.logo ?? ""} alt={edu.degree} height={70} width={60} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Body isBold text={edu.degree} />
              <Body text={edu.course[language]} size={"small"} />
              <Body text={edu.school} size={"small"} />
              <Body text={edu.location[language]} size={"small"} />
              {!isDesktop && <Body isBold text={edu.duration} size={"small"} />}
              <Link
                href={edu.certificate ?? ""}
                icon={{
                  "aria-hidden": true,
                  name: "open-in-new",
                  size: "default",
                }}
                target="_blank"
                iconLeft
                title={t("degree")}
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
