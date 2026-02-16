"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  Brain,
  Lightbulb,
  Target,
  DollarSign,
  Users,
  Award,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { regenerateIndustryInsights } from "@/actions/dashboard";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

const IndustryInsightsView = ({ insights }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const router = useRouter();

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      toast.info("Regenerating industry insights...");
      
      await regenerateIndustryInsights();
      
      toast.success("Industry insights regenerated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error regenerating insights:", error);
      toast.error("Failed to regenerate insights. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Transform salary data for the chart
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
    location: range.location,
  }));

  // Prepare data for skills pie chart
  const skillsData = insights.topSkills.slice(0, 5).map((skill, index) => ({
    name: skill,
    value: 100 - index * 15, // Mock value for visualization
  }));

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" };
      case "neutral":
        return { icon: LineChartIcon, color: "text-yellow-500", bg: "bg-yellow-500/10" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" };
      default:
        return { icon: LineChartIcon, color: "text-gray-500", bg: "bg-gray-500/10" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color;
  const outlookBg = getMarketOutlookInfo(insights.marketOutlook).bg;

  // Format dates using date-fns
  const lastUpdatedDate = format(new Date(insights.lastUpdated), "MMM dd, yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true }
  );

  return (
    <div className="space-y-6">
      {/* Header with Update Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Badge variant="outline" className="mb-2">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Insights
          </Badge>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdatedDate} • Next update {nextUpdateDistance}
          </p>
        </div>
        <Button 
          onClick={handleRegenerate} 
          disabled={isRegenerating}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          {isRegenerating ? "Regenerating..." : "Regenerate Insights"}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`${outlookBg} border-2`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Market Outlook
            </CardTitle>
            <OutlookIcon className={`h-5 w-5 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${outlookColor}`}>
              {insights.marketOutlook}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall market condition
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Industry Growth
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {insights.growthRate.toFixed(1)}%
            </div>
            <Progress value={Math.min(insights.growthRate, 100)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Year-over-year growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
            <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.demandLevel}</div>
            <div
              className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                insights.demandLevel
              )}`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Talent demand status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Key Skills Required
            </CardTitle>
            <Brain className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.topSkills.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In-demand skills tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="salaries">Salaries</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Salary Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Salary Overview
                </CardTitle>
                <CardDescription>
                  Average salary ranges across top roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salaryData.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-medium mb-1">{label}</p>
                                {payload.map((item) => (
                                  <p key={item.name} className="text-sm">
                                    {item.name}: ${item.value}K
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="median" fill="#3b82f6" name="Median (K)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Skills Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Skills Distribution
                </CardTitle>
                <CardDescription>
                  Most in-demand skills in the industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={skillsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {skillsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Trends & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Industry Trends
                </CardTitle>
                <CardDescription>
                  Current trends shaping the industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.keyTrends.map((trend, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="h-2 w-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-sm">{trend}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommended Skills to Learn
                </CardTitle>
                <CardDescription>
                  Skills to boost your career prospects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {insights.recommendedSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      <Award className="w-3 h-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Salaries Tab */}
        <TabsContent value="salaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Salary Ranges by Role</CardTitle>
              <CardDescription>
                Comprehensive salary data including minimum, median, and maximum
                ranges (in thousands)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const location = payload[0]?.payload?.location;
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-medium mb-2">{label}</p>
                              {location && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  📍 {location}
                                </p>
                              )}
                              {payload.map((item) => (
                                <p key={item.name} className="text-sm" style={{ color: item.color }}>
                                  {item.name}: ${item.value}K
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
                    <Bar dataKey="median" fill="#3b82f6" name="Median Salary (K)" />
                    <Bar dataKey="max" fill="#1e40af" name="Max Salary (K)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Salary Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown</CardTitle>
              <CardDescription>Detailed view of all roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-right p-3 font-medium">Min</th>
                      <th className="text-right p-3 font-medium">Median</th>
                      <th className="text-right p-3 font-medium">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.salaryRanges.map((range, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{range.role}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {range.location || "Global"}
                        </td>
                        <td className="p-3 text-right">${(range.min / 1000).toFixed(0)}K</td>
                        <td className="p-3 text-right font-medium">
                          ${(range.median / 1000).toFixed(0)}K
                        </td>
                        <td className="p-3 text-right">${(range.max / 1000).toFixed(0)}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Top In-Demand Skills
                </CardTitle>
                <CardDescription>
                  Skills most sought after by employers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.topSkills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{skill}</span>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                      <Progress value={100 - index * 10} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Skills to Develop
                </CardTitle>
                <CardDescription>
                  Boost your career with these skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {insights.recommendedSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{skill}</span>
                      </div>
                      <Badge>Recommended</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Industry Trends & Analysis
              </CardTitle>
              <CardDescription>
                Stay ahead with current market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.keyTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Trend #{index + 1}</h4>
                        <p className="text-sm text-muted-foreground">{trend}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Outlook</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${outlookBg}`}>
                  <OutlookIcon className={`h-8 w-8 ${outlookColor} mb-2`} />
                  <p className={`text-xl font-bold ${outlookColor}`}>
                    {insights.marketOutlook}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Overall market condition
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-xl font-bold text-green-500">
                    {insights.growthRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Year-over-year growth
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Demand Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-blue-500/10">
                  <Users className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-xl font-bold text-blue-500">
                    {insights.demandLevel}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Talent demand status
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndustryInsightsView;
