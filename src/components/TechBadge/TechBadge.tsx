import StackIcon from "tech-stack-icons";

export interface TechBadgeProps extends React.ComponentPropsWithoutRef<"span"> {
  variant: "info" | "success" | "warning" | "danger";
  tech: { id: string; title: string };
}

const TechBadge: React.FC<TechBadgeProps> = ({
  tech,
  variant,
  className,
  ...rest
}: TechBadgeProps) => {
  return (
    <span {...rest} className={`kern-badge kern-badge--${variant} ${className}`}>
      <span style={{ width: 20, height: 20 }}>
        <StackIcon name={tech.id} />
      </span>
      <span className="kern-label kern-label-small">
        <span className="kern-label kern-sr-only">
          {variant.replace(/^./, (c) => c.toUpperCase())}
        </span>
        {tech.title}
      </span>
    </span>
  );
};

export default TechBadge;
