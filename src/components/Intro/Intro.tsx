import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { spacing } from "@/utils/utils";
import { Card } from "@publicplan/kern-react-kit";
import { SITE } from "@/lib/content";

const Intro = () => {
  const { isMobile } = useBreakpointFlags();
  return (
    <Card.Root
      size="small"
      style={{
        maxWidth: isMobile ? "300px" : "500px",
        margin: "0 auto",
        borderRadius: spacing(1),
        // height: "100%",
        // maxHeight: '400px',
        // maxHeight: '800px',
      }}
    >
      <Card.Container>
        <Card.Media alt="Card media" src="/portrait.webp" />
        <Card.Header>
          <Card.Preline>{SITE.heading.headline}</Card.Preline>
          <Card.Title>{SITE.heading.name}</Card.Title>
        </Card.Header>
        <Card.Body>{SITE.executive_summary}</Card.Body>
        <Card.Footer>
        </Card.Footer>
      </Card.Container>
    </Card.Root>
  );
};
export default Intro;
