import { Body, Button, Card, Grid, Heading } from "@publicplan/kern-react-kit";
import { useRouter } from "next/navigation";
import { useMutation } from "@/hooks/useMutation";
import { cardRootStyle } from "@/styles/styles";
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
    <Card.Root id="login" size="small" aria-label="Admin Login" style={{ ...cardRootStyle }}>
      <Card.Container>
        <Card.Header>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing(2),
              width: "100%",
            }}
          >
            <Heading title={"Admin Dashboard"} type={"medium"} headerElement={"h2"} />
          </div>
        </Card.Header>
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
      </Card.Container>
    </Card.Root>
  );
};

export default Admin;
