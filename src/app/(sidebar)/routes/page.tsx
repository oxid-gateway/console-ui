"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState, useEffect } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    ColumnDef,
    getPaginationRowModel,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Route = {
    id: number;
    path: string;
    private: boolean;
    "upstream-id": number;
    "workspace-id": number;
}

type PaginatedResponse = {
    data: Route[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

const columns: ColumnDef<Route>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "path",
        header: "Path",
    },
    {
        accessorKey: "private",
        header: "Private",
        cell: ({ row }) => (
            <span className={row.original.private ? "text-amber-600 font-medium" : "text-green-600 font-medium"}>
                {row.original.private ? "Yes" : "No"}
            </span>
        ),
    },
    {
        accessorKey: "upstream-id",
        header: "Upstream ID",
    },
    {
        accessorKey: "workspace-id",
        header: "Workspace ID",
    },
]

const fetchRoutes = async (page: number, pageSize: number): Promise<PaginatedResponse> => {
    const { data } = await axios.get(`http://localhost:9999/routes?page=${page}&pageSize=${pageSize}`, {
        headers: {
            Authorization: `Bearer ${"123"}`
        }
    });

    return {
        data: data.rows,
        total: data.count,
        page,
        pageSize,
        totalPages: Math.ceil(data.count / pageSize),
    };
}

const createRoute = async (route: Omit<Route, 'id'>): Promise<Route> => {
    console.log(route)
    const { data } = await axios.post(`http://localhost:9999/routes`, route, {
        headers: {
            Authorization: `Bearer ${"123"}`,
            'Content-Type': 'application/json'
        }
    });
    return data;
}

export default function RoutesPage() {
    const [data, setData] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        path: "",
        private: false,
        "upstream-id": "",
        "workspace-id": "",
    });

    const router = useRouter();

    // Fetch data when pagination changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await fetchRoutes(
                    pagination.pageIndex + 1,
                    pagination.pageSize
                );
                setData(response.data);
                setTotalPages(response.totalPages);
                setTotalRecords(response.total);
            } catch (error) {
                toast.error("Failed to fetch routes")
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [pagination.pageIndex, pagination.pageSize]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            private: checked
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const newRoute = {
                path: formData.path,
                private: formData.private,
                "upstream-id": parseInt(formData["upstream-id"]),
                "workspace-id": parseInt(formData["workspace-id"]),
            };

            await createRoute(newRoute);
            toast.success("Route created successfully!");
            
            // Reset form
            setFormData({
                path: "",
                private: false,
                "upstream-id": "",
                "workspace-id": "",
            });
            
            // Close modal
            setIsModalOpen(false);
            
            // Refresh the data
            const response = await fetchRoutes(
                pagination.pageIndex + 1,
                pagination.pageSize
            );
            setData(response.data);
            setTotalPages(response.totalPages);
            setTotalRecords(response.total);
        } catch (error) {
            toast.error("Failed to create route");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        pageCount: totalPages,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
    })

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl">Routes</CardTitle>
                        <CardDescription>
                            Routes define the API paths and endpoints that map incoming requests to specific upstreams, with configurable access control and routing rules.
                        </CardDescription>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Create New Route</DialogTitle>
                                    <DialogDescription>
                                        Add a new route configuration. Fill in all the required fields.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="path">Path</Label>
                                        <Input
                                            id="path"
                                            name="path"
                                            value={formData.path}
                                            onChange={handleInputChange}
                                            placeholder="/api/v1/users"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="private">Private Route</Label>
                                            <div className="text-sm text-muted-foreground">
                                                Requires authentication to access
                                            </div>
                                        </div>
                                        <Switch
                                            id="private"
                                            checked={formData.private}
                                            onCheckedChange={handleSwitchChange}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="upstream-id">Upstream ID</Label>
                                        <Input
                                            id="upstream-id"
                                            name="upstream-id"
                                            type="number"
                                            value={formData["upstream-id"]}
                                            onChange={handleInputChange}
                                            placeholder="Enter upstream ID"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="workspace-id">Workspace ID</Label>
                                        <Input
                                            id="workspace-id"
                                            name="workspace-id"
                                            type="number"
                                            value={formData["workspace-id"]}
                                            onChange={handleInputChange}
                                            placeholder="Enter workspace ID"
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? "Creating..." : "Create Route"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="rounded-md border w-full">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        onClick={() => router.push(`/routes/${row.original.id}`)}
                                        className="cursor-pointer hover:bg-muted/50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                        {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalRecords)} of{" "}
                        {totalRecords} results
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            First
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <div className="text-sm font-medium">
                            Page {pagination.pageIndex + 1} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(totalPages - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            Last
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
