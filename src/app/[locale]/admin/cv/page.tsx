"use client";

import { Accordion, Body, Grid } from "@publicplan/kern-react-kit";
import AdminCard from "@/components/Admin/Card/AdminCard";
import HeadingForm from "@/components/Admin/Forms/HeadingForm";

export default function AdminPage() {
  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <AdminCard id="admin" title="CV Editor" ariaLabel="CV Editor">
            <Accordion.Group>
              <Accordion.Root isOpened={true}>
                <Accordion.Summary
                  title={{
                    textWrapper: "h2",
                    title: "Profile / Heading",
                  }}
                />
                <HeadingForm />
              </Accordion.Root>
              <Accordion.Root>
                <Accordion.Summary
                  title={{
                    textWrapper: "h2",
                    title: "About Me",
                  }}
                />
                <Body>Coming soon...</Body>
              </Accordion.Root>
              <Accordion.Root>
                <Accordion.Summary
                  title={{
                    textWrapper: "h2",
                    title: "Experience",
                  }}
                />
                <Body>Coming soon...</Body>
              </Accordion.Root>
              <Accordion.Root>
                <Accordion.Summary
                  title={{
                    textWrapper: "h2",
                    title: "Education",
                  }}
                />
                <Body>Coming soon...</Body>
              </Accordion.Root>
              <Accordion.Root>
                <Accordion.Summary
                  title={{
                    textWrapper: "h2",
                    title: "Skills",
                  }}
                />
                <Body>Coming soon...</Body>
              </Accordion.Root>
            </Accordion.Group>
          </AdminCard>
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
}
