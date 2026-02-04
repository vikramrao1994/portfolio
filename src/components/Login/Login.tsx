import { Button, Card, Grid, Heading, PasswordInput } from "@publicplan/kern-react-kit";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { cardRootStyle } from "@/styles/styles";
import { spacing } from "@/utils/utils";

interface LoginFormInputs {
  password: string;
}

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormInputs>();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError("password", {
          type: "server",
          message: result.message ?? "Invalid password",
        });
        setLoading(false);
        return;
      }
      if (result.success) {
        router.push("/admin");
      }
    } catch (_err) {
      setError("password", {
        type: "server",
        message: "An unexpected error occurred. Please try again.",
      });
      setLoading(false);
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
                disabled={loading}
                variant="secondary"
                text={loading ? "Logging in..." : "Login"}
              />
            </div>
          </form>
        </Grid>
      </Card.Container>
    </Card.Root>
  );
};

export default Login;
