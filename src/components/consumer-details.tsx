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
  Copy,
  Eye,
  EyeOff,
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

export default function ConsumerDetails(props: any) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [originalData] = useState(props.details);

  const [formData, setFormData] = useState({ ...originalData });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
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
          `http://localhost:9999/consumers/${props.details.id}`,
          {
            name: formData.name,
          },
          {
            headers: {
              Authorization: `Bearer ${"123"}`,
            },
          }
        );

        setIsEditing(false);
        toast.success("Consumer edited");
      } catch (err: any) {
        console.log(err);
        toast.error("Failed to edit consumer");
      }
    }
  };

  const handleChange = (field: string, value: string) => {
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
      await axios.delete(`http://localhost:9999/consumers/${props.details.id}`, {
        headers: {
          Authorization: `Bearer ${"123"}`,
        },
      });

      setIsDeleting(false);
      setShowDeleteConfirm(false);
      toast.success("Consumer deleted");
      router.push("/consumers");
    } catch (err: any) {
      console.log(err);
      toast.error("Failed to delete consumer");
      setIsDeleting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("API Key copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy API Key");
    }
  };

  const maskApiKey = (apiKey: string) => {
    if (!apiKey) return "";
    const visibleChars = 8;
    if (apiKey.length <= visibleChars) return apiKey;
    return apiKey.substring(0, visibleChars) + "•".repeat(apiKey.length - visibleChars);
  };

  return (
    <div className="w-full mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Consumer Details</CardTitle>
              <CardDescription>
                View and manage consumer configuration
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
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter consumer name"
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
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apiKey"
                  value={showApiKey ? formData["api-key"] : maskApiKey(formData["api-key"])}
                  disabled
                  className="bg-gray-100 font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(formData["api-key"])}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              This API key is used to authenticate requests for this consumer
            </p>
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
              Are you sure you want to delete the consumer{" "}
              <strong>{formData.name}</strong>? This action cannot be undone and
              will revoke their API access.
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
