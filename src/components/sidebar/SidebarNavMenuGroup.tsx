"use client";

import { ReactNode } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { SignedIn, SignedOut } from "@/services/clerk/components/SignInStatus";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = Readonly<{
  href: string
  icon: ReactNode
  label: string
  authStatus?: "signedOut" | "signedIn"
}>

function SidebarNavMenuItem({ href, icon, label, pathname }: MenuItem & { pathname: string }) {
  return (
    <SidebarMenuItem key={href}>
      <SidebarMenuButton asChild isActive={pathname === href}>
        <Link href={href}>
          {icon}
          <span>
            {label}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function SidebarNavMenuGroup({
  items,
  className,
}: Readonly<{
  items: MenuItem[]
  className?: string
}>) {
  const pathname = usePathname();

  return (
    <SidebarGroup className={className}>
      <SidebarMenu>
        {items.map(item => {
          if (item.authStatus === "signedOut") {
            return (
              <SignedOut key={item.href}>
                <SidebarNavMenuItem
                  {...item}
                  pathname={pathname}
                />
              </SignedOut>
            );
          }

          if (item.authStatus === "signedIn") {
            return (
              <SignedIn key={item.href}>
                <SidebarNavMenuItem
                  {...item}
                  pathname={pathname}
                />
              </SignedIn>
            );
          }

          return  (
            <SidebarNavMenuItem
              {...item}
              key={item.href}
              pathname={pathname}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
