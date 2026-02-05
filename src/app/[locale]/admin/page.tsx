"use client";

import { Grid, Link, Lists } from "@publicplan/kern-react-kit";
import AdminCard from "@/components/Admin/Card/AdminCard";

export default function AdminPage() {
  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <AdminCard id="admin" title="Admin Dashboard" ariaLabel="Admin Dashboard">
            <Lists.Root type="link">
              <Lists.Item>
                <Link
                  href="/admin/cv"
                  icon={{
                    "aria-hidden": true,
                    name: "arrow-forward",
                    size: "default",
                  }}
                  iconLeft
                  title="CV Editor"
                />
              </Lists.Item>
              <Lists.Item>
                <Link
                  href="/admin/photography"
                  icon={{
                    "aria-hidden": true,
                    name: "arrow-forward",
                    size: "default",
                  }}
                  iconLeft
                  title="Photography Editor"
                />
              </Lists.Item>
            </Lists.Root>
          </AdminCard>
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
}
