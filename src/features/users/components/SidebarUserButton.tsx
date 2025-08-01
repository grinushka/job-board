import { Suspense } from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import { SidebarUserButtonClient } from "./_SidebarUserButtonClient";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";

export function SidebarUserButton() {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
}

async function SidebarUserSuspense() {
  const { user } = await getCurrentUser({ allData: true });
  console.log("user", user);

  if (user == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  return <SidebarUserButtonClient user={user} />;
}
