/* eslint-disable @next/next/no-img-element */
import { SITE } from "@/lib/content";
import { getDurationString, spacing } from "@/utils/utils";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { Body, Card, Grid, Heading, Lists } from "@publicplan/kern-react-kit";

const Work = () => {
  const { isDesktop } = useBreakpointFlags();
  return (
    <Card.Root
      size="small"
      style={{
        borderRadius: spacing(1),
        marginTop: spacing(4),
        maxWidth: "1000px",
        margin: "0 auto",
      }}
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
            {isDesktop && (<img src={work.logo} alt={work.title} height={70} width={70} />)}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Body isBold text={work.title} />
              <Body text={work.company} size={"small"} />
              <Body text={work.type} size={"small"} />
              <Body text={work.location} size={"small"} />
              <Lists.Root size="small" type="bullet" style={{maxWidth: '600px'}}>
                {work.summary.map((item, index) => (
                  <Lists.Item key={index} text={item} />
                ))}
              </Lists.Root>
              {!isDesktop && (
                <>
                  <Body isBold text={work.duration} size={"small"} />
                  <Body isBold text={getDurationString(work.exact_duration)} size={"small"} />
                </>
              )}
            </div>
            {isDesktop && (
              <div style={{ marginLeft: "auto" }}>
                <Body isBold text={work.duration} size={"small"} />
                <Body isBold text={getDurationString(work.exact_duration)} size={"small"} />
              </div>
            )}
          </Grid>
        ))}
      </Card.Container>
    </Card.Root>
  );
};

export default Work;
