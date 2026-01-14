import { SITE } from "@/lib/content";
import { getDurationString, spacing } from "@/utils/utils";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import {
  Accordion,
  Body,
  Button,
  Card,
  Grid,
  Heading,
  Link,
  Lists,
} from "@publicplan/kern-react-kit";
import { Fragment, useState } from "react";
import { cardRootStyle } from "@/styles/styles";
import Image from "@/components/Image";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import TechBadge from "@/components/TechBadge";

const Work = () => {
  const { isDesktop, isMobile } = useBreakpointFlags();
  const { language } = useLanguage();

  const [allOpen, setAllOpen] = useState<null | boolean>(null);
  const toggleAll = () => setAllOpen((prev) => (prev === true ? false : true));

  return (
    <Card.Root
      id="work"
      size="small"
      style={cardRootStyle}
      aria-label="Work Experience"
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
            <Image src="/work.webp" alt="Work Icon" width={50} height={50} />
            <Heading
              title={translations.workExperience[language]}
              type={"medium"}
              headerElement={"h2"}
            />
          </div>
        </Card.Header>
        <Grid style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            text={
              allOpen === true
                ? translations.collapseAll[language]
                : translations.expandAll[language]
            }
            variant={"secondary"}
            onClick={toggleAll}
            style={{
              width: isMobile ? "100%" : language === "de" ? "25%" : "20%",
            }}
          />
        </Grid>
        {SITE.experience.map((work, index) => (
          <Fragment key={index}>
            <Grid
              key={index}
              style={{
                marginTop: spacing(2),
                marginBottom: spacing(2),
                display: "flex",
                gap: spacing(3),
                justifyContent: isDesktop ? "space-between" : "flex-start",
              }}
            >
              {isDesktop && (
                <Image
                  src={work.logo}
                  alt={work.title[language]}
                  height={70}
                  width={70}
                />
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: isDesktop ? undefined : "80%",
                }}
              >
                <Body isBold text={work.title[language]} />
                <Body text={work.company} size={"small"} />
                <Body text={work.type[language]} size={"small"} />
                <Body text={work.location[language]} size={"small"} />
                {!isDesktop && (
                  <>
                    <Body isBold text={work.duration} size={"small"} />
                    <Body
                      isBold
                      text={getDurationString(work.exact_duration, language)}
                      size={"small"}
                    />
                  </>
                )}
                {work.certificate && (
                  <Link
                    href={work.certificate}
                    icon={{
                      "aria-hidden": true,
                      name: "open-in-new",
                      size: "default",
                    }}
                    target="_blank"
                    iconLeft
                    title={translations.certificate[language]}
                    aria-label={`View Experience Certificate for ${work.title} at ${work.company}`}
                    variant="small"
                  />
                )}
              </div>
              {isDesktop && (
                <div style={{ marginLeft: "auto" }}>
                  <Body isBold text={work.duration} size={"small"} />
                  <Body
                    isBold
                    text={getDurationString(work.exact_duration, language)}
                    size={"small"}
                    style={{ textAlign: "right" }}
                  />
                </div>
              )}
              {!isDesktop && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "20%",
                  }}
                >
                  <Image
                    src={work.logo}
                    alt={work.title[language]}
                    height={70}
                    width={70}
                  />
                </div>
              )}
            </Grid>
            <Grid style={{ marginBottom: spacing(2) }}>
              <Accordion.Group>
                <Accordion.Root
                  aria-label={`Technologies Used in ${work.title} at ${work.company}`}
                  isOpened={allOpen}
                >
                  <Accordion.Summary
                    title={{
                      textWrapper: "h3",
                      title: translations.technologiesUsed[language],
                      variant: "small",
                    }}
                  />
                  <div style={{ marginBottom: spacing(2) }}>
                    {work.tech_stack_icons.map((tech, index) => (
                      <TechBadge
                        key={index}
                        tech={tech}
                        variant="info"
                        style={{
                          margin: spacing(0.5),
                        }}
                      />
                    ))}
                  </div>
                </Accordion.Root>
                <Accordion.Root
                  aria-label={`Key Responsibilities for ${work.title} at ${work.company}`}
                  isOpened={allOpen}
                >
                  <Accordion.Summary
                    title={{
                      textWrapper: "h3",
                      title: translations.keyResponsibilities[language],
                      variant: "small",
                    }}
                  />
                  <Lists.Root
                    size="small"
                    type="bullet"
                    style={{ marginBottom: spacing(2) }}
                  >
                    {work.summary.map((item, index) => (
                      <Lists.Item key={index} text={item[language]} />
                    ))}
                  </Lists.Root>
                </Accordion.Root>
              </Accordion.Group>
            </Grid>
          </Fragment>
        ))}
      </Card.Container>
    </Card.Root>
  );
};

export default Work;
