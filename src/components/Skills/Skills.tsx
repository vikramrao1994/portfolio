// import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { useLanguage } from "@/context/LanguageContext";
import { SITE } from "@/lib/content";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";
import { Badge, Card, Divider, Grid, Heading } from "@publicplan/kern-react-kit";
import Image from "@/components/Image";
import { translations } from "@/lib/translations";
import {
  FrontendIcon,
  BackendIcon,
  ArchitectureIcon,
  ToolsDevOpsIcon,
} from "@/components/Icons";

const SKILL_META: Record<
  string,
  { Icon: React.FC<React.SVGProps<SVGSVGElement>>; accent: string }
> = {
  "Frontend Development": { Icon: FrontendIcon, accent: "#FF4D8D" },
  "Backend Development": { Icon: BackendIcon, accent: "#6C7CFF" },
  "Architecture & Design": { Icon: ArchitectureIcon, accent: "#FF9F0A" },
  "Tools & DevOps": { Icon: ToolsDevOpsIcon, accent: "#9B6CFF" },
  "Frontend-Entwicklung": { Icon: FrontendIcon, accent: "#FF4D8D" },
  "Backend-Entwicklung": { Icon: BackendIcon, accent: "#6C7CFF" },
  "Architektur & Design": { Icon: ArchitectureIcon, accent: "#FF9F0A" },
  "Tools, DevOps & Workflow": { Icon: ToolsDevOpsIcon, accent: "#9B6CFF" },
};

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
        <Grid>
          {SITE.skills.map((skill, index) => {
            const title = skill.key[language];
            const meta = SKILL_META[title];
            const Icon = meta?.Icon;
            const accent = meta?.accent ?? "#5B93FF";
            const items = [
              ...(skill.most_used_skills ?? []).map((t) => ({
                text: t,
                variant: "success" as const,
              })),
              ...(skill.skills ?? []).map((t) => ({
                text: t,
                variant: "info" as const,
              })),
            ];

            return (
              <Grid
                key={index}
                style={{
                  padding: spacing(1.5),
                }}
              >
                <Grid
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing(1),
                    padding: 0,
                    marginBottom: spacing(1.2),
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      background: accent,
                      boxShadow: `0 10px 30px ${accent}33`,
                      flex: "0 0 auto",
                    }}
                  >
                    {Icon ? (
                      <Icon
                        width={22}
                        height={22}
                        style={{ color: "white" }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <Heading
                    title={title}
                    type="small"
                    headerElement="h3"
                    style={{
                      textAlign: "left",
                      width: "100%",
                      margin: 0,
                    }}
                  />
                </Grid>
                {items.map((item, i) => (
                  <Badge
                    key={`mu-${i}`}
                    variant={item.variant}
                    title={item.text}
                    style={{
                      marginRight: spacing(1),
                      marginBottom: spacing(1),
                    }}
                    aria-hidden="true"
                  />
                ))}
                <Divider style={{ marginTop: spacing(1) }} />
              </Grid>
            );
          })}
        </Grid>
      </Card.Container>
    </Card.Root>
  );
};
export default Skills;
