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
import axios from "axios";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Upstream = {
    id: number;
    name: string;
    "workspace-id": number;
    host: string;
    port: number;
}

type PaginatedResponse = {
    data: Upstream[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

const columns: ColumnDef<Upstream>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "workspace-id",
        header: "Workspace ID",
    },
    {
        accessorKey: "host",
        header: "Host",
    },
    {
        accessorKey: "port",
        header: "Port",
    },
]

const fetchUpstreams = async (page: number, pageSize: number): Promise<PaginatedResponse> => {
    const { data } = await axios.get(`http://localhost:9999/upstreams?page=${page}&pageSize=${pageSize}`, {
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

const createUpstream = async (upstream: Omit<Upstream, 'id'>): Promise<Upstream> => {
    console.log(upstream)
    const { data } = await axios.post(`http://localhost:9999/upstreams`, upstream, {
        headers: {
            Authorization: `Bearer ${"123"}`,
            'Content-Type': 'application/json'
        }
    });
    return data;
}

export default function UpstreamsPage() {
    const [data, setData] = useState<Upstream[]>([]);
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
        name: "",
        "workspace-id": "",
        host: "",
        port: "",
    });

    const router = useRouter();

    // Fetch data when pagination changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await fetchUpstreams(
                    pagination.pageIndex + 1,
                    pagination.pageSize
                );
                setData(response.data);
                setTotalPages(response.totalPages);
                setTotalRecords(response.total);
            } catch (error) {
                toast.error("Failed to fetch upstreams")
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const newUpstream = {
                name: formData.name,
                "workspace-id": parseInt(formData["workspace-id"]),
                host: formData.host,
                port: parseInt(formData.port),
            };

            await createUpstream(newUpstream);
            toast.success("Upstream created successfully!");
            
            // Reset form
            setFormData({
                name: "",
                "workspace-id": "",
                host: "",
                port: "",
            });
            
            // Close modal
            setIsModalOpen(false);
            
            // Refresh the data
            const response = await fetchUpstreams(
                pagination.pageIndex + 1,
                pagination.pageSize
            );
            setData(response.data);
            setTotalPages(response.totalPages);
            setTotalRecords(response.total);
        } catch (error) {
            toast.error("Failed to create upstream");
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
                        <CardTitle className="text-2xl">Upstreams</CardTitle>
                        <CardDescription>
                            Upstreams let you group multiple backend targets under one virtual hostname, enabling dynamic load balancing, circuit breaking, and automatic health monitoring for resilient service routing.
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
                                    <DialogTitle>Create New Upstream</DialogTitle>
                                    <DialogDescription>
                                        Add a new upstream configuration. Fill in all the required fields.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter upstream name"
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
                                    <div className="grid gap-2">
                                        <Label htmlFor="host">Host</Label>
                                        <Input
                                            id="host"
                                            name="host"
                                            value={formData.host}
                                            onChange={handleInputChange}
                                            placeholder="e.g., api.example.com"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="port">Port</Label>
                                        <Input
                                            id="port"
                                            name="port"
                                            type="number"
                                            value={formData.port}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 8080"
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
                                        {isSaving ? "Creating..." : "Create Upstream"}
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
                                        onClick={() => router.push(`/upstreams/${row.original.id}`)}
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
