import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	Badge,
	Button,
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
	FieldTitle,
	Input,
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
	REGEXP_ONLY_DIGITS,
	Spinner,
	toast
} from "@workspace/ui";
import { Fragment, useEffect, useRef, useState } from "react";
import z from "zod";
import { authClient } from "@/auth/client";
import { appConfig } from "@workspace/config";

type Step = "email" | "otp";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState("");
	const [resendCountdown, setResendCountdown] = useState(0);
	const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const queryClient = useQueryClient();

	const startCountdown = () => {
		setResendCountdown(60);
		countdownRef.current = setInterval(() => {
			setResendCountdown((n) => {
				if (n <= 1) {
					if (countdownRef.current)
						clearInterval(countdownRef.current);
					return 0;
				}
				return n - 1;
			});
		}, 1000);
	};

	useEffect(
		() => () => {
			if (countdownRef.current) clearInterval(countdownRef.current);
		},
		[]
	);

	const sendOtpMutation = useMutation({
		mutationFn: async (email: string) =>
			authClient.emailOtp.sendVerificationOtp({ email, type: "sign-in" }),
		onSuccess: (response) => {
			if (response?.error) {
				toast.error(
					response.error.message || "Failed to send verification code"
				);
				return;
			}
			setStep("otp");
			startCountdown();
			toast.success("Verification code sent to your email");
		},
		onError: (error: { error?: { message?: string } }) => {
			toast.error(
				error.error?.message || "Failed to send verification code"
			);
		}
	});

	const verifyOtpMutation = useMutation({
		mutationFn: async ({ email, otp }: { email: string; otp: string }) =>
			authClient.signIn.emailOtp({ email, otp }),
		onSuccess: async (response) => {
			if (response?.error) {
				toast.error(response.error.message || "Failed to sign in");
				return;
			}
			toast.success("Successfully signed in");
			if (response?.data)
				queryClient.setQueryData(["user"], response.data);
			window.location.href = redirectTo || appConfig.authDefaultRedirect;
		},
		onError: (error: { error?: { message?: string } }) => {
			toast.error(error.error?.message || "Failed to sign in");
		}
	});

	const emailForm = useForm({
		defaultValues: { email: "" },
		validators: {
			onChange: z.object({
				email: z.string().email("Invalid email address")
			})
		},
		onSubmit: async ({ value }) => {
			setEmail(value.email);
			await sendOtpMutation.mutateAsync(value.email);
		}
	});

	const otpForm = useForm({
		defaultValues: { otp: "" },
		validators: {
			onChange: z.object({
				otp: z.string().min(6, "OTP must be at least 6 characters")
			})
		},
		onSubmit: async ({ value }) => {
			await verifyOtpMutation.mutateAsync({ email, otp: value.otp });
		}
	});

	const socialSignInMutation = useMutation({
		mutationFn: async ({ provider }: { provider: "google" }) => {
			const callbackURL = redirectTo
				? `${import.meta.env.VITE_URL}${redirectTo}`
				: `${import.meta.env.VITE_URL}${appConfig.authDefaultRedirect}`;
			return authClient.signIn.social({ provider, callbackURL });
		},
		onError: (error: { error?: { message?: string } }, variables) => {
			toast.error(
				error.error?.message ||
					`Failed to sign in with ${variables.provider}`
			);
		}
	});

	const lastMethod = authClient.getLastUsedLoginMethod();

	const handleBack = () => {
		setStep("email");
		sendOtpMutation.reset();
		verifyOtpMutation.reset();
		if (countdownRef.current) clearInterval(countdownRef.current);
		setResendCountdown(0);
	};

	return (
		<Fragment>
			{/* Email Step */}
			<div
				className={`flex flex-col gap-4 transition-all duration-200 ${
					step === "email"
						? "pointer-events-auto opacity-100"
						: "pointer-events-none absolute opacity-0"
				}`}
			>
				{/* Google OAuth */}
				<Button
					type="button"
					variant="outline"
					className="relative flex h-10 w-full items-center justify-center gap-2 border-border bg-background text-sm font-medium hover:bg-muted/30"
					onClick={() =>
						socialSignInMutation.mutate({ provider: "google" })
					}
					disabled={socialSignInMutation.isPending}
				>
					<GoogleLogo />
					Sign in with Google
					{lastMethod === "google" && (
						<Badge className="absolute -right-2 -top-3 text-[9px] px-1.5 py-0">
							Last used
						</Badge>
					)}
				</Button>

				{/* Divider */}
				<div className="flex items-center gap-3">
					<div className="h-px flex-1 bg-border/50" />
					<span className="text-[11px] font-medium text-muted-foreground">
						or continue with email
					</span>
					<div className="h-px flex-1 bg-border/50" />
				</div>

				{/* Email form */}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						emailForm.handleSubmit();
					}}
					className="flex flex-col gap-3"
				>
					<emailForm.Field name="email">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										<FieldTitle className="text-xs font-semibold text-foreground">
											Email address
										</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(
													e.target.value
												)
											}
											aria-invalid={isInvalid}
											type="email"
											placeholder="you@example.com"
											autoComplete="email"
											className="h-10 border-border/60 bg-background text-sm transition-colors focus:border-foreground"
											disabled={sendOtpMutation.isPending}
										/>
										{isInvalid && (
											<FieldError
												errors={field.state.meta.errors}
											/>
										)}
									</FieldContent>
								</Field>
							);
						}}
					</emailForm.Field>

					<Button
						type="submit"
						className="h-10 w-full bg-foreground text-sm font-medium text-background hover:bg-foreground/90"
						disabled={sendOtpMutation.isPending}
					>
						{sendOtpMutation.isPending ? (
							<>
								<Spinner className="mr-2 size-4" />
								Sending code…
							</>
						) : (
							"Continue with Email"
						)}
					</Button>
				</form>
			</div>

			{/* OTP Step */}
			{step === "otp" && (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						otpForm.handleSubmit();
					}}
					className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
				>
					{/* Back */}
					<button
						type="button"
						onClick={handleBack}
						className="-ml-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						<HugeiconsIcon
							icon={ArrowLeft01Icon}
							className="size-3.5"
						/>
						Back
					</button>

					{/* Instruction */}
					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							Enter the 6-digit code sent to
						</p>
						<p className="text-sm font-semibold text-foreground">
							{email}
						</p>
					</div>

					<otpForm.Field name="otp">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched &&
								!field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldContent className="flex flex-col items-center gap-2">
										<InputOTP
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(value) =>
												field.handleChange(value)
											}
											aria-invalid={isInvalid}
											disabled={
												verifyOtpMutation.isPending
											}
											maxLength={6}
											pattern={REGEXP_ONLY_DIGITS}
											type="text"
											autoComplete="one-time-code"
											inputMode="numeric"
											containerClassName="mx-auto"
										>
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
											</InputOTPGroup>
											<InputOTPSeparator />
											<InputOTPGroup>
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
										{isInvalid && (
											<FieldError
												errors={field.state.meta.errors}
											/>
										)}
									</FieldContent>
								</Field>
							);
						}}
					</otpForm.Field>

					<Button
						type="submit"
						className="h-10 w-full bg-foreground text-sm font-medium text-background hover:bg-foreground/90"
						disabled={verifyOtpMutation.isPending}
					>
						{verifyOtpMutation.isPending ? (
							<>
								<Spinner className="mr-2 size-4" />
								Verifying…
							</>
						) : (
							"Verify & Sign in"
						)}
					</Button>

					{/* Resend */}
					<button
						type="button"
						onClick={() => {
							sendOtpMutation.mutate(email);
							startCountdown();
						}}
						disabled={
							sendOtpMutation.isPending || resendCountdown > 0
						}
						className="text-center text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
					>
						{resendCountdown > 0
							? `Resend code in ${resendCountdown}s`
							: "Didn't receive the code? Resend"}
					</button>
				</form>
			)}
		</Fragment>
	);
}

function GoogleLogo() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="16"
			height="16"
			aria-hidden="true"
			role="img"
		>
			<title>Google Logo</title>
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	);
}
