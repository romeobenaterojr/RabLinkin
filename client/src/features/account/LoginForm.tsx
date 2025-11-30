import { useForm } from "react-hook-form";
import { useAccount } from "../../lib/hooks/useAccount";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "../../lib/schemas/loginSchema";
import { Box, Button, Paper, Typography } from "@mui/material";
import { GitHub, LockOpen } from "@mui/icons-material";
import TextInput from "../../app/shared/component/TextInput";
import { Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import agent from "../../lib/api/agent";
import type { AxiosError } from "axios";

export default function LoginForm() {
  const { loginUser } = useAccount();
  const navigate = useNavigate();
  const location = useLocation();
  const [notVerify, setNotVerify] = useState(false);

  const { control, handleSubmit, watch, formState: { isValid, isSubmitting } } = useForm<LoginSchema>({
    mode: 'onTouched',
    resolver: zodResolver(loginSchema)
  });

  const email = watch('email');

  // Mutation to resend confirmation email
  const resendConfirmationEmail = useMutation({
    mutationFn: async ({ email }: { email?: string }) => {
      return await agent.get('/account/resendConfirmEmail', { params: { email } });
    },
    onSuccess: () => {
      toast.success('Verification email sent!');
      setNotVerify(false);
    },
    onError: () => {
      toast.error('Problem sending email');
    }
  });

  const handleResendEmail = async () => {
    await resendConfirmationEmail.mutateAsync({ email });
  };

  const onSubmit = async (data: LoginSchema) => {
  await loginUser.mutateAsync(data, {
    onSuccess: () => {
      navigate(location.state?.from || '/activities');
    },
    onError: (err: unknown) => {
      // safely cast to AxiosError
      const axiosError = err as AxiosError<{ message: string }>;
      const msg = axiosError.response?.data?.message ?? "Login failed";

      if (msg.includes("not confirmed")) {
        setNotVerify(true);
      }

      toast.error(msg);
    }
  });
};

  const loginWithGithub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUrl = import.meta.env.VITE_REDIRECT_URL;
    window.location.href = 
      `https://github.com/login/oauth/authorize?client_id=${clientId}&redirectUri=${redirectUrl}&scope=read:user user:email`
  }

  return (
    <Paper 
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        gap: 3,
        maxWidth: 'md',
        mx: 'auto',
        borderRadius: 3
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={3} color="secondary.main">
        <LockOpen fontSize="large" />
        <Typography variant="h4">Sign In</Typography>
      </Box>

      <TextInput label="Email" control={control} name="email" />
      <TextInput label="Password" type="password" control={control} name="password" />

      <Button 
        type="submit"
        disabled={!isValid || isSubmitting}
        variant="contained"
        size="large"
      >
        Login
      </Button>
      <Button 
        onClick={loginWithGithub}
        startIcon={<GitHub />}
        sx={{backgroundColor: 'black'}}
        type="button"
        variant="contained"
        size="large"
      >
        Login with Github
      </Button>
      {notVerify && (
        <Box textAlign="center" mt={2}>
          <Typography color="error">Your email is not verified.</Typography>
          <Button variant="outlined" onClick={handleResendEmail} disabled={resendConfirmationEmail.isPending} sx={{ mt: 1 }}>
            Resend confirmation email
          </Button>
        </Box>
      )}

      <Typography sx={{ textAlign: 'center' }}>
        Don't have an account?
        <Typography sx={{ ml: 2 }} component={Link} to="/register" color="primary">
          Sign-up
        </Typography>
      </Typography>
    </Paper>
  );
}
