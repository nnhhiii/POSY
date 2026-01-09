import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import {
  Inject,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Server, Socket } from 'socket.io';
import { ActivityLog } from './types';
import { JwtPayload } from '../../authentication/interfaces';
import { TokenGeneratorsService } from '../../authentication/common/token-generators/token-generators.service';
import {
  AccessTokenHasExpiredException,
  InvalidAccessTokenException,
} from '../../authentication/exceptions';
import { Role } from '../../common/enums';
import { ActivityLogFilters } from './interfaces';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  filters?: ActivityLogFilters;
}

@WebSocketGateway({
  namespace: '/log',
  cors: {
    origin: '*', // TODO: Configure this properly in production
    credentials: true,
  },
})
export class ActivityLogGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly tokenGeneratorsService: TokenGeneratorsService,
  ) {}

  /**
   * Initializes the WebSocket gateway and sets up authentication middleware.
   *
   * This method is called when the gateway is initialized. It registers a Socket.IO middleware
   * that runs before each client connection is established. The middleware extracts and verifies
   * the JWT access token from the handshake auth or query parameters. If authentication fails,
   * the connection is rejected with an appropriate error message that the client will receive.
   *
   * @param {Server} server - The Socket.IO server instance.
   */
  afterInit(server: Server) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    server.use(async (socket: AuthenticatedSocket, next) => {
      try {
        // Extract token from handshake auth or query
        const token = (socket.handshake.auth?.token ||
          socket.handshake.query?.token) as string;

        if (!token) {
          this.logger.warn(
            `Client ${socket.id} attempted connection without token`,
          );
          return next(new Error('Access token is required'));
        }

        // Verify JWT token and extract user info
        const { userId, role } = await this.verifyToken(token);

        socket.userId = userId;
        socket.userRole = role;

        next();
      } catch (e) {
        if (e instanceof UnauthorizedException) {
          this.logger.warn(
            `Unauthorized connection attempt from client ${socket.id}: ${e.message}`,
          );
          return next(new Error(e.message));
        } else if (e instanceof InternalServerErrorException) {
          this.logger.error(
            `Error during connection for client ${socket.id}: ${e.message}`,
          );
          return next(new Error('Internal server error during authentication'));
        } else {
          this.logger.error(e);
          return next(new Error('Unexpected error during authentication'));
        }
      }
    });

    // this.logger.info(
    //   'Activity Log Gateway initialized with authentication middleware',
    // );
  }

  /**
   * Handles a new client WebSocket connection after successful authentication.
   *
   * This method is called automatically when a client successfully connects to the WebSocket gateway
   * after passing through the authentication middleware. At this point, the socket already has
   * userId and userRole attached. The client is joined to the appropriate room:
   * - Only ADMIN users are joined to the `admin-room` for privileged activity log monitoring.
   * - All other users are disconnected as they don't have permission to monitor logs.
   *
   * @param {AuthenticatedSocket} client - The authenticated WebSocket client socket.
   * @returns {Promise<void>} Resolves when the connection handling is complete.
   */
  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    const { userId, userRole } = client;

    // Only admins are allowed to monitor activity logs
    if (userRole === Role.ADMIN.toString()) {
      await client.join('admin-room');
      this.logger.debug(
        `Admin ${userId} connected: ${client.id}, joined admin-room`,
      );
    } else {
      // Non-admin users are not allowed to monitor activity logs
      this.logger.warn(
        `Non-admin user ${userId} attempted to connect to activity log gateway. Disconnecting.`,
      );
      client.emit('exception', {
        status: 'error',
        message: 'Only administrators are allowed to monitor activity logs',
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.warn(
      `Client disconnected: ${client.id}, userId: ${client.userId}`,
    );
  }

  /**
   * Emits a new activity log to all connected admin clients.
   *
   * This method sends the provided activity log to the 'admin-room', which is joined only by users
   * with the 'ADMIN' role. It applies any filters that clients have subscribed with, so each client
   * only receives logs that match their filter criteria.
   *
   * @param activityLog - The activity log entry to broadcast to admins.
   */
  emitLogToAdmins(activityLog: ActivityLog) {
    // Get all sockets in the admin room
    const adminRoom = this.server.in('admin-room');

    // Emit to each client individually, applying their filters
    void adminRoom.fetchSockets().then((sockets) => {
      sockets.forEach((socket) => {
        const authenticatedSocket = socket as unknown as AuthenticatedSocket;

        // If client has filters, check if the log matches
        if (authenticatedSocket.filters) {
          if (this.matchesFilters(activityLog, authenticatedSocket.filters)) {
            socket.emit('activity-log:created', activityLog);
          }
        } else {
          // No filters, send all logs
          socket.emit('activity-log:created', activityLog);
        }
      });
    });

    this.logger.debug(
      `Emitted activity log to admin room: ${activityLog.action}`,
    );
  }

  // emitLogToUser(userId: string, activityLog: ActivityLog) {
  //   this.server.to(`user:${userId}`).emit('activity-log:created', activityLog);
  //   this.logger.debug(`Emitted activity log to user ${userId}`);
  // }

  /**
   * Handles client subscription requests for filtered activity logs.
   *
   * This method is triggered when a client emits the 'activity-log:subscribe' event.
   * Only users with the 'ADMIN' role are allowed to subscribe to filtered logs.
   * The filters parameter can be used to specify criteria such as userId, action, entity, etc.
   *
   * @param client - The connected WebSocket client making the subscription request.
   * @param filters - An object containing filter criteria for activity logs.
   * @returns An object indicating subscription success.
   * @throws UnauthorizedException if the client is not an admin.
   */
  @SubscribeMessage('activity-log:subscribe')
  handleSubscribe(client: AuthenticatedSocket, filters: ActivityLogFilters) {
    const { userRole } = client;

    // Only admins can subscribe to filtered logs
    if (userRole !== Role.ADMIN.toString()) {
      throw new UnauthorizedException(
        'Only administrators are allowed to subscribe to activity logs',
      );
    }

    // Store filters in the client socket for later use
    client.filters = filters;

    this.logger.debug(
      `Client ${client.id} subscribed with filters: ${JSON.stringify(filters)}`,
    );

    return { success: true, message: 'Subscribed to activity logs' };
  }

  /**
   * Verifies the provided JWT access token and extracts user information.
   *
   * This method uses the TokenGeneratorsService to validate the JWT access token and extract
   * the user ID and role from the payload. If the token is invalid or expired, an UnauthorizedException
   * is thrown. If another error occurs during verification, an InternalServerErrorException is thrown.
   *
   * @param token - The JWT access token to verify.
   * @returns An object containing the userId and role extracted from the token payload.
   * @throws UnauthorizedException if the token is invalid or expired.
   * @throws InternalServerErrorException for other verification errors.
   */
  private async verifyToken(
    token: string,
  ): Promise<{ userId: string; role: string }> {
    try {
      const payload =
        await this.tokenGeneratorsService.verifyAccessToken<JwtPayload>(token);

      return { userId: payload.sub, role: payload.role };
    } catch (e) {
      if (
        e instanceof InvalidAccessTokenException ||
        e instanceof AccessTokenHasExpiredException
      ) {
        throw new UnauthorizedException(e.message);
      }
      this.logger.error(e);
      throw new InternalServerErrorException(
        'There was an error verifying token',
      );
    }
  }

  /**
   * Checks if an activity log matches the provided filter criteria.
   *
   * This method evaluates each filter property and returns true only if all filter
   * conditions are met. If a filter property is not set, it is ignored.
   *
   * @param log - The activity log to check.
   * @param filters - The filter criteria to apply.
   * @returns True if the log matches all filters, false otherwise.
   */
  private matchesFilters(
    log: ActivityLog,
    filters: ActivityLogFilters,
  ): boolean {
    // Check userId filter
    if (filters.userId && log.userId !== filters.userId) {
      return false;
    }

    // Check action filter
    if (filters.action && log.action !== filters.action) {
      return false;
    }

    // Check entity filter
    if (filters.entity && log.entity !== filters.entity) {
      return false;
    }

    // Check entityId filter
    if (filters.entityId && log.entityId !== filters.entityId) {
      return false;
    }

    // Check date range filters
    if (filters.startDate && log.createdAt) {
      if (new Date(log.createdAt) < new Date(filters.startDate)) {
        return false;
      }
    }

    if (filters.endDate && log.createdAt) {
      if (new Date(log.createdAt) > new Date(filters.endDate)) {
        return false;
      }
    }

    // All filters passed
    return true;
  }
}
