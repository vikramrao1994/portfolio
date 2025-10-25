"use client";
import { Grid, Preline, Subline } from "@publicplan/kern-react-kit";
import { SITE } from "@/lib/content";
import pkg from "../../../package.json";

const Footer = () => {
  return (
    <Grid
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Subline
        text={`© ${new Date().getFullYear()} ${SITE.heading.name} — Frontend Engineer`}
        variant="small"
      />
      <Preline
        text={`Built with Next.js v${pkg.dependencies.next} & TypeScript · Deployed on Github Pages`}
        variant="small"
      />
    </Grid>
  );
};

export default Footer;
