import { PropsWithChildren } from "react";

export default function ClerkLayout({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div>
        {children}
      </div>
    </div>
  );
}