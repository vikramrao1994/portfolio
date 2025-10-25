import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { spacing } from "@/utils/utils";
import { Card, Button } from "@publicplan/kern-react-kit";

const Skills = () => {
  const { isMobile } = useBreakpointFlags();
  return (
    <Card.Root
      size="small"
      style={{
        // maxWidth: isMobile ? "300px" : "500px",
        // margin:"0 auto",
        borderRadius: spacing(1),
        marginTop: spacing(4),
        // height: "100%",
        // maxHeight: '400px',
        // maxHeight: '800px',
      }}
    >
      <Card.Container>
        <Card.Header>
          <Card.Title>Skills</Card.Title>
        </Card.Header>
        <Card.Body>
          React, TypeScript, JavaScript, HTML, CSS, Git, RESTful APIs,
          Responsive Design, Agile Methodologies, Testing (Jest, React Testing
          Library), UI/UX Principles, Web Performance Optimization,
          Cross-Browser Compatibility, CI/CD, Docker, Node.js
        </Card.Body>
      </Card.Container>
    </Card.Root>
  );
};
export default Skills;
