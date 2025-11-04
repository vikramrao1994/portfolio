/* eslint-disable @next/next/no-img-element */
"use client";
import { SITE } from "@/lib/content";
import { spacing } from "@/utils/utils";
import { Button, Grid, Link } from "@publicplan/kern-react-kit";
import { useState } from "react";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";

const Header = () => {
  const { isDesktop } = useBreakpointFlags();
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
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
          gap: isDesktop ? spacing(4) : spacing(2),
        }}
      >
        {!isDesktop && (
          <>
            <Button
              style={{ marginTop: spacing(1) }}
              icon={{
                name: "more-vert",
                size: "large",
              }}
              iconOnly
              variant="tertiary"
              onClick={() => setDrawerOpen(true)}
            />
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
                transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
                pointerEvents: drawerOpen ? "auto" : "none",
              }}
            >
              <Button
                icon={{ name: "close", size: "large" }}
                iconOnly
                variant="tertiary"
                style={{ alignSelf: "flex-end", marginBottom: spacing(2) }}
                onClick={() => setDrawerOpen(false)}
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
                  href="#introduction"
                  title="Intro"
                  aria-label="Introduction Section"
                  onClick={() => setDrawerOpen(false)}
                />
                <Link
                  href="#work"
                  title="Work"
                  aria-label="Work Section"
                  onClick={() => setDrawerOpen(false)}
                />
                <Link
                  href="#skills"
                  title="Skills"
                  aria-label="Skills Section"
                  onClick={() => setDrawerOpen(false)}
                />
                <Link
                  href="#education"
                  title="Education"
                  aria-label="Education Section"
                  onClick={() => setDrawerOpen(false)}
                />
              </nav>
            </div>
          </>
        )}
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
      </div>
      {isDesktop && (
        <nav
          style={{ display: "flex", justifyContent: "center", gap: spacing(3) }}
        >
          <Link
            href="#introduction"
            title="Intro"
            aria-label="Introduction Section"
          />
          <Link href="#work" title="Work" aria-label="Work Section" />
          <Link href="#skills" title="Skills" aria-label="Skills Section" />
          <Link
            href="#education"
            title="Education"
            aria-label="Education Section"
          />
        </nav>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: spacing(5),
        }}
      >
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
            text={isDesktop ? "View CV" : "CV"}
            variant="primary"
          />
        </a>
      </div>
    </Grid>
  );
};

export default Header;
