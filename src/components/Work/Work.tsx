/* eslint-disable @next/next/no-img-element */
import { SITE } from "@/lib/content";
import { getDurationString, spacing } from "@/utils/utils";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import {
  Accordion,
  Body,
  Card,
  Grid,
  Heading,
  Link,
  Lists,
} from "@publicplan/kern-react-kit";
import { Fragment } from "react";

const Work = () => {
  const { isDesktop } = useBreakpointFlags();
  return (
    <Card.Root
      size="small"
      style={{
        borderRadius: spacing(1),
        marginTop: spacing(4),
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: `rgba(255, 255, 255, 0.8)`,
        backdropFilter: `blur(${spacing(1.25)})`,
        zIndex: 1,
      }}
      aria-label="Work Experience"
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
            <img src="/work.webp" alt="Work Icon" width={50} height={50} />
            <Heading
              title={"Work Experience"}
              type={"medium"}
              headerElement={"h2"}
            />
          </div>
        </Card.Header>
        {SITE.experience.map((work, index) => (
          <Fragment key={index}>
            <Grid
              key={index}
              style={{
                marginTop: spacing(2),
                marginBottom: spacing(2),
                display: "flex",
                // alignItems: "center",
                gap: spacing(3),
                justifyContent: isDesktop ? "space-between" : "flex-start",
              }}
            >
              {isDesktop && (
                <img src={work.logo} alt={work.title} height={70} width={70} />
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: isDesktop ? undefined : "80%",
                }}
              >
                <Body isBold text={work.title} />
                <Body text={work.company} size={"small"} />
                <Body text={work.type} size={"small"} />
                <Body text={work.location} size={"small"} />
                {!isDesktop && (
                  <>
                    <Body isBold text={work.duration} size={"small"} />
                    <Body
                      isBold
                      text={getDurationString(work.exact_duration)}
                      size={"small"}
                    />
                  </>
                )}
                <Link
                  href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                  icon={{
                    "aria-hidden": true,
                    name: "open-in-new",
                    size: "default",
                  }}
                  target="_blank"
                  iconLeft
                  title="View Experience Certificate"
                  aria-label={`View Experience Certificate for ${work.title} at ${work.company}`}
                  variant="small"
                />
              </div>
              {isDesktop && (
                <div style={{ marginLeft: "auto" }}>
                  <Body isBold text={work.duration} size={"small"} />
                  <Body
                    isBold
                    text={getDurationString(work.exact_duration)}
                    size={"small"}
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
                  <img
                    src={work.logo}
                    alt={work.title}
                    height={70}
                    width={70}
                  />
                </div>
              )}
            </Grid>
            <Grid style={{ marginBottom: spacing(2) }}>
              <Accordion.Root
                aria-label={`Key Responsibilities for ${work.title} at ${work.company}`}
              >
                <Accordion.Summary
                  title={{
                    textWrapper: "h3",
                    title: "Key Responsibilities",
                    variant: "small",
                  }}
                />
                <Lists.Root
                  size="small"
                  type="bullet"
                  style={{ marginBottom: spacing(2) }}
                >
                  {work.summary.map((item, index) => (
                    <Lists.Item key={index} text={item} />
                  ))}
                </Lists.Root>
              </Accordion.Root>
            </Grid>
          </Fragment>
        ))}
      </Card.Container>
    </Card.Root>
  );
};

export default Work;
