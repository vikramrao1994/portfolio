import { Button } from "@publicplan/kern-react-kit";
import { useEffect, useRef, useState } from "react";
import AvatarCanvas from "@/components/Avatar/AvatarCanvas";
import Image from "@/components/Image";
import { spacing } from "@/utils/utils";

type AvatarProps = {
  size?: number;
  borderStyle?: React.CSSProperties;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

const Avatar = ({ size = 180, borderStyle }: AvatarProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const canShow3D = enabled && inView && !reducedMotion;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Button
        onClick={() => setEnabled((v) => !v)}
        aria-pressed={enabled}
        aria-label={enabled ? "Disable 3D avatar" : "Enable 3D avatar"}
        style={{
          position: "absolute",
          bottom: spacing(-1),
          left: "80%",
          zIndex: 3,
          borderRadius: "50%",
          padding: "6px 10px",
          background: "rgba(255,255,255,0.9)",
        }}
        variant="tertiary"
        iconOnly
        icon={{
          name: "autorenew",
          size: "small",
          "aria-hidden": true,
        }}
      />
      <div
        style={{
          width: size,
          height: size,
          overflow: "hidden",
          borderRadius: "50%",
          transition: "border-radius 260ms ease, transform 260ms ease",
          ...borderStyle,
        }}
      >
        {canShow3D ? (
          <AvatarCanvas />
        ) : (
          <Image
            alt="Profile"
            src="/portrait.webp"
            width={size}
            height={size}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
      </div>
      {reducedMotion && enabled ? (
        <span
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: -22,
            fontSize: 12,
            opacity: 0.75,
            whiteSpace: "nowrap",
          }}
        >
          Motion reduced
        </span>
      ) : null}
    </div>
  );
};

export default Avatar;
