"use client";
import { spacing } from "@/utils/utils";
import { Card, Heading } from "@publicplan/kern-react-kit";

const NotFound = () => {
  return (
    <Card.Root
      size="small"
      style={{
        borderRadius: spacing(1),
        marginTop: spacing(4),
        paddingBottom: spacing(4),
        maxWidth: "800px",
        height: "70vh",
        margin: "0 auto",
        backgroundColor: `rgba(255, 255, 255, 0.8)`,
        backdropFilter: `blur(${spacing(1.25)})`,
        zIndex: 1,
      }}
    >
      <Card.Header>
        <Heading
          title={"404 - Page Not Found"}
          type={"large"}
          headerElement={"h1"}
          style={{ textAlign: "center", width: "100%" }}
        />
      </Card.Header>
      <Card.Body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
        }}
      >
        The page you are looking for does not exist.
      </Card.Body>
    </Card.Root>
  );
};
export default NotFound;
