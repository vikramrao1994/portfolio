/* eslint-disable @next/next/no-img-element */
"use client";
import { SITE } from "@/lib/content";
import { spacing } from "@/utils/utils";
import { Button, Grid, Link } from "@publicplan/kern-react-kit";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";

const Header = () => {
  const { isDesktop } = useBreakpointFlags();

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
      <div style={{ display: "flex", alignItems: "center", gap: spacing(4) }}>
        <Link
          href={`tel:${SITE.heading.phone}`}
          aria-label="Phone"
          target="_blank"
          variant="small"
        >
          <img
            src={`phone.webp`}
            alt="Phone Logo"
            height={24}
            style={{ display: "block", margin: "0 auto" }}
          />
        </Link>
        <Link
          href={`mailto:${SITE.heading.email}`}
          target="_blank"
          variant="small"
          aria-label="Email"
        >
          <img
            src={`mail.webp`}
            alt="Email Logo"
            height={24}
            style={{ display: "block", margin: "0 auto" }}
          />
        </Link>
        <Link
          href={SITE.heading.linkedin}
          target="_blank"
          variant="small"
          aria-label="LinkedIn"
        >
          <img
            src={`linkedin.webp`}
            alt="LinkedIn Logo"
            height={24}
            style={{ display: "block", margin: "0 auto" }}
          />
        </Link>
        <Link
          href={SITE.heading.github}
          target="_blank"
          variant="small"
          aria-label="GitHub"
        >
          <img
            src={`github.webp`}
            alt="GitHub Logo"
            height={24}
            style={{ display: "block", margin: "0 auto" }}
          />
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
        <a href="/CV_Vikram.pdf" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
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
