import { ANIME_AVATARS, SUSPICIOUS_USER_AGENTS, RATE_LIMIT } from './constants';
import { storage } from './storage';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getRandomAnimeAvatar(): string {
  return ANIME_AVATARS[Math.floor(Math.random() * ANIME_AVATARS.length)];
}

export function generateReferralLink(giveawayId: string, userId: string): string {
  return `${window.location.origin}/g/${giveawayId}?ref=${userId}`;
}

export function getMockIpAddress(): string {
  // In a real app, this would be the actual IP address from the server
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export function isSuspiciousUserAgent(userAgent: string): boolean {
  return SUSPICIOUS_USER_AGENTS.some(agent => 
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );
}

export function checkRateLimit(ipAddress: string): { allowed: boolean; reason?: string } {
  const rateLimitData = storage.getRateLimitData();
  const now = Date.now();
  
  // Check for DDoS patterns
  const ddosKey = `ddos_${ipAddress}`;
  const ddosData = rateLimitData[ddosKey];
  
  if (ddosData) {
    if (now - ddosData.windowStart < RATE_LIMIT.ddosWindowMs) {
      if (ddosData.count >= RATE_LIMIT.ddosMaxRequests) {
        // Log DDoS attempt
        storage.logSecurityEvent({
          type: 'DDOS_ATTEMPT',
          ipAddress,
          timestamp: new Date(),
          details: `${ddosData.count} requests in ${RATE_LIMIT.ddosWindowMs}ms`
        });
        return { allowed: false, reason: 'DDoS protection triggered' };
      }
      ddosData.count++;
    } else {
      rateLimitData[ddosKey] = { count: 1, windowStart: now };
    }
  } else {
    rateLimitData[ddosKey] = { count: 1, windowStart: now };
  }
  
  // Regular rate limiting
  const regularKey = ipAddress;
  const regularData = rateLimitData[regularKey];
  
  if (regularData) {
    if (now - regularData.windowStart < RATE_LIMIT.windowMs) {
      if (regularData.count >= RATE_LIMIT.maxRequests) {
        storage.logSecurityEvent({
          type: 'RATE_LIMIT_EXCEEDED',
          ipAddress,
          timestamp: new Date(),
          details: `${regularData.count} requests in ${RATE_LIMIT.windowMs}ms`
        });
        return { allowed: false, reason: 'Rate limit exceeded' };
      }
      regularData.count++;
    } else {
      rateLimitData[regularKey] = { count: 1, windowStart: now };
    }
  } else {
    rateLimitData[regularKey] = { count: 1, windowStart: now };
  }
  
  storage.setRateLimitData(rateLimitData);
  return { allowed: true };
}

export function selectWinner(users: any[]): any {
  if (users.length === 0) return null;
  
  // Weight selection by referral count
  const weightedUsers = users.flatMap(user => 
    Array(Math.max(1, user.referralCount)).fill(user)
  );
  
  const randomIndex = Math.floor(Math.random() * weightedUsers.length);
  return weightedUsers[randomIndex];
}

export function formatTimeLeft(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return "Ended";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function detectBotBehavior(userAgent: string, ipAddress: string): boolean {
  // Check user agent
  if (isSuspiciousUserAgent(userAgent)) {
    storage.logSecurityEvent({
      type: 'SUSPICIOUS_USER_AGENT',
      ipAddress,
      timestamp: new Date(),
      details: userAgent
    });
    return true;
  }
  
  // Check for rapid requests from same IP
  const recentActivity = storage.getRecentActivity(ipAddress);
  if (recentActivity.length > 5) { // More than 5 actions in recent history
    const timeSpan = recentActivity[0].timestamp.getTime() - recentActivity[recentActivity.length - 1].timestamp.getTime();
    if (timeSpan < 10000) { // Less than 10 seconds
      storage.logSecurityEvent({
        type: 'RAPID_REQUESTS',
        ipAddress,
        timestamp: new Date(),
        details: `${recentActivity.length} requests in ${timeSpan}ms`
      });
      return true;
    }
  }
  
  return false;
}