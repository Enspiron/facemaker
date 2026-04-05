"use client";
import { useTheme } from "next-themes";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Smile,
  Palette,
  History,
  Settings,
  Bell,
  CircleUser,
  ImagePlus,
  Sparkles,
  Moon,
  Sun,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Face Maker", icon: Smile },
  { label: "Templates", icon: Palette },
  { label: "History", icon: History },
  { label: "Settings", icon: Settings },
];

const stats = [
  { label: "Total Faces", value: "128", icon: Smile },
  { label: "Templates Used", value: "34", icon: Palette },
  { label: "AI Generations", value: "512", icon: Sparkles },
  { label: "Uploads", value: "76", icon: ImagePlus },
];

const recentProjects = [
  { name: "Portrait Alpha", status: "Complete", progress: 100, variant: "default" as const },
  { name: "Avatar Set B", status: "In Progress", progress: 65, variant: "secondary" as const },
  { name: "Style Pack 3", status: "Draft", progress: 20, variant: "outline" as const },
];

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">WF Facemaker</span>
          </div>
        </SidebarHeader>
        <Separator />
        <SidebarContent className="pt-2">
          <SidebarMenu>
            {navItems.map(({ label, icon: Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton>
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b px-4 sticky top-0 bg-background z-10">
          <SidebarTrigger />
          <span className="font-semibold flex-1">Dashboard</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          <Button variant="ghost" size="icon">
            <CircleUser className="h-4 w-4" />
          </Button>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <Card key={label}>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Projects */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {recentProjects.map(({ name, status, progress, variant }) => (
                  <div key={name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{name}</span>
                      <Badge variant={variant}>{status}</Badge>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">View All Projects</Button>
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link href="/facebuilder" className="w-full">
                  <Button className="w-full justify-start gap-2">
                    <Smile className="h-4 w-4" /> Open Face Maker
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Button variant="secondary" className="w-full justify-start gap-2">
                  <ImagePlus className="h-4 w-4" /> Upload Photo
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Sparkles className="h-4 w-4" /> AI Generate
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Palette className="h-4 w-4" /> Browse Templates
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
