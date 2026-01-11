// import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { useLanguage } from "@/context/LanguageContext";
import { SITE } from "@/lib/content";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";
import { Body, Card, Heading } from "@publicplan/kern-react-kit";
import Image from "@/components/Image";
import { translations } from "@/lib/translations";
const Skills = () => {
  // const { isMobile } = useBreakpointFlags();
  const { language } = useLanguage();
  return (
    <Card.Root
      id="skills"
      aria-label="Skills"
      size="small"
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
              src="/tech_stack.webp"
              alt="Skills Icon"
              width={50}
              height={50}
            />
            <Heading
              title={translations.skills[language]}
              type={"medium"}
              headerElement={"h2"}
            />
          </div>
        </Card.Header>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing(1),
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
                padding: spacing(1),
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
              }}
            >
              <Heading
                title={`${skill.key[language]}: `}
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
