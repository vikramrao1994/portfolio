"use client";

import { Grid } from "@publicplan/kern-react-kit";
import AdminCard from "@/components/Admin/Card/AdminCard";

export default function AdminPage() {
  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <AdminCard id="admin" title="Photography Editor" ariaLabel="Photography Editor">
            <Grid>
              <p>Photography Editor coming soon...</p>
            </Grid>
          </AdminCard>
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
}
