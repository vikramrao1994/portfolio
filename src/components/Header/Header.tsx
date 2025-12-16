/* eslint-disable @next/next/no-img-element */
"use client";
import { SITE } from "@/lib/content";
import { spacing } from "@/utils/utils";
import { Body, Button, Grid, Link } from "@publicplan/kern-react-kit";
import { useEffect, useRef, useState } from "react";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
interface StickyBarProps {
  show: boolean;
}


const StickyBar = ({ show }: StickyBarProps) => (
  <div
    style={{
      display: show ? "flex" : "none",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: spacing(2),
      paddingBottom: 0,
      paddingLeft: spacing(2),
      paddingRight: spacing(2),
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: spacing(1) }}>
      <img
        alt="Profile"
        src="/portrait.webp"
        width={40}
        height={40}
        style={{ borderRadius: "50%", border: "2px solid #e0e0e0", objectFit: "cover" }}
      />
      <Body isBold>{SITE.heading.name}</Body>
    </div>
    <a
      href="/CV_Vikram.pdf"
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <Button
        aria-label="Download CV"
        icon={{ name: "download" }}
        iconLeft
        text={"CV"}
        variant="secondary"
      />
    </a>
  </div>
);

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

const Drawer = ({ open, onClose }: DrawerProps) => {
  useEffect(() => {
    if (open) {
      if (typeof window != "undefined" && window.document) {
        document.body.style.overflowY = "hidden";
      }
    } else {
      document.body.style.overflowY = "auto";
    }
  }, [open]);

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
      />
      {/* Drawer */}
      <div
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

interface DrawerButtonProps {
  onClick: () => void;
}

const DrawerButton = ({ onClick }: DrawerButtonProps) => (
  <Button
    style={{ marginTop: spacing(1) }}
    icon={{ name: "more-vert", size: "large" }}
    iconOnly
    variant="tertiary"
    onClick={onClick}
  />
);

const Header = () => {
  const { isMobile } = useBreakpointFlags();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const introRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isMobile) return;
    // Find the intro card by id
    introRef.current = document.getElementById("introduction");
    const handleScroll = () => {
      if (!introRef.current) return;
      const rect = introRef.current.getBoundingClientRect();
      setShowSticky(rect.top + rect.height < 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  return (
    <>
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
            <img src={`phone.webp`} alt="Phone Logo" height={24} />
          </Link>
          <Link
            href={`mailto:${SITE.heading.email}`}
            target="_blank"
            variant="small"
            aria-label="Email"
          >
            <img src={`mail.webp`} alt="Email Logo" height={24} />
          </Link>
          <Link
            href={SITE.heading.linkedin}
            target="_blank"
            variant="small"
            aria-label="LinkedIn"
          >
            <img src={`linkedin.webp`} alt="LinkedIn Logo" height={24} />
          </Link>
          <Link
            href={SITE.heading.github}
            target="_blank"
            variant="small"
            aria-label="GitHub"
          >
            <img src={`github.webp`} alt="GitHub Logo" height={24} />
          </Link>
          <Link href={"/photography"} variant="small" aria-label="Photographer">
            <img src={`photographer.webp`} alt="Photographer Logo" height={28} />
          </Link>
        </div>
        {isMobile && <DrawerButton onClick={() => setDrawerOpen(true)} />}
      </Grid>
      {isMobile && <StickyBar show={showSticky} />}
    </>
  );
};

export default Header;
