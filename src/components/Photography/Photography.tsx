"use client";
import { Card, Heading } from "@publicplan/kern-react-kit";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";

const Photography = () => {
  return (
    <Card.Root
      id="photography"
      size="small"
      aria-label="Photography Portfolio"
      style={{ ...cardRootStyle, height: "67vh" }}
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
            <Heading title={"Photography"} type={"medium"} headerElement={"h2"} />
          </div>
        </Card.Header>
        <Card.Body>coming soon...</Card.Body>
      </Card.Container>
    </Card.Root>
  );
};

export default Photography;
