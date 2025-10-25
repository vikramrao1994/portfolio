"use client";
import Education from "@/components/Education";
import Intro from "@/components/Intro";
import Skills from "@/components/Skills";
import Work from "@/components/Work";
import { Grid } from "@publicplan/kern-react-kit";

const Home = () => {
  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <Intro />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Skills />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Work />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <Education />
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
}

export default Home;