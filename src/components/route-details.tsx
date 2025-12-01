"use client";

import React, { useState, useEffect } from "react";
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
  Bug,
  Play,
  SkipForward,
  StopCircle,
  RefreshCw,
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
import {
  attachDebugger,
  sendNextBreakpoint,
  releaseDebugger,
  getDebugMessages,
  getSessionStatus,
  type DebugMessage,
} from "@/app/actions/debug-actions";

export default function RouteDetails(props: any) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debugger state
  const [isDebuggerAttached, setIsDebuggerAttached] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [debugMessages, setDebugMessages] = useState<DebugMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isWaitingForRequest, setIsWaitingForRequest] = useState(true);
  const [debugSessionEnded, setDebugSessionEnded] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const [originalData] = useState(props.details);
  const [formData, setFormData] = useState({ ...originalData });
  const [errors, setErrors] = useState({});

  // Polling for new messages
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollMessages = async () => {
      if (!isDebuggerAttached || debugSessionEnded) return;

      try {
        const response = await getDebugMessages(props.details.id);
        
        // Only update if we have new messages
        const hasNewMessages = response.messages.length > debugMessages.length;
        
        if (hasNewMessages) {
          setDebugMessages(response.messages);
          setIsWaitingForRequest(false);
          toast.info("Request intercepted at breakpoint");
        }

        // Check if session ended - auto release
        if (!response.isActive) {
          if (response.messages.length === 0 || response.messages.length === debugMessages.length) {
            // Session ended with no new messages - auto release
            await handleReleaseDebugger();
            toast.info("Debug session completed - debugger released");
          }
        }
      } catch (error) {
        console.error("Failed to poll messages:", error);
      }
    };

    if (isDebuggerAttached && !debugSessionEnded) {
      setIsPolling(true);
      // Poll every 500ms
      intervalId = setInterval(pollMessages, 500);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        setIsPolling(false);
      }
    };
  }, [isDebuggerAttached, debugSessionEnded, debugMessages.length, props.details.id]);

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

  // Debugger functions
  const handleAttachDebugger = async () => {
    setIsAttaching(true);
    setDebugMessages([]);
    setCurrentMessageIndex(0);
    setIsWaitingForRequest(true);
    setDebugSessionEnded(false);

    try {
      const result = await attachDebugger(props.details.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to attach debugger");
      }

      setIsDebuggerAttached(true);
      toast.success("Debugger attached successfully");
    } catch (err: any) {
      console.error("Failed to attach debugger:", err);
      toast.error(err.message || "Failed to attach debugger");
      setIsDebuggerAttached(false);
    } finally {
      setIsAttaching(false);
    }
  };

  const handleNextBreakpoint = async () => {
    if (debugSessionEnded) {
      toast.warning("Debug session has ended");
      return;
    }

    try {
      // First, send the "next" command to the server
      const result = await sendNextBreakpoint(props.details.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to move to next breakpoint");
      }

      // Wait a bit for the server to process and potentially receive a new message
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch the latest messages
      const messagesResponse = await getDebugMessages(props.details.id);
      
      // Update messages state
      setDebugMessages(messagesResponse.messages);

      // Check if we have a new message to show
      if (messagesResponse.messages.length > currentMessageIndex + 1) {
        // Move to the next message
        setCurrentMessageIndex((prev) => prev + 1);
        setIsWaitingForRequest(false);
        toast.info("Moved to next breakpoint");
      } else if (!messagesResponse.isActive) {
        // Session ended without new messages - auto release
        await handleReleaseDebugger();
        toast.info("Debug session completed - debugger released");
      } else {
        // Waiting for a new message
        handleReleaseDebugger()
        setIsWaitingForRequest(true);
        toast.info("Waiting for next request...");
      }
    } catch (err: any) {
      console.error("Failed to move to next breakpoint:", err);
      
      // Check if session has ended
      const status = await getSessionStatus(props.details.id);
      if (!status.isActive && status.messageCount > 0) {
        await handleReleaseDebugger();
        toast.info("Debug session completed - debugger released");
      } else {
        toast.error(err.message || "Failed to move to next breakpoint");
      }
    }
  };

  const handleReleaseDebugger = async () => {
    try {
      const result = await releaseDebugger(props.details.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to release debugger");
      }

      // Reset all state
      setIsDebuggerAttached(false);
      setDebugMessages([]);
      setCurrentMessageIndex(0);
      setIsWaitingForRequest(true);
      setDebugSessionEnded(false);
      setIsPolling(false);
      toast.success("Debugger released");
    } catch (err: any) {
      console.error("Failed to release debugger:", err);
      toast.error(err.message || "Failed to release debugger");
    }
  };

  const handleRefreshMessages = async () => {
    try {
      const response = await getDebugMessages(props.details.id);
      setDebugMessages(response.messages);
      
      if (!response.isActive && response.messages.length > 0) {
        setDebugSessionEnded(true);
      }
      
      toast.success("Messages refreshed");
    } catch (err: any) {
      console.error("Failed to refresh messages:", err);
      toast.error("Failed to refresh messages");
    }
  };

  const currentMessage = debugMessages[currentMessageIndex];

  return (
    <div className="w-full mx-auto space-y-6">
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

      {/* Debugger Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Bug className="h-6 w-6" />
                Route Debugger
                {isPolling && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Polling
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {isDebuggerAttached
                  ? `Debugger attached - ${debugMessages.length} message${debugMessages.length !== 1 ? 's' : ''} captured`
                  : "Attach debugger to intercept and inspect requests"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isDebuggerAttached ? (
                <Button
                  onClick={handleAttachDebugger}
                  disabled={isAttaching}
                  size="sm"
                >
                  {isAttaching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Attaching...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Attach
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleRefreshMessages}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleNextBreakpoint}
                    variant="outline"
                    size="sm"
                    disabled={debugSessionEnded}
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Next
                  </Button>
                  <Button
                    onClick={handleReleaseDebugger}
                    variant="destructive"
                    size="sm"
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    Release
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {isDebuggerAttached && (
          <CardContent className="space-y-4">
            {debugMessages.length > 0 && currentMessageIndex < debugMessages.length && currentMessage && (
              <>
                <div className="flex items-center justify-between">
                  <Label>Current Message ({currentMessageIndex + 1} of {debugMessages.length})</Label>
                  {debugMessages.length > 1 && (
                    <div className="text-xs text-gray-500">
                      Use "Next" to step through breakpoints
                    </div>
                  )}
                </div>
                <div className="border rounded-md p-4 bg-slate-50 font-mono text-sm space-y-3">
                  <div>
                    <span className="font-semibold text-blue-600">
                      {currentMessage.method}
                    </span>{" "}
                    <span className="text-green-600">{currentMessage.path}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 font-semibold">
                      HEADERS:
                    </div>
                    <div className="pl-2 text-xs max-h-40 overflow-auto">
                      {Object.entries(currentMessage.headers).map(
                        ([key, value]) => (
                          <div key={key}>
                            <span className="text-purple-600">{key}:</span>{" "}
                            <span className="text-gray-700">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {currentMessage.body && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-semibold">
                        BODY:
                      </div>
                      <pre className="pl-2 text-xs text-gray-700 overflow-auto max-h-40">
                        {currentMessage.body}
                      </pre>
                    </div>
                  )}

                  {currentMessage.notes && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 font-semibold">
                        NOTES:
                      </div>
                      <div className="pl-2 text-xs text-gray-700">
                        {currentMessage.notes}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {isWaitingForRequest && !debugSessionEnded ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-sm text-blue-700">
                  {debugMessages.length === 0 
                    ? "Waiting for first request..." 
                    : "Waiting for next request..."}
                </span>
              </div>
            ) : debugSessionEnded ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <span className="text-sm text-green-700">
                  Debug session completed - request finished processing
                </span>
              </div>
            ) : (
              debugMessages.length > 0 && currentMessageIndex < debugMessages.length && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <span className="text-sm text-yellow-700">
                    Paused at breakpoint - click "Next" to continue
                  </span>
                </div>
              )
            )}
          </CardContent>
        )}

        {!isDebuggerAttached && (
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Bug className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Attach the debugger to start intercepting requests</p>
              <p className="text-sm mt-2">
                The debugger will pause at each step of the request processing
              </p>
            </div>
          </CardContent>
        )}
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
