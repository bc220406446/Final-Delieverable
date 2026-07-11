import { JSX } from "react";

export interface FormMessage {
  type: "error" | "success";
  text: string;
}

interface Props {
  message: FormMessage | null;
}

// Shared success/error banner for form feedback.
export default function MessageBanner({ message }: Props): JSX.Element | null {
  // Render nothing until a page provides a message.
  if (!message) return null;

  return (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
        message.type === "error"
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-green-50 border-green-200 text-green-700"
      }`}
      role="alert"
    >
      {message.text}
    </div>
  );
}
