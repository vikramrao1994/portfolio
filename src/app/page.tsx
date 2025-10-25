"use client";
import Education from "@/components/Education";
import Intro from "@/components/Intro";
import Skills from "@/components/Skills";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { Grid } from "@publicplan/kern-react-kit";

export default function Home() {
  const { isDesktop } = useBreakpointFlags();
  return (
    <div>
      <Intro />
      <Grid.Root>
        {isDesktop ? (
          <Grid.Row>
            <Grid.Column>
              <Education />
            </Grid.Column>
            <Grid.Column>
              <Skills />
            </Grid.Column>
          </Grid.Row>
        ) : (
          <>
            <Grid.Row>
              <Grid.Column>
                <Education />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Skills />
              </Grid.Column>
            </Grid.Row>
          </>
        )}
        <Grid.Row>
          <Grid.Column>
            <Skills />
          </Grid.Column>
        </Grid.Row>
      </Grid.Root>
    </div>
  );
}
