"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle, MoreHorizontal, Ban, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layout } from "@/components/layout";
import type { Report, Post, User } from "@/lib/types";
import { apiRequest } from "../apiconnector/api";
import { toast } from "sonner";
import { PostDetailsDialog } from "@/components/post-details-dialog";
import { UserDetailsDialog } from "@/components/user-details-dialog";

// Add this type near the top of the file
type ReportStatus = 'PENDING' | 'DISMISSED' | 'RESOLVED';
interface PostMedia {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  postId: string;
}
// Function to fetch user names by ID
const fetchUserName = async (userId: string) => {
  try {
    const res = await apiRequest(`users/${userId}`, "GET");
    return res?.username || "Unknown User"; // Assuming API response has a `username` field
  } catch (error) {
    console.error("Error fetching user name:", error);
    return "Unknown User";
  }
};
const CLOUDINARY_BASE_URL_IMAGE = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";
const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";

const CLOUDINARY_BASE_URL_VIDEO = "https://res.cloudinary.com/dhx3clgrb/video/upload/v1741668746/";
const getFullImageUrl = (profilePicture: string | null | undefined): string => {
  if (!profilePicture) return DEFAULT_AVATAR;
  if (profilePicture.startsWith('http')) return profilePicture;
  return CLOUDINARY_BASE_URL_IMAGE + profilePicture;
};
// Add this function after getFullImageUrl
const getFullVideoUrl = (videoUrl: string | null | undefined): string => {
  if (!videoUrl) return '';
  if (videoUrl.startsWith('http')) return videoUrl;
  return CLOUDINARY_BASE_URL_VIDEO + videoUrl;
};
export default function ReportsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  // Add these new states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostMedia, setSelectedPostMedia] = useState<PostMedia[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  // Move getAllReports inside the component
  const getAllReports = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("reports", "GET");

      if (!res || !Array.isArray(res)) {
        console.error("Invalid reports data:", res);
        setReports([]);
        return;
      }

      const updatedReports = await Promise.all(
        res.map(async (report: Report) => {
          const reportedUserName = await fetchUserName(report.reportedUserId);
          const reporterUserName = await fetchUserName(report.reporterUserId);

          return {
            ...report,
            reportId: report.reportId,
            reportedUserName,
            reporterUserName,
            targetType: report.reportedPostId ? "Post" : "User",
          };
        })
      );

      setReports(updatedReports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllReports();
  }, []);

  // Add this function inside ReportsPage component
  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    try {
      await apiRequest(`reports/changeStatus/${reportId}/${newStatus}`, 'PUT');
      toast.success(`Report marked as ${newStatus.toLowerCase()}`);
      // Refresh the reports list
      getAllReports();
    } catch (error) {
      console.error(`Failed to update report status:`, error);
      toast.error('Failed to update report status');
    }
  };

  // Define table columns
  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: "targetType",
      header: "Type",
    },
    {
      accessorKey: "reportedUserName",
      header: "Target",
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      accessorKey: "reporterUserName",
      header: "Reported By",
    },
    {
      accessorKey: "reportStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("reportStatus") as string | undefined;

        if (!status) return <div className="text-gray-400">No status</div>;

        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case "resolved":
              return "text-green-600";
            case "dismissed":
              return "text-red-600";
            case "pending":
              return "text-yellow-600";
            default:
              return "text-gray-600";
          }
        };

        return (
          <div className={`font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const report = row.original;
        const isPending = report.reportStatus?.toUpperCase() === "PENDING";

        const handleWarn = async () => {
          const res = await apiRequest(`notifications/warn/${report.reportedUserId}`, "POST");
          toast.message("User warned successfully");
        };

        const handleBlock = async () => {
          const res = await apiRequest(`users/rejectUser/${report.reportedUserId}`, "PUT");
          toast.message("User blocked successfully");
        };

        const handleViewDetails = async () => {
          if (report.reportedPostId) {
            try {
              const postData = await apiRequest(`posts/${report.reportedPostId}`, "GET");
              const mediaData = await apiRequest(`media/${report.reportedPostId}`, "GET");
              setSelectedPostMedia(Array.isArray(mediaData) ? mediaData : []);
              setSelectedPost(postData);
            } catch (error) {
              console.error("Failed to fetch post details:", error);
              toast.error("Failed to fetch post details");
            }
          } else {
            try {
              const userData = await apiRequest(`users/${report.reportedUserId}`, "GET");
              setSelectedUser(userData);
              setIsUserDialogOpen(true);
            } catch (error) {
              console.error("Failed to fetch user details:", error);
              toast.error("Failed to fetch user details");
            }
          }
        };

        return (
          <div className="flex items-center gap-2">
            {isPending && report.targetType?.toLowerCase() === "user" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWarn}
                  className="h-8 w-8 text-yellow-600"
                >
                  <AlertTriangle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBlock}
                  className="h-8 w-8 text-red-600"
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </>
            )}
            {report.targetType?.toLowerCase() === "post" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  try {
                    await apiRequest(`posts/${report.reportedPostId}`, "DELETE");
                    await apiRequest(`notifications/warnPost/${report.reportedUserId}`, "POST");
                    await apiRequest(`notifications/respond/${report.reporterUserId}`,"POST");
                    toast.success("Post deleted successfully");
                    getAllReports(); // Refresh the list
                  } catch (error) {
                    console.error("Failed to delete post:", error);
                    toast.error("Failed to delete post");
                  }
                }}
                className="h-8 w-8 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}>
                  View Details
                </DropdownMenuItem>
                {isPending && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(report.reportId, 'RESOLVED')}
                    >
                      Mark as Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(report.reportId, 'DISMISSED')}
                    >
                      Dismiss Report
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: reports,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Filter reports..."
            value={(table.getColumn("reason")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("reason")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <PostDetailsDialog 
        post={selectedPost}
        media={selectedPostMedia}
        open={!!selectedPost}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPost(null);
            setSelectedPostMedia([]);
          }
        }}
      />
      
      <UserDetailsDialog
        user={selectedUser}
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
      />
    </Layout>
  );
}
