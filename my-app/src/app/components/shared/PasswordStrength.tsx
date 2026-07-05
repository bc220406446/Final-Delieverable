import { JSX } from "react";
import { getPasswordStrength } from "@/lib/passwordStrength";

interface Props {
  password: string;
}

export default function PasswordStrength({ password }: Props): JSX.Element | null {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  const widthMap = {
    none: "w-0",
    weak: "w-1/4",
    medium: "w-2/4",
    strong: "w-3/4",
    "very-strong": "w-full",
  };
  const colorMap = {
    none: "",
    weak: "bg-red-500",
    medium: "bg-amber-500",
    strong: "bg-green-500",
    "very-strong": "bg-green-600",
  };
  const labelMap = {
    none: "",
    weak: "text-red-500",
    medium: "text-amber-600",
    strong: "text-green-600",
    "very-strong": "text-green-700",
  };

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${labelMap[strength.level]}`}>{strength.label}</span>
        <span className="text-xs text-gray-400">{strength.score}/7</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorMap[strength.level]} ${widthMap[strength.level]}`} />
      </div>
      {strength.errors.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {strength.errors.map((error) => (
            <li key={error} className="text-xs text-red-500 flex items-center gap-1">
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
