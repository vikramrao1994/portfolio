"use client";
import Intro from "@/components/Intro";
import Skills from "@/components/Skills";
import { useBreakpointFlags } from "@/hooks/useBreakpoints";
import { Grid } from "@publicplan/kern-react-kit";

export default function Home() {
  const { isMobile } = useBreakpointFlags();
  return (
    <div>
      <Intro />
      <Grid.Root>
        {!isMobile ? (
          <Grid.Row>
            <Grid.Column>
              <Skills />
            </Grid.Column>
            <Grid.Column>
              <Skills />
            </Grid.Column>
          </Grid.Row>
        ) : (
          <>
            <Grid.Row>
              <Grid.Column>
                <Skills />
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
