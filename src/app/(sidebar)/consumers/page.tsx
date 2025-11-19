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
import { Plus, Copy, Check } from "lucide-react";

type Consumer = {
    id: number;
    name: string;
    "api-key": string;
}

type PaginatedResponse = {
    data: Consumer[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

const columns: ColumnDef<Consumer>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
]

const fetchConsumers = async (page: number, pageSize: number): Promise<PaginatedResponse> => {
    const { data } = await axios.get(`http://localhost:9999/consumers?page=${page}&pageSize=${pageSize}`, {
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

const createConsumer = async (consumer: { name: string }): Promise<Consumer> => {
    console.log(consumer)
    const { data } = await axios.post(`http://localhost:9999/consumers`, consumer, {
        headers: {
            Authorization: `Bearer ${"123"}`,
            'Content-Type': 'application/json'
        }
    });
    return data;
}

export default function ConsumersPage() {
    const [data, setData] = useState<Consumer[]>([]);
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
    });
    const [newApiKey, setNewApiKey] = useState<string | null>(null);

    const router = useRouter();

    // Fetch data when pagination changes
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const response = await fetchConsumers(
                    pagination.pageIndex + 1,
                    pagination.pageSize
                );
                setData(response.data);
                setTotalPages(response.totalPages);
                setTotalRecords(response.total);
            } catch (error) {
                toast.error("Failed to fetch consumers")
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

    const handleCopyApiKey = async () => {
        if (newApiKey) {
            await navigator.clipboard.writeText(newApiKey);
            toast.success("API key copied to clipboard!");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const result = await createConsumer({ name: formData.name });
            setNewApiKey(result["api-key"]);
            toast.success("Consumer created successfully!");
            
            // Refresh the data
            const response = await fetchConsumers(
                pagination.pageIndex + 1,
                pagination.pageSize
            );
            setData(response.data);
            setTotalPages(response.totalPages);
            setTotalRecords(response.total);
        } catch (error) {
            toast.error("Failed to create consumer");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setNewApiKey(null);
        setFormData({ name: "" });
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
                        <CardTitle className="text-2xl">Consumers</CardTitle>
                        <CardDescription>
                            Consumers represent API clients or applications that access your services. Each consumer receives a unique API key for authentication and request tracking.
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
                            {!newApiKey ? (
                                <form onSubmit={handleSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>Create New Consumer</DialogTitle>
                                        <DialogDescription>
                                            Add a new consumer to the system. An API key will be automatically generated.
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
                                                placeholder="Enter consumer name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCloseModal}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSaving}>
                                            {isSaving ? "Creating..." : "Create Consumer"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : (
                                <div>
                                    <DialogHeader>
                                        <DialogTitle>Consumer Created Successfully!</DialogTitle>
                                        <DialogDescription>
                                            Save this API key securely. You won't be able to see it again.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>API Key</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newApiKey}
                                                    readOnly
                                                    className="font-mono text-sm"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCopyApiKey}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                                            <p className="text-sm text-amber-800">
                                                <strong>Important:</strong> Make sure to copy your API key now. You won't be able to see it again!
                                            </p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCloseModal}>
                                            Done
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
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
                                        onClick={() => router.push(`/consumers/${row.original.id}`)}
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
