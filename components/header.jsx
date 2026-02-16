import React from "react";
import { Button } from "./ui/button";
import { BUTTONS_MENUS } from "@/lib/constants";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  MoonIcon,
  SunIcon,
  BarChart3,
  User,
} from "lucide-react";

import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { checkUser } from "@/lib/checkUser";
import { useTheme } from "next-themes";
import ThemSwitch from "./theme-switch";


export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <Image
            src={"/career-kit.png"}
            alt="App Logo"
            width={200}
            height={60}
            className=" py-1 w-auto object-none"
          />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <SignedIn>
            <Link href="/industry-insights">
              <Button
                variant="outline"
                className="hidden lg:inline-flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                {BUTTONS_MENUS.INDUSTRY_INSIGHTS}
              </Button>
            </Link>

            {/* Growth Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2">
                  <StarsIcon className="h-4 w-4" />
                  <span className="hidden md:block">{BUTTONS_MENUS.GROWTH_TOOLS}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/industry-insights" className="flex items-center gap-2 lg:hidden">
                    <BarChart3 className="h-4 w-4" />
                    {BUTTONS_MENUS.INDUSTRY_INSIGHTS}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {BUTTONS_MENUS.BUILD_RESUME}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/ai-cover-letter"
                    className="flex items-center gap-2"
                  >
                    <PenBox className="h-4 w-4" />
                    {BUTTONS_MENUS.COVER_LETTER}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {BUTTONS_MENUS.INTERVIEW_PREP}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant="outline">{BUTTONS_MENUS.SIGN_IN}</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Edit Profile</span>
                </Button>
              </Link>
              <Link href="/course-admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden md:inline">My Courses</span>
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard: "shadow-xl",
                    userPreviewMainIdentifier: "font-semibold",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>
          <ThemSwitch />
        </div>
      </nav>
    </header>
  );
}
