// src/app/actions/debug-actions.ts
'use server';

import DebugStreamManager from '@/lib/grpc/debug-stream-manager';

export interface DebugMessage {
  headers: Record<string, string>;
  method: string;
  body: string;
  path: string;
  notes: string;
}

export interface AttachDebuggerResponse {
  success: boolean;
  error?: string;
}

export interface NextBreakpointResponse {
  success: boolean;
  error?: string;
}

export interface ReleaseDebuggerResponse {
  success: boolean;
  error?: string;
}

export interface GetMessagesResponse {
  messages: DebugMessage[];
  isActive: boolean;
}

export interface SessionStatusResponse {
  exists: boolean;
  isActive: boolean;
  messageCount: number;
}

/**
 * Attach debugger to a route
 */
export async function attachDebugger(routeId: string): Promise<AttachDebuggerResponse> {
  const manager = DebugStreamManager.getInstance();
  return await manager.attachDebugger(routeId);
}

/**
 * Send "next" command to move to the next breakpoint
 */
export async function sendNextBreakpoint(routeId: string): Promise<NextBreakpointResponse> {
  const manager = DebugStreamManager.getInstance();
  return await manager.sendNext(routeId);
}

/**
 * Release the debugger and close the stream
 */
export async function releaseDebugger(routeId: string): Promise<ReleaseDebuggerResponse> {
  const manager = DebugStreamManager.getInstance();
  return manager.releaseDebugger(routeId);
}

/**
 * Get all messages received so far for a route
 */
export async function getDebugMessages(routeId: string): Promise<GetMessagesResponse> {
  const manager = DebugStreamManager.getInstance();
  const status = manager.getSessionStatus(routeId);
  const messages = manager.getMessages(routeId);
  
  return {
    messages,
    isActive: status.isActive,
  };
}

/**
 * Get the status of a debug session
 */
export async function getSessionStatus(routeId: string): Promise<SessionStatusResponse> {
  const manager = DebugStreamManager.getInstance();
  return manager.getSessionStatus(routeId);
}
