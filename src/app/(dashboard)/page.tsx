"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Map, MessageSquare, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    packages: 0,
    destinations: 0,
    inquiries: 0,
    stories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: packagesCount },
          { count: destinationsCount },
          { count: inquiriesCount },
          { count: storiesCount },
        ] = await Promise.all([
          supabase.from("packages").select("*", { count: "exact", head: true }),
          supabase
            .from("destinations")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("inquiries")
            .select("*", { count: "exact", head: true }),
          supabase.from("stories").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          packages: packagesCount || 0,
          destinations: destinationsCount || 0,
          inquiries: inquiriesCount || 0,
          stories: storiesCount || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="grid content-start px-5 py-10 gap-6">
      <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="bg-[#F5E8C7] border-none text-[#2D2D2D]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packages
            </CardTitle>
            <Package />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.packages}
            </div>
            <p className="text-xs text-muted-foreground">
              Available travel packages
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#F5E8C7] border-none text-[#2D2D2D]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Destinations
            </CardTitle>
            <Map />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.destinations}
            </div>
            <p className="text-xs text-muted-foreground">
              Destinations offered
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#F5E8C7] border-none text-[#2D2D2D]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
            <MessageSquare />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.inquiries}
            </div>
            <p className="text-xs text-muted-foreground">Customer messages</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F5E8C7] border-none text-[#2D2D2D]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stories & Tips
            </CardTitle>
            <BookOpen />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.stories}
            </div>
            <p className="text-xs text-muted-foreground">Published articles</p>
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent inquiries to display.
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
