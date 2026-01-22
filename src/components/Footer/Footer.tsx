import { Grid, Preline, Subline } from "@publicplan/kern-react-kit";
import StackIcon from "tech-stack-icons";
import { SITE } from "@/lib/content";
import { spacing } from "@/utils/utils";

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
        text={`© ${new Date().getFullYear()} ${SITE.heading.name} - All rights reserved.`}
        style={{ textAlign: "center" }}
        variant="small"
      />
      <Grid
        style={{
          display: "flex",
          gap: spacing(1),
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Preline text={`Built with`} style={{ textAlign: "center" }} variant="small" />
        <span style={{ width: 20, height: 20 }}>
          <StackIcon name={"typescript"} />
        </span>
        <span style={{ width: 20, height: 20 }}>
          <StackIcon name={"react"} />
        </span>
        <span style={{ width: 20, height: 20 }}>
          <StackIcon name={"nextjs"} />
        </span>
        <Preline text={`&`} style={{ textAlign: "center" }} variant="small" />
        <span style={{ width: 20, height: 20 }}>
          <StackIcon name={"bunjs"} />
        </span>
      </Grid>
    </Grid>
  );
};

export default Footer;
