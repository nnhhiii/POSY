import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import geoip from 'geoip-lite';

@Injectable()
export class DeviceContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract device information from User-Agent header
    req['device'] = req.headers['user-agent'] ?? 'Unknown device';

    // Determine geographic location using GeoIP lookup based on request IP
    // If lookup fails, fall back to displaying the IP address itself
    if (req.ip) {
      const geo = geoip.lookup(req.ip);
      req['location'] =
        geo && geo.city && geo.country ? `${geo.city}, ${geo.country}` : req.ip;
    } else {
      req['location'] = 'Unknown location';
    }

    // Format current date/time according to user's locale preference
    // Uses UTC timezone for consistency across different server locations
    req['date'] = new Date().toLocaleString('vi-VN', { timeZone: 'UTC' });

    // Continue to next middleware or route handler
    next();
  }
}
