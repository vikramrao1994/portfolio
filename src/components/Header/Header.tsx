/* eslint-disable @next/next/no-img-element */
"use client";
import { SITE } from "@/lib/content";
import { spacing } from "@/utils/utils";
import { Body, Button, Grid, Link } from "@publicplan/kern-react-kit";
import { useEffect, useState } from "react";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { usePathname } from "next/navigation";

interface StickyBarProps {
  show: boolean;
  onClick: () => void;
}

const DrawerButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    style={{ marginTop: spacing(1) }}
    icon={{ name: "more-vert", size: "large" }}
    iconOnly
    variant="tertiary"
    aria-label="Open menu"
    onClick={onClick}
  />
);

const StickyBar = ({ show, onClick }: StickyBarProps) => (
  <div
    style={{
      display: show ? "flex" : "none",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: spacing(2),
      paddingLeft: spacing(2),
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: spacing(1) }}>
      <img
        alt="Profile"
        src="/portrait.webp"
        width={40}
        height={40}
        style={{
          borderRadius: "50%",
          border: "2px solid #e0e0e0",
          objectFit: "cover",
        }}
      />
      <Body isBold>{SITE.heading.name}</Body>
    </div>
    <DrawerButton onClick={onClick} />
  </div>
);

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

const Drawer = ({ open, onClose }: DrawerProps) => {
  useEffect(() => {
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = open ? "hidden" : prev || "auto";
    return () => {
      document.body.style.overflowY = prev || "auto";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 999,
        }}
        onClick={onClose}
        aria-hidden={!open}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "70vw",
          maxWidth: 320,
          height: "100vh",
          background: "#fff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          padding: spacing(3),
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <Button
          icon={{ name: "close", size: "large" }}
          iconOnly
          variant="tertiary"
          aria-label="Close menu"
          style={{ alignSelf: "flex-end", marginBottom: spacing(2) }}
          onClick={onClose}
        />

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing(2),
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Link
            href="/#introduction"
            title="Intro"
            aria-label="Introduction Section"
            onClick={onClose}
          />
          <Link
            href="/#work"
            title="Work"
            aria-label="Work Section"
            onClick={onClose}
          />
          <Link
            href="/#skills"
            title="Skills"
            aria-label="Skills Section"
            onClick={onClose}
          />
          <Link
            href="/#education"
            title="Education"
            aria-label="Education Section"
            onClick={onClose}
          />
        </nav>
      </div>
    </>
  );
};

const Header = () => {
  const { isMobile } = useBreakpointFlags();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const pathname = usePathname();

  const isPhotographyPage: boolean = pathname === "/photography";

  useEffect(() => {
    if (!isMobile || isPhotographyPage) return;

    const el = document.getElementById("introduction");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, isPhotographyPage]);

  return (
    <>
      {isMobile && (
        <StickyBar show={showSticky} onClick={() => setDrawerOpen(true)} />
      )}
      <Grid
        style={{
          height: spacing(5),
          padding: 0,
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            paddingLeft: isMobile ? spacing(3) : undefined,
            display: "flex",
            alignItems: "center",
            gap: spacing(2),
          }}
        >
          {!isMobile && <DrawerButton onClick={() => setDrawerOpen(true)} />}
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <Link
            href={`tel:${SITE.heading.phone}`}
            aria-label="Phone"
            target="_blank"
            variant="small"
          >
            <img src="phone.webp" alt="Phone Logo" height={24} />
          </Link>
          <Link
            href={`mailto:${SITE.heading.email}`}
            target="_blank"
            variant="small"
            aria-label="Email"
          >
            <img src="mail.webp" alt="Email Logo" height={24} />
          </Link>
          {isPhotographyPage ? (
            <Link
              href={SITE.heading.instagram}
              target="_blank"
              variant="small"
              aria-label="Instagram"
            >
              <img src="instagram.webp" alt="Instagram Logo" height={30} />
            </Link>
          ) : (
            <>
              <Link
                href={SITE.heading.linkedin}
                target="_blank"
                variant="small"
                aria-label="LinkedIn"
              >
                <img src="linkedin.webp" alt="LinkedIn Logo" height={24} />
              </Link>
              <Link
                href={SITE.heading.github}
                target="_blank"
                variant="small"
                aria-label="GitHub"
              >
                <img src="github.webp" alt="GitHub Logo" height={24} />
              </Link>
              <Link
                href="/photography"
                variant="small"
                aria-label="Photographer"
              >
                <img
                  src="photographer.webp"
                  alt="Photographer Logo"
                  height={28}
                />
              </Link>
            </>
          )}
        </div>
        {isMobile &&
          (showSticky ? (
            <a
              href="/CV_Vikram.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginRight: spacing(2) }}
            >
              <Button
                aria-label="Download CV"
                icon={{ name: "download" }}
                iconOnly
                variant="secondary"
              />
            </a>
          ) : (
            <DrawerButton onClick={() => setDrawerOpen(true)} />
          ))}
      </Grid>
    </>
  );
};

export default Header;
