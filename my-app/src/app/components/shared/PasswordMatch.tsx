import { JSX } from "react";

interface Props {
  password: string;
  confirm: string;
}

export default function PasswordMatch({ password, confirm }: Props): JSX.Element | null {
  if (!confirm) return null;

  const match = password === confirm;

  return (
    <p className={`mt-1.5 text-xs font-semibold ${match ? "text-green-600" : "text-red-500"}`}>
      {match ? "Passwords match" : "Passwords do not match"}
    </p>
  );
}
