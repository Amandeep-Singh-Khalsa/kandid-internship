"use client";

import { useState, useCallback, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import AppShell from "@/components/AppShell";
import LeadsManager from "@/components/LeadsManager";
import CampaignsManager from "@/components/CampaignsManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Target, 
  TrendingUp, 
  Mail, 
  Phone, 
  MessageSquare,
  ArrowRight,
  BarChart3,
  Activity,
  Clock
} from "lucide-react";

// Create a query client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

type RouteKey = "dashboard" | "leads" | "campaigns" | "settings";

// Modern Dashboard Component
const ModernDashboard = ({ onNavigate }: { onNavigate: (route: RouteKey) => void }) => {
  const stats = [
    {
      title: "Total Leads",
      value: "2,847",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Campaigns",
      value: "24",
      change: "+3",
      changeType: "positive" as const,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Conversion Rate",
      value: "18.4%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Revenue",
      value: "$127,500",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: BarChart3,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  const recentActivity = [
    {
      type: "email",
      title: "Email campaign launched",
      description: "Summer Promo 2024 sent to 1,247 leads",
      time: "2 hours ago",
      icon: Mail,
    },
    {
      type: "call",
      title: "Follow-up calls completed",
      description: "15 leads contacted by sales team",
      time: "4 hours ago",
      icon: Phone,
    },
    {
      type: "meeting",
      title: "Demo meeting scheduled",
      description: "3 new demo meetings for this week",
      time: "1 day ago",
      icon: MessageSquare,
    },
  ];

  const campaignProgress = [
    {
      name: "Summer Promo 2024",
      progress: 78,
      target: "1,500 leads",
      current: "1,170 leads",
      status: "active",
    },
    {
      name: "Q4 Outreach",
      progress: 45,
      target: "2,000 leads",
      current: "900 leads",
      status: "active",
    },
    {
      name: "Product Launch",
      progress: 92,
      target: "500 leads",
      current: "460 leads",
      status: "completing",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your campaigns.</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" className="border-slate-200">
            <Activity className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-white shadow-sm border-0 shadow-slate-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Progress */}
        <div className="lg:col-span-2">
          <Card className="bg-white shadow-sm border-0 shadow-slate-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Campaign Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {campaignProgress.map((campaign) => (
                <div key={campaign.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">{campaign.name}</h4>
                      <p className="text-sm text-slate-600">{campaign.current} of {campaign.target}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-slate-900">{campaign.progress}%</span>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {campaign.status}
                      </div>
                    </div>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-200"
                  onClick={() => onNavigate("campaigns")}
                >
                  View All Campaigns
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="bg-white shadow-sm border-0 shadow-slate-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{activity.description}</p>
                      <div className="flex items-center mt-2">
                        <Clock className="w-3 h-3 text-slate-400 mr-1" />
                        <span className="text-xs text-slate-500">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="pt-4 border-t border-slate-100">
                <Button variant="ghost" className="w-full text-slate-600 hover:text-slate-900">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Manage Leads</h3>
                <p className="text-blue-700 mt-1">View and organize your lead pipeline</p>
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => onNavigate("leads")}
                >
                  Go to Leads
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <Users className="w-12 h-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Campaign Hub</h3>
                <p className="text-purple-700 mt-1">Create and monitor your campaigns</p>
                <Button 
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                  onClick={() => onNavigate("campaigns")}
                >
                  View Campaigns
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <Target className="w-12 h-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { data: session, isPending, refetch } = useSession();
  const [currentRoute, setCurrentRoute] = useState<RouteKey>("dashboard");
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      console.error("Sign out error:", error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch(); // Update session state
      router.push("/login");
    }
  }, [refetch, router]);

  // Handle route changes
  const handleRouteChange = useCallback((route: string) => {
    if (route === "profile") {
      // Handle profile route - could open a profile modal or navigate
      return;
    }
    
    // Handle logout from profile menu
    if (route === "logout") {
      handleSignOut();
      return;
    }

    // Set valid routes
    if (["dashboard", "leads", "campaigns", "settings"].includes(route)) {
      setCurrentRoute(route as RouteKey);
    }
  }, [handleSignOut]);

  // Render active section content
  const renderActiveSection = useCallback(() => {
    switch (currentRoute) {
      case "leads":
        return <LeadsManager />;
      case "campaigns":
        return <CampaignsManager />;
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Settings
            </h2>
            <p className="text-muted-foreground">
              Settings panel coming soon.
            </p>
          </div>
        );
      case "dashboard":
      default:
        return <ModernDashboard onNavigate={setCurrentRoute} />;
    }
  }, [currentRoute]);

  // Show loading state
  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (middleware will redirect)
  if (!session?.user) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <AppShell
          user={{
            name: session.user.name || "User",
            email: session.user.email || "",
            avatar: session.user.image || undefined
          }}
          currentRoute={currentRoute}
          onRouteChange={handleRouteChange}
          onSignOut={handleSignOut}
        >
          {renderActiveSection()}
        </AppShell>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          richColors
          closeButton
        />
      </div>
    </QueryClientProvider>
  );
}