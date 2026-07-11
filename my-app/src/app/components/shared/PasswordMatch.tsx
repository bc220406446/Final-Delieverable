import { JSX } from "react";

interface Props {
  password: string;
  confirm: string;
}

// Shows whether the confirmation password matches the original password.
export default function PasswordMatch({ password, confirm }: Props): JSX.Element | null {
  // Avoid showing feedback until the user starts typing the confirmation.
  if (!confirm) return null;

  const match = password === confirm;

  return (
    <p className={`mt-1.5 text-xs font-semibold ${match ? "text-green-600" : "text-red-500"}`}>
      {match ? "Passwords match" : "Passwords do not match"}
    </p>
  );
}
