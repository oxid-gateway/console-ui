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
import { Switch } from "./ui/switch";

export default function RouteDetails(props: any) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [originalData] = useState(props.details);

  const [formData, setFormData] = useState({ ...originalData });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.path.trim()) {
      newErrors.path = "Path is required";
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
        await axios.put(
          `http://localhost:9999/routes/${props.details.id}`,
          {
            path: formData.path,
            private: formData.private,
          },
          {
            headers: {
              Authorization: `Bearer ${"123"}`,
            },
          }
        );

        setIsEditing(false);
        toast.success("Route edited");
      } catch (err: any) {
        console.log(err);
        toast.error("Failed to edit route");
      }
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:9999/routes/${props.details.id}`, {
        headers: {
          Authorization: `Bearer ${"123"}`,
        },
      });

      setIsDeleting(false);
      setShowDeleteConfirm(false);
      toast.success("Route deleted");
      router.push("/routes");
    } catch (err: any) {
      console.log(err);
      toast.error("Failed to delete route");
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Route Details</CardTitle>
              <CardDescription>
                View and manage route configuration
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
              <Input
                id="id"
                value={formData.id}
                disabled
                className="bg-gray-100"
              />
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
            <Label htmlFor="upstreamId">Upstream ID</Label>
            <Input
              id="upstreamId"
              value={formData["upstream-id"]}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">
              Path <span className="text-red-500">*</span>
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={(e) => handleChange("path", e.target.value)}
                  placeholder="/api/v1/users"
                  className={errors.path ? "border-red-500" : ""}
                />
                {errors.path && (
                  <p className="text-sm text-red-500">{errors.path}</p>
                )}
              </>
            ) : (
              <div className="px-3 py-2 border rounded-md font-mono text-sm">
                {formData.path}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="private">Private</Label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={formData.private}
                  onCheckedChange={(checked) =>
                    handleChange("private", checked as boolean)
                  }
                />
                <label
                  htmlFor="private"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Route requires authentication
                </label>
              </div>
            ) : (
              <div className="px-3 py-2 border rounded-md">
                {formData.private ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Private
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                )}
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
              Are you sure you want to delete the route{" "}
              <strong>{formData.path}</strong>? This action cannot be undone.
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
