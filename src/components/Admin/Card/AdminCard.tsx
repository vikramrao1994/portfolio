import { Button, Grid } from "@publicplan/kern-react-kit";
import Section from "@/components/Section";
import { useMutation } from "@/hooks/useMutation";
import { useRouter } from "@/i18n/navigation";
import { TRPCProvider } from "@/trpc/client";
import { spacing } from "@/utils/utils";

interface LogoutResponse {
  success: boolean;
}

interface AdminCardProps {
  children?: React.ReactNode;
  id: string;
  ariaLabel?: string;
  title: string;
}

const AdminCard = ({ children, id, ariaLabel, title }: AdminCardProps) => {
  const router = useRouter();

  const { mutate: logout, isMutating: isLoggingOut } =
    useMutation<LogoutResponse>("/api/auth/logout");

  const handleLogout = async () => {
    try {
      await logout();
      router.refresh();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Section id={id} ariaLabel={ariaLabel} title={title}>
      <TRPCProvider>
        <Grid>
          {children}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: spacing(3),
            }}
          >
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              text={isLoggingOut ? "Logging out..." : "Logout"}
              variant="secondary"
            />
          </div>
        </Grid>
      </TRPCProvider>
    </Section>
  );
};

export default AdminCard;
