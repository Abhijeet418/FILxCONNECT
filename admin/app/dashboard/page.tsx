"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Activity, Users, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { apiRequest } from "../apiconnector/api";

// Add this interface near the top of the file
interface Notification {
  id: string;
  sender: string;
  senderPic: string;
  postId: string | null;
  message: string;
  createdAt: string;
  read: boolean;
}

const MotionDiv = dynamic(() => import("framer-motion").then((mod) => mod.motion.div), { ssr: false });
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";
const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";

// Add a helper function to construct the full image URL
const getFullImageUrl = (profilePicture: string | null | undefined): string => {
  if (!profilePicture) return DEFAULT_AVATAR;
  if (profilePicture.startsWith('http')) return profilePicture;
  return CLOUDINARY_BASE_URL + profilePicture;
};
export default function DashboardPage() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [activePosts, setActivePosts] = useState<number>(0);
  const [reportedUsers, setReportedUsers] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingReports, setPendingReports] = useState<number>(0);
  const [resolvedReports, setResolvedReports] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      const [totalData, activeUsersData, activePostsData, reportsData, totalPostsData, notificationsData] = 
      await Promise.all([
        apiRequest('users/total', 'GET'),
        apiRequest('users/total/active', 'GET'),
        apiRequest('posts/total/active', 'GET'),
        apiRequest('reports/users', 'GET'),  // Changed API endpoint
        apiRequest('posts', 'GET'),
        apiRequest('adminNotif/all', 'GET')
      ]);

      // Count unique reported users with non-dismissed reports
      const reportedUserIds = new Set(
        reportsData
          .filter((report: any) => report.reportStatus !== 'DISMISSED')
          .map((report: any) => report.reportedUserId)
      );

      // Count pending reports
      const pendingReportsCount = reportsData.filter(
        (report: any) => report.reportStatus === 'PENDING'
      ).length;

      // Count resolved reports
      const resolvedReportsCount = reportsData.filter(
        (report: any) => report.reportStatus === 'RESOLVED'
      ).length;

      setTotalUsers(totalData);
      setActiveUsers(activeUsersData);
      setActivePosts(activePostsData);
      setReportedUsers(reportedUserIds.size);  // Set count of unique reported users
      setPendingReports(pendingReportsCount);
      setResolvedReports(resolvedReportsCount);
      setTotalPosts(totalPostsData.length);
      // Ensure notifications is an array and sort by createdAt in descending order
      setNotifications(
        Array.isArray(notificationsData) 
          ? notificationsData.sort((a, b) => {
              const dateA = new Date(a.createdAt);
              const dateB = new Date(b.createdAt);
              return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
            })
          : []
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setNotifications([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Use the auto-refresh hook (refreshes every 30 seconds)
  useAutoRefresh(fetchData);

  return (
    <Layout>
      <div className="relative">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <span className="block h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <span className="mt-1 block h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    {/* <span className="text-xs text-green-600 dark:text-green-400">
                      +20.1% from last month
                    </span> */}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-300" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <span className="block h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <span className="mt-1 block h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{activeUsers}</div>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {`${((activeUsers / totalUsers) * 100).toFixed(1)}% of total users`}
                    </span>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                  <FileText className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <span className="block h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <span className="mt-1 block h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{activePosts}</div>
                    <span className="text-xs text-purple-600 dark:text-purple-400">
                      Active posts
                    </span>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reported Users</CardTitle>
                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <span className="block h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    <span className="mt-1 block h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{reportedUsers}</div>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {`${((reportedUsers / totalUsers) * 100).toFixed(1)}% of total users`}
                    </span>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Commented out Active Now card
            <Card className="transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                  <Activity className="h-4 w-4 text-green-600 dark:text-green-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">573</div>
                <p className="text-xs text-green-600 dark:text-green-400">+201 since last hour</p>
              </CardContent>
            </Card>
            */}

          </div>

          {/* Recent Activity and Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full transform transition-all duration-200 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    // Loading state
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 rounded-lg bg-slate-50 p-4">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                          <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                        </div>
                      </div>
                    ))
                  ) : !Array.isArray(notifications) || notifications.length === 0 ? (
                    <p className="text-center text-sm text-gray-500">No recent activity</p>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-center gap-4 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
                      >
                        <div className="relative h-8 w-8">
                          {notification.senderPic ? (
                            <img
                              src={getFullImageUrl(notification.senderPic)}
                              alt={notification.sender}
                              className="h-full w-full rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_AVATAR;
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                              <Users className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {notification.sender} {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(notification.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="h-full transform transition-all duration-200 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Total Posts", value: isLoading ? "..." : totalPosts.toString() },
                    { label: "Active Users", value: isLoading ? "..." : activeUsers.toString() },
                    { label: "Resolved Reports", value: isLoading ? "..." : resolvedReports.toString() },
                    { label: "Pending Reports", value: isLoading ? "..." : pendingReports.toString() },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      <p className="text-sm font-medium">{stat.label}</p>
                      <p className="text-sm font-bold">{stat.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </MotionDiv>
          </div>
        </div>
      </div>
    </Layout>
  );
}