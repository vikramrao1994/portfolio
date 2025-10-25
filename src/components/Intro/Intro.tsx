/* eslint-disable @next/next/no-img-element */
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { spacing } from "@/utils/utils";
import { Card, Heading } from "@publicplan/kern-react-kit";
import { SITE } from "@/lib/content";

const Intro = () => {
  const { isMobile } = useBreakpointFlags();
  return (
    <Card.Root
      size="small"
      style={{
        borderRadius: spacing(1),
        marginTop: spacing(4),
        paddingBottom: spacing(4),
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: `rgba(255, 255, 255, 0.8)`,
        backdropFilter: `blur(${spacing(1.25)})`,
        zIndex: 1,
      }}
    >
      <Card.Container>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            margin: `${spacing(2)}px 0`,
          }}
        >
          <img
            alt="Profile"
            src="/portrait.webp"
            width={180}
            height={180}
            style={{
              borderRadius: "50%",
              border: "6px solid #e0e0e0",
              boxShadow: "0 0 0 8px #f5f5f5, 0 4px 24px rgba(0,0,0,0.08)",
              objectFit: "cover",
              background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
            }}
          />
        </div>
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
            <Heading title={`Hello ! I am ${SITE.heading.name}`} type={"large"} headerElement={"h1"} />
            <img src="/smile.webp" alt="Smile Icon" width={50} height={50} />
          </div>
        </Card.Header>
        <Card.Body style={{ textAlign: "center" }}>{SITE.executive_summary}</Card.Body>
      </Card.Container>
    </Card.Root>
  );
};
export default Intro;
