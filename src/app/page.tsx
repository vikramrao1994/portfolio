"use client";
import Education from "@/components/Education";
import Intro from "@/components/Intro";
import Skills from "@/components/Skills";
import Work from "@/components/Work";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { spacing } from "@/utils/utils";
import { Grid } from "@publicplan/kern-react-kit";

const Home = () => {
  const { isDesktop } = useBreakpointFlags();
  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column
          width={4}
          breakpoint="lg"
          style={{
            ...(isDesktop && {
              position: "sticky",
              top: spacing(10),
              alignSelf: "flex-start",
              zIndex: 2,
            }),
          }}
        >
          <Intro />
        </Grid.Column>
        <Grid.Column width={8} breakpoint="lg">
          <Work />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Skills />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Education />
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
};

export default Home;
