"use client";

import { Grid } from "@publicplan/kern-react-kit";
import Admin from "@/components/Admin";

export default function AdminPage() {
  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <Admin />
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
}
