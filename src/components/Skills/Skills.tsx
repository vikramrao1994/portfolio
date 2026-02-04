import { Badge, Divider, Grid, Heading } from "@publicplan/kern-react-kit";
import { useLocale, useTranslations } from "next-intl";
import { ArchitectureIcon, BackendIcon, FrontendIcon, ToolsDevOpsIcon } from "@/components/Icons";
import Section from "@/components/Section";
import { useSiteContent } from "@/context/SiteContentContext";
import type { Language } from "@/lib/siteSchema";
import { spacing } from "@/utils/utils";

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
  const language = useLocale() as Language;
  const SITE = useSiteContent();
  const t = useTranslations();
  return (
    <Section
      id="skills"
      ariaLabel="Skills"
      title={t("skills")}
      icon={{ src: "/tech_stack.webp", alt: "Skills Icon" }}
    >
      {SITE.skills.map((skill, index) => {
        const title = skill.key[language];
        const meta = SKILL_META[title ?? ""];
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
            key={`skill-${index}-${language}`}
            style={{
              marginBottom: index < SITE.skills.length - 1 ? spacing(1) : spacing(2),
            }}
          >
            <Grid
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing(1),
                padding: 0,
                marginBottom: spacing(2),
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: spacing(1.5),
                  display: "grid",
                  placeItems: "center",
                  background: accent,
                  boxShadow: `0 10px 30px ${accent}33`,
                }}
              >
                {Icon ? (
                  <Icon width={22} height={22} style={{ color: "white" }} aria-hidden="true" />
                ) : null}
              </div>
              <Heading title={title ?? ""} type="small" headerElement="h3" />
            </Grid>
            {items.map((item, i) => (
              <Badge
                key={`mu-${i}-${language}`}
                variant={item.variant}
                title={item.text}
                style={{
                  marginRight: spacing(1),
                  marginBottom: spacing(1),
                }}
                aria-hidden="true"
              />
            ))}
            {index < SITE.skills.length - 1 && <Divider style={{ marginTop: spacing(2) }} />}
          </Grid>
        );
      })}
    </Section>
  );
};
export default Skills;
