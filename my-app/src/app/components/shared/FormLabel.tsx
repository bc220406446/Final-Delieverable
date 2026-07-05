import { JSX, type ReactNode } from "react";

interface Props {
  htmlFor: string;
  children: ReactNode;
}

export default function FormLabel({ htmlFor, children }: Props): JSX.Element {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-extrabold uppercase tracking-wide text-gray-500 mb-1.5">
      {children}
    </label>
  );
}
