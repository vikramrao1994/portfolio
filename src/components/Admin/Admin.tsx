"use client";

import { Accordion, Body, Button, Grid } from "@publicplan/kern-react-kit";
import { useRouter } from "next/navigation";
import Section from "@/components/Section";
import { useMutation } from "@/hooks/useMutation";
import { TRPCProvider } from "@/trpc/client";
import { spacing } from "@/utils/utils";
import HeadingForm from "./HeadingForm";

interface LogoutResponse {
  success: boolean;
}

const AdminContent = () => {
  const router = useRouter();

  const { mutate: logout, isMutating: isLoggingOut } =
    useMutation<LogoutResponse>("/api/auth/logout");

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Section id="admin" ariaLabel="Admin Dashboard" title="Admin Dashboard">
      <Grid>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: spacing(3),
          }}
        >
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            text={isLoggingOut ? "Logging out..." : "Logout"}
            variant="secondary"
          />
        </div>
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
      </Grid>
    </Section>
  );
};

const Admin = () => {
  return (
    <TRPCProvider>
      <AdminContent />
    </TRPCProvider>
  );
};

export default Admin;
