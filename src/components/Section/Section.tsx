import { Card, Heading } from "@publicplan/kern-react-kit";
import Image from "@/components/Image";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";

interface SectionProps {
  id?: string;
  ariaLabel?: string;
  title: string;
  icon?: {
    src: string;
    alt: string;
  };
  headingType?: "large" | "medium" | "small";
  headingElement?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Section = ({
  id,
  ariaLabel,
  title,
  icon,
  headingType = "medium",
  headingElement = "h2",
  style,
  children,
}: SectionProps) => {
  return (
    <Card.Root id={id} size="small" aria-label={ariaLabel} style={{ ...cardRootStyle, ...style }}>
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
            {icon && <Image src={icon.src} alt={icon.alt} width={50} height={50} />}
            <Heading title={title} type={headingType} headerElement={headingElement} />
          </div>
        </Card.Header>
        {children}
      </Card.Container>
    </Card.Root>
  );
};

export default Section;
