// src/lib/grpc/debug-stream-manager.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

interface DebugMessage {
  headers: Record<string, string>;
  method: string;
  body: string;
  path: string;
  notes: string;
}

interface StreamSession {
  stream: grpc.ClientDuplexStream<any, any>;
  messages: DebugMessage[];
  isActive: boolean;
}

class DebugStreamManager {
  private static instance: DebugStreamManager;
  private sessions: Map<string, StreamSession> = new Map();
  private client: any;

  private constructor() {
    // Load the proto file
    const PROTO_PATH = path.join(process.cwd(), 'proto', 'proxy.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
    
    // Create gRPC client
    this.client = new protoDescriptor.proxy.ProxyService(
      'localhost:6189', // Your gRPC server address
      grpc.credentials.createInsecure()
    );
  }

  static getInstance(): DebugStreamManager {
    if (!DebugStreamManager.instance) {
      DebugStreamManager.instance = new DebugStreamManager();
    }
    return DebugStreamManager.instance;
  }

  async attachDebugger(routeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if session already exists
      if (this.sessions.has(routeId)) {
        const existingSession = this.sessions.get(routeId);
        if (existingSession?.isActive) {
          return { success: false, error: 'Debugger already attached to this route' };
        }
        // Clean up old session
        this.releaseDebugger(routeId);
      }

      // Create bidirectional stream
      const stream = this.client.DebugProxy();

      const session: StreamSession = {
        stream,
        messages: [],
        isActive: true,
      };

      // Set up stream event handlers
      stream.on('data', (response: any) => {
        const message: DebugMessage = {
          headers: response.headers || {},
          method: response.method || '',
          body: response.body || '',
          path: response.path || '',
          notes: response.notes || '',
        };

        session.messages.push(message);
        console.log(`[Debug ${routeId}] Received message:`, message);
      });

      stream.on('error', (error: Error) => {
        console.error(`[Debug ${routeId}] Stream error:`, error);
        session.isActive = false;
      });

      stream.on('end', () => {
        console.log(`[Debug ${routeId}] Stream ended`);
        session.isActive = false;
      });

      // Store the session
      this.sessions.set(routeId, session);

      // Send initial request with route ID
      stream.write({ id: routeId });

      return { success: true };
    } catch (error) {
      console.error('Failed to attach debugger:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendNext(routeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const session = this.sessions.get(routeId);

      if (!session) {
        return { success: false, error: 'No active debug session found' };
      }

      if (!session.isActive) {
        return { success: false, error: 'Debug session has ended' };
      }

      // Send next request
      session.stream.write({ id: routeId });

      return { success: true };
    } catch (error) {
      console.error('Failed to send next:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  releaseDebugger(routeId: string): { success: boolean; error?: string } {
    try {
      const session = this.sessions.get(routeId);

      if (!session) {
        return { success: false, error: 'No active debug session found' };
      }

      // End the stream
      session.stream.end();
      session.isActive = false;

      // Remove from sessions
      this.sessions.delete(routeId);

      return { success: true };
    } catch (error) {
      console.error('Failed to release debugger:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  getMessages(routeId: string): DebugMessage[] {
    const session = this.sessions.get(routeId);
    return session?.messages || [];
  }

  getSessionStatus(routeId: string): { 
    exists: boolean; 
    isActive: boolean; 
    messageCount: number 
  } {
    const session = this.sessions.get(routeId);
    
    if (!session) {
      return { exists: false, isActive: false, messageCount: 0 };
    }

    return {
      exists: true,
      isActive: session.isActive,
      messageCount: session.messages.length,
    };
  }
}

export default DebugStreamManager;
