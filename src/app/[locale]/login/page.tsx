"use client";

import { Grid } from "@publicplan/kern-react-kit";
import Login from "@/components/Login";

export default function LoginPage() {
  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <Login />
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
}
