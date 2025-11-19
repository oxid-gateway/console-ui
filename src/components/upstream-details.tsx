"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pencil,
  Save,
  X,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";

export default function UpstreamDetails(props: any) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [originalData] = useState(props.details);

  const [formData, setFormData] = useState({ ...originalData });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.host.trim()) {
      newErrors.host = "Host is required";
    }

    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      newErrors.port = "Port must be between 1 and 65535";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...originalData });
    setIsEditing(false);
    setErrors({});
  };

  const handleSave = async () => {
    if (validate()) {
      console.log("Saving:", formData);
    try {
        await axios.put(`http://localhost:9999/upstreams/${props.details.id}`, {...formData, "id": undefined, "workspace-id": undefined},{
            headers: {
                Authorization: `Bearer ${"123"}`
            }
        });

      setIsEditing(false);
      toast.success("Upstream edited");
    } catch (err: any) {
        console.log(err)
      toast.error("Failed to edit upstream")
      setIsDeleting(false);
    }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "port" ? parseInt(value) || "" : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {

        await axios.delete(`http://localhost:9999/upstreams/${props.details.id}`, {
            headers: {
                Authorization: `Bearer ${"123"}`
            }
        });

      setIsDeleting(false);
      setShowDeleteConfirm(false);
      toast.success("Upstream deleted");
      router.push("/upstreams");
    } catch (err: any) {
        console.log(err)
      toast.error("Failed to delete upstream")
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Upstream Details</CardTitle>
              <CardDescription>
                View and manage upstream configuration
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input id="id" value={formData.id} disabled className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspaceId">Workspace ID</Label>
              <Input
                id="workspaceId"
                value={formData["workspace-id"]}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter upstream name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </>
            ) : (
              <div className="px-3 py-2 border rounded-md">
                {formData.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="host">
              Host <span className="text-red-500">*</span>
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => handleChange("host", e.target.value)}
                  placeholder="api.example.com"
                  className={errors.host ? "border-red-500" : ""}
                />
                {errors.host && (
                  <p className="text-sm text-red-500">{errors.host}</p>
                )}
              </>
            ) : (
              <div className="px-3 py-2 border rounded-md font-mono text-sm">
                {formData.host}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">
              Port <span className="text-red-500">*</span>
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="port"
                  type="number"
                  min="1"
                  max="65535"
                  value={formData.port}
                  onChange={(e) => handleChange("port", e.target.value)}
                  placeholder="8080"
                  className={errors.port ? "border-red-500" : ""}
                />
                {errors.port && (
                  <p className="text-sm text-red-500">{errors.port}</p>
                )}
              </>
            ) : (
              <div className="px-3 py-2 border rounded-md font-mono text-sm">
                {formData.port}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Required fields
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the upstream{" "}
              <strong>{formData.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
