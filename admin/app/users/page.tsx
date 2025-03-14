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
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Layout } from "@/components/layout"
import { apiRequest } from "../apiconnector/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type User = {
  id: string
  username: string
  email: string
  status: 0 | 1 | 2  // Changed status to numerical values
  reports: number
}

interface UserDetails {
  username: string;
  profilePicture: string | null;
  bio: string | null;
}

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/";
const DEFAULT_AVATAR = "https://res.cloudinary.com/djvat4mcp/image/upload/v1741357526/zybt9ffewrjwhq7tyvy1.png";

// Add a helper function to construct the full image URL
const getFullImageUrl = (profilePicture: string | null | undefined): string => {
  if (!profilePicture) return DEFAULT_AVATAR;
  if (profilePicture.startsWith('http')) return profilePicture;
  return CLOUDINARY_BASE_URL + profilePicture;
};

export default function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await apiRequest("users", "GET")
      setUsers(res || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      const details = await apiRequest(`users/${userId}`, "GET");
      setSelectedUserDetails(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  useEffect(() => {
    fetchUsers()
  }, [])

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "username",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as number
        const statusText = status === 0 ? "Blocked" : status === 1 ? "Active" : "Pending"
        const statusColor = status === 0 ? "text-red-600" : status === 1 ? "text-green-600" : "text-yellow-600"

        return <div className={`font-medium ${statusColor}`}>{statusText}</div>
      },
    },
    {
      accessorKey: "reports",
      header: "Reports",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const userId = row.original.id;

        const handleBlockUser = async () => {
          try {
            await apiRequest(`users/rejectUser/${userId}`, "PUT");
            fetchUsers();
          } catch (error) {
            console.error("Failed to block user:", error);
          }
        };

        const handleApproveUser = async () => {
          try {
            await apiRequest(`users/approveUser/${userId}`, "PUT");
            fetchUsers();
          } catch (error) {
            console.error("Failed to approve user:", error);
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => fetchUserDetails(userId)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleApproveUser} className="text-green-600">
                Approve User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlockUser} className="text-red-600">
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  })

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Filter users..."
            value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("username")?.setFilterValue(event.target.value)}
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
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
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
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">User Details</DialogTitle>
          </DialogHeader>
          {selectedUserDetails && (
            <div className="flex flex-col items-center space-y-6 py-4">
              <div className="relative h-32 w-32 overflow-hidden rounded-full">
                <img
                  src={getFullImageUrl(selectedUserDetails.profilePicture)}
                  alt={`${selectedUserDetails.username}'s profile`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <div className="space-y-3 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedUserDetails.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUserDetails.bio || "No bio available!"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
