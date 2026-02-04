import { Button, Grid, PasswordInput } from "@publicplan/kern-react-kit";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import Section from "@/components/Section";
import { useMutation } from "@/hooks/useMutation";
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
    <Section id="login" ariaLabel="Admin Login" title="Admin Login">
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
              minLength: {
                value: 4,
                message: "Password must be at least 4 characters",
              },
            })}
            style={{ marginBottom: spacing(2) }}
            error={errors.password?.message}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: spacing(6),
            }}
          >
            <Button
              type="submit"
              disabled={isMutating}
              variant="secondary"
              text={isMutating ? "Logging in..." : "Login"}
            />
          </div>
        </form>
      </Grid>
    </Section>
  );
};

export default Login;
