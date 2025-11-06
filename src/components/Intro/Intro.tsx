/* eslint-disable @next/next/no-img-element */
import { spacing } from "@/utils/utils";
import { Body, Card, Heading } from "@publicplan/kern-react-kit";
import { SITE } from "@/lib/content";
import { cardRootStyle } from "@/styles/styles";
import Counter from "../Counter";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";

const Intro = () => {
  const { isMobile } = useBreakpointFlags();
  return (
    <Card.Root
      id="introduction"
      size="small"
      aria-label="Introduction"
      style={cardRootStyle}
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
            <Heading
              title={`Hello ! I'm ${SITE.heading.name}`}
              type={"large"}
              headerElement={"h1"}
            />
            <img src="/smile.webp" alt="Smile Icon" width={50} height={50} />
          </div>
          <Body
            isBold
            text={SITE.heading.headline}
            size="small"
            style={{ textAlign: "center", width: "100%" }}
          />
        </Card.Header>
        <Card.Body style={{ textAlign: "center" }}>
          {SITE.executive_summary}
        </Card.Body>
        <Card.Footer
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: spacing(1),
            marginBottom: spacing(2),
          }}
        >
          <div
            style={{
              display: "flex",
              gap: isMobile ? spacing(4) : spacing(8),
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: spacing(1),
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "3em",
                  textAlign: "right",
                }}
              >
                <Counter target={30} duration={4000} />
              </span>
              <Body
                text="Age"
                size="small"
                style={{ marginLeft: spacing(2) }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                padding: spacing(1),
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "3em",
                  textAlign: "right",
                }}
              >
                <Counter target={6} duration={2000} />
              </span>
              <Body
                text="Years of Experience"
                size="small"
                style={{ marginLeft: spacing(2) }}
              />
            </div>
          </div>
          {/* <img src="/address.webp" alt="Address Icon" width={24} height={24} />
          <span style={{ marginLeft: spacing(1) }}>{SITE.heading.address}</span> */}
        </Card.Footer>
      </Card.Container>
    </Card.Root>
  );
};
export default Intro;
