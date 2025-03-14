"use client"

import { useEffect, useState } from "react"
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
} from "@tanstack/react-table"
import { Check, X, MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout } from "@/components/layout"
import type { Post } from "@/lib/types"
import { apiRequest } from "../apiconnector/api"
import { PostDetailsDialog } from "@/components/post-details-dialog"

interface PostDetailsDialogProps {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Add this type definition near the top of the file
interface PostMedia {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  postId: string;
}

function timeAgo(dateString: string | undefined | null) {
  try {
    if (!dateString) return "Invalid";

    // Parse the ISO date string
    const parsedDate = new Date(dateString);

    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }

    const now = new Date();
    const diffInMilliseconds = now.getTime() - parsedDate.getTime();
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    // Find the appropriate interval
    for (const { label, seconds } of intervals) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${label}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'Just now';
  } catch (error) {
    console.error('Error in timeAgo:', error);
    return 'Invalid date';
  }
}

export default function PostsPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [activeTab, setActiveTab] = useState("pending")
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  // Modify the selectedPost state to include media
  const [selectedPostMedia, setSelectedPostMedia] = useState<PostMedia[]>([])

  // Function to fetch posts based on active tab
  const fetchPosts = async () => {
    try {
      const res = await apiRequest("posts", "GET")
      console.log("posts are", res)

      // Sort all posts by date first (most recent first)
      const sortedPosts = [...res].sort((a, b) => {
        const dateA = new Date(a.createdAt || '');
        const dateB = new Date(b.createdAt || '');
        return dateB.getTime() - dateA.getTime();
      });

      let filteredPosts = sortedPosts;

      // If viewing all posts, prioritize pending posts
      if (activeTab === "all") {
        filteredPosts = [
          ...sortedPosts.filter(post => post.status === "3"), // Pending first
          ...sortedPosts.filter(post => post.status !== "3")  // Then the rest
        ];
      } else {
        // Filter based on tab
        if (activeTab === "pending") {
          filteredPosts = sortedPosts.filter((post: Post) => post.status === "3")
        } else if (activeTab === "approved") {
          filteredPosts = sortedPosts.filter((post: Post) => post.status === "1")
        } else if (activeTab === "rejected") {
          filteredPosts = sortedPosts.filter((post: Post) => post.status === "0")
        }
      }

      setPosts(filteredPosts)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
    }
  }

  // Add this function inside the PostsPage component
  const fetchPostMedia = async (postId: string) => {
    try {
      const media = await apiRequest(`media/${postId}`, "GET");
      setSelectedPostMedia(media || []);
    } catch (error) {
      console.error("Failed to fetch post media:", error);
      setSelectedPostMedia([]);
    }
  };

  useEffect(() => {
    fetchPosts()
  }, [activeTab]) // Depend on activeTab to refetch data

  // Column definitions with updated action handlers
  const columns: ColumnDef<Post>[] = [
    {
      accessorKey: "content",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Content
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const content = row.getValue("content") as string;
        const truncatedContent = content ? `${content.slice(0, 20)}${content.length > 20 ? '...' : ''}` : 'No content';
        return <span title={content}>{truncatedContent}</span>;
      }
    },
    {
      accessorKey: "user.username",
      header: "Author",
    },
    {
      accessorKey: "createdAt", // Changed from user.createdAt to createdAt
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return timeAgo(date);
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const post = row.original

        const handleApprove = async () => {
          try {
            // Add approve logic here
            const res = await apiRequest(`posts/approvePost/${post.id}`, "PUT")
            console.log(res)
            console.log("Approve post:", post.id)

            // Refresh the posts list after approval
            fetchPosts()
          } catch (error) {
            console.error("Failed to approve post:", error)
          }
        }

        const handleReject = async () => {
          try {
            // Add reject logic here
            const res = await apiRequest(`posts/rejectPost/${post.id}`, "PUT")
            console.log(res)
            console.log("Reject post:", post.id)

            // Refresh the posts list after rejection
            fetchPosts()
          } catch (error) {
            console.error("Failed to reject post:", error)
          }
        }

        return (
          <div className="flex items-center gap-2">
            {post.status === "3" && (
              <>
                <Button variant="ghost" size="icon" onClick={handleApprove} className="h-8 w-8 text-green-600">
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleReject} className="h-8 w-8 text-red-600">
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={async () => {
                  try {
                    const mediaData = await apiRequest(`media/${post.id}`, "GET");
                    // console.log(mediaData,'mediaData');
                    setSelectedPostMedia(Array.isArray(mediaData) ? mediaData : []);
                    setSelectedPost({
                      ...post,
                      createdAt: post.createdAt, // Ensure createdAt is included
                      user: {
                        ...post.user,
                        username: post.user?.username || 'Unknown User'
                      }
                    });
                  } catch (error) {
                    console.error("Failed to fetch post media:", error);
                    setSelectedPostMedia([]);
                    setSelectedPost(post);
                  }
                }}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={async () => {
                    try {
                      await apiRequest(`posts/${post.id}`, "DELETE")
                      const userId = await apiRequest(`users/getByEmail/${post.user.email}`,'GET');
                      await apiRequest(`notifications/warnPost/${userId}`,'POST');
                      fetchPosts() // Refresh after deletion
                    } catch (error) {
                      console.error("Failed to delete post:", error)
                    }
                  }}
                >
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: posts,
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
  })

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Filter posts..."
            value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("content")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending" onClick={() => setActiveTab("pending")}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" onClick={() => setActiveTab("approved")}>
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" onClick={() => setActiveTab("rejected")}>
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all" onClick={() => setActiveTab("all")}>
              All Posts
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
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
    </Layout>
  )
}