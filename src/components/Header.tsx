import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Package, Heart, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (user) {
      // Try to get display name from user metadata
      const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
      setDisplayName(displayName);
      
      // Try to get avatar from user metadata
      const avatarUrl = user.user_metadata?.avatar_url || "";
      setAvatarUrl(avatarUrl);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Medicines", path: "/medicines" },
    { name: "Donate", path: "/donate" },
    { name: "About", path: "/about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || location.pathname !== "/"
          ? "bg-background/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 font-bold text-xl md:text-2xl"
          >
            <Heart className="h-6 w-6 text-primary" />
            <span>MediShare</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-md hover:bg-muted/80 ${
                  location.pathname === link.path
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth buttons or User menu */}
            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-md bg-muted"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full flex items-center justify-center"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback>
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{displayName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex w-full items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved" className="cursor-pointer flex w-full items-center">
                      <Heart className="mr-2 h-4 w-4" />
                      Saved Medicines
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center  gap-2">
                <Button variant="outline" onClick={() => navigate("/signin")}>
                  Sign in
                </Button>
                <Button onClick={() => navigate("/signup")
                 
                }
                className="bg-blue-500">Sign up</Button>
              </div>
            )}
          </nav>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>MediShare</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="py-2 text-sm font-medium hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  ))}
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center py-2 text-sm font-medium"
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/saved"
                        className="flex items-center py-2 text-sm font-medium"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Saved Medicines
                      </Link>
                      <Button
                        variant="ghost"
                        className="flex justify-start px-0"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/signin")}
                      >
                        Sign in
                      </Button>
                      <Button onClick={() => navigate("/signup")}>
                        Sign up
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
