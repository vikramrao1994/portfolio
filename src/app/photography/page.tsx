"use client";
import Photography from "@/components/Photography";
import { Grid } from "@publicplan/kern-react-kit";

const PhotographyPage = () => {
  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <Photography />
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
};
export default PhotographyPage;
