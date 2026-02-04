"use client";

import { Body, Button, Card, Grid, Heading } from "@publicplan/kern-react-kit";
import { useRouter } from "next/navigation";
import { spacing } from "@/utils/utils";

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Redirect to home page
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: spacing(3),
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Card style={{ padding: spacing(4) }}>
          <Grid>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: spacing(3),
              }}
            >
              <Heading type={"small"} headerElement={"h1"} title={"Admin Dashboard"} />
              <Button
                onClick={handleLogout}
                text="logout"
                style={{ padding: spacing(1.5) }}
                variant="secondary"
              />
            </div>

            <Body>
              Welcome to the admin dashboard. This is a placeholder page for admin functionality.
            </Body>

            <div
              style={{
                marginTop: spacing(3),
                padding: spacing(2),
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
              }}
            >
              <Heading
                style={{ marginBottom: spacing(1) }}
                type={"small"}
                headerElement={"h1"}
                title={"Coming Soon"}
              />
              <ul style={{ marginLeft: spacing(3) }}>
                <li>Content management</li>
                <li>Image uploads</li>
                <li>Analytics dashboard</li>
                <li>Blog/Photography management</li>
              </ul>
            </div>
          </Grid>
        </Card>
      </div>
    </div>
  );
}
