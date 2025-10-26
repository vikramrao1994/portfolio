/* eslint-disable @next/next/no-img-element */
"use client";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { SITE } from "@/lib/content";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";
import { Body, Card, Grid, Heading, Link } from "@publicplan/kern-react-kit";

const Education = () => {
  const { isDesktop } = useBreakpointFlags();
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
            <img
              src="/school.webp"
              alt="Education Icon"
              width={50}
              height={50}
            />
            <Heading title={"Education"} type={"medium"} headerElement={"h2"} />
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
            <img src={edu.logo} alt={edu.degree} height={70} width={60} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Body isBold text={edu.degree} />
              <Body text={edu.course} size={"small"} />
              <Body text={edu.school} size={"small"} />
              <Body text={edu.location} size={"small"} />
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
