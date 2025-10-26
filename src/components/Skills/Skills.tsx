/* eslint-disable @next/next/no-img-element */
// import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { SITE } from "@/lib/content";
import { spacing } from "@/utils/utils";
import { Body, Card, Heading } from "@publicplan/kern-react-kit";

const Skills = () => {
  // const { isMobile } = useBreakpointFlags();
  return (
    <Card.Root
      aria-label="Skills"
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
              src="/tech_stack.webp"
              alt="Skills Icon"
              width={50}
              height={50}
            />
            <Heading title={"Skills"} type={"medium"} headerElement={"h2"} />
          </div>
        </Card.Header>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing(3),
            justifyContent: "center",
            alignItems: "stretch",
            width: "100%",
          }}
        >
          {SITE.skills.map((skill, index) => (
            <div
              key={index}
              style={{
                minWidth: 220,
                maxWidth: 320,
                flex: "1 1 220px",
                padding: spacing(2),
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
              }}
            >
              <Heading
                title={`${skill.key}: `}
                type={"small"}
                headerElement={"h3"}
                style={{ textAlign: "left", width: "100%" }}
              />
              <Body
                style={{ color: "green", textAlign: "left", width: "100%" }}
                text={skill.most_used_skills.join(", ")}
              />
              <Body
                text={skill.skills?.join(", ")}
                style={{ textAlign: "left", width: "100%" }}
              />
            </div>
          ))}
        </div>
      </Card.Container>
    </Card.Root>
  );
};
export default Skills;
