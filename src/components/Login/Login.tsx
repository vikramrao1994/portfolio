import { Button, Card, Grid, Heading, PasswordInput } from "@publicplan/kern-react-kit";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@/hooks/useMutation";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";

interface LoginFormInputs {
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
}

const Login = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>();

  const { mutate, isMutating } = useMutation<LoginResponse, LoginFormInputs>("/api/auth/login");

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const result = await mutate(data);
      if (result?.success) {
        router.push("/admin");
      }
    } catch (err) {
      setError("password", {
        type: "server",
        message: err instanceof Error ? err.message : "An unexpected error occurred",
      });
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
            <Heading title={"Admin Login"} type={"medium"} headerElement={"h2"} />
          </div>
        </Card.Header>
        <Grid>
          <form onSubmit={handleSubmit(onSubmit)}>
            <PasswordInput
              aria-required="true"
              autoComplete="current-password"
              id="input-password"
              label="Password"
              autoFocus
              {...register("password", {
                required: "Password is required",
                minLength: { value: 4, message: "Password must be at least 4 characters" },
              })}
              style={{ marginBottom: spacing(2) }}
              error={errors.password?.message}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: spacing(6) }}>
              <Button
                type="submit"
                disabled={isMutating}
                variant="secondary"
                text={isMutating ? "Logging in..." : "Login"}
              />
            </div>
          </form>
        </Grid>
      </Card.Container>
    </Card.Root>
  );
};

export default Login;
