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
        <Link href={`tel:${SITE.heading.phone}`} target="_blank" variant="small">
          <img
            src={`phone.png`}
            alt="Phone Logo"
            height={24}
            style={{ display: "block", margin: "0 auto" }}
          />
          {isDesktop && <span>{SITE.heading.phone}</span>}
        </Link>
        <Link href={`mailto:${SITE.heading.email}`} target="_blank" variant="small">
          <img
            src={`mail.png`}
            alt="Email Logo"
            height={24}
            style={{ display: "block", margin: "0 auto" }}
          />
          {isDesktop && <span>{SITE.heading.email}</span>}
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: spacing(4) }}>
        <Link href={SITE.heading.linkedin} target="_blank" variant="small">
          <img
            src={`linkedin.png`}
            alt="LinkedIn Logo"
            height={24}
            style={{ display: "block", margin: "0 auto" }}
          />
          {isDesktop && <span>linkedin</span>}
        </Link>
        <Link href={SITE.heading.github} target="_blank" variant="small">
          <img
            src={`github.png`}
            alt="GitHub Logo"
            height={24}
            style={{ display: "block", margin: "0 auto" }}
          />
          {isDesktop && <span>vikramrao1994</span>}
        </Link>
        <Button
          icon={{ name: "download" }}
          iconLeft
          text={isDesktop ? "View CV" : "CV"}
          variant="primary"
        />
      </div>
    </Grid>
  );
};

export default Header;
