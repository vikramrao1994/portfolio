import { Body, Button, Grid, Heading } from "@publicplan/kern-react-kit";
import { useRouter } from "next/navigation";
import Section from "@/components/Section";
import { useMutation } from "@/hooks/useMutation";
import { spacing } from "@/utils/utils";

interface LogoutResponse {
  success: boolean;
}

const Admin = () => {
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
            justifyContent: "space-between",
            alignItems: "center",
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
    </Section>
  );
};

export default Admin;
