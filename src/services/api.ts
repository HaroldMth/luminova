import { CreateGiveawayData, JoinGiveawayData, Giveaway, User, Referral } from '../types';
import { storage } from '../utils/storage';
import { generateId, getRandomAnimeAvatar, generateReferralLink, getMockIpAddress, selectWinner, checkRateLimit, detectBotBehavior } from '../utils/helpers';
import { INTERNAL_TOKEN } from '../utils/constants';

class ApiService {
  private validateToken(token?: string): boolean {
    return token === INTERNAL_TOKEN;
  }

  async createGiveaway(data: CreateGiveawayData): Promise<Giveaway> {
    const giveaway: Giveaway = {
      id: generateId(),
      title: data.title,
      hostName: data.hostName,
      channelUrl: data.channelUrl,
      endDate: data.endDate,
      createdAt: new Date(),
      creatorId: generateId(),
      isEnded: false
    };

    storage.saveGiveaway(giveaway);
    return giveaway;
  }

  async getGiveaway(id: string): Promise<Giveaway | null> {
    const giveaways = await storage.getGiveaways();
    const giveaway = giveaways.find(g => g.id === id);
    
    if (!giveaway) return null;

    // Check if giveaway has ended and update status
    if (new Date() > giveaway.endDate && !giveaway.isEnded) {
      giveaway.isEnded = true;
      
      // Select winner if not already selected
      if (!giveaway.winner) {
        const users = storage.getUsersByGiveaway(id);
        const winner = selectWinner(users);
        if (winner) {
          giveaway.winner = winner;
        }
      }
      
      storage.saveGiveaway(giveaway);
    }

    return giveaway;
  }

  async joinGiveaway(giveawayId: string, data: JoinGiveawayData): Promise<User> {
    const giveaway = await this.getGiveaway(giveawayId);
    if (!giveaway) {
      throw new Error('Giveaway not found');
    }

    if (giveaway.isEnded) {
      throw new Error('Giveaway has ended');
    }

    const userId = generateId();
    const user: User = {
      id: userId,
      name: data.name,
      avatar: data.avatar ? URL.createObjectURL(data.avatar) : getRandomAnimeAvatar(),
      joinedAt: new Date(),
      giveawayId,
      referralCount: 0,
      referralLink: generateReferralLink(giveawayId, userId)
    };

    storage.saveUser(user);
    return user;
  }

  async trackReferral(giveawayId: string, referrerId: string, token?: string): Promise<{ success: boolean; redirectUrl: string }> {
    // Validate internal token for security
    if (!this.validateToken(token)) {
      throw new Error('Unauthorized');
    }

    const giveaway = await this.getGiveaway(giveawayId);
    if (!giveaway) {
      throw new Error('Giveaway not found');
    }

    const ipAddress = getMockIpAddress();
    const userAgent = navigator.userAgent;

    // Enhanced bot detection
    if (detectBotBehavior(userAgent, ipAddress)) {
      throw new Error('Bot activity detected');
    }

    // Enhanced rate limiting with DDoS protection
    const rateLimitResult = checkRateLimit(ipAddress);
    if (!rateLimitResult.allowed) {
      throw new Error(rateLimitResult.reason || 'Rate limit exceeded');
    }

    // Check if giveaway has ended
    if (giveaway.isEnded) {
      return {
        success: false,
        redirectUrl: `/winner/${giveawayId}`
      };
    }

    // Strict one referral per IP per giveaway
    const hasReferred = storage.hasReferredBefore(giveawayId, ipAddress);
    let isValid = !hasReferred;

    // Create referral record
    const referral: Referral = {
      id: generateId(),
      referrerId,
      giveawayId,
      ipAddress,
      timestamp: new Date(),
      isValid
    };

    storage.saveReferral(referral);

    // Increment referrer's count only if valid
    if (isValid) {
      const users = storage.getUsers();
      const referrer = users.find(u => u.id === referrerId);
      if (referrer) {
        referrer.referralCount++;
        storage.saveUser(referrer);
      }
    } else {
      // Log duplicate referral attempt
      storage.logSecurityEvent({
        type: 'DUPLICATE_REFERRAL',
        ipAddress,
        timestamp: new Date(),
        details: `IP already referred giveaway ${giveawayId}`
      });
    }

    return {
      success: isValid,
      redirectUrl: giveaway.channelUrl
    };
  }

  async getGiveawayUsers(giveawayId: string): Promise<User[]> {
    return storage.getUsersByGiveaway(giveawayId);
  }

  async getGiveawayReferrals(giveawayId: string): Promise<Referral[]> {
    return storage.getReferralsByGiveaway(giveawayId);
  }

  async deleteGiveaway(giveawayId: string, creatorId: string): Promise<void> {
    const giveaway = await this.getGiveaway(giveawayId);
    if (!giveaway) {
      throw new Error('Giveaway not found');
    }

    if (giveaway.creatorId !== creatorId) {
      throw new Error('Unauthorized');
    }

    storage.deleteGiveaway(giveawayId);
  }

  async getAllGiveaways(): Promise<Giveaway[]> {
    return storage.getGiveaways();
  }

  async getAllUsers(): Promise<User[]> {
    return storage.getUsers();
  }

  async getAllReferrals(): Promise<Referral[]> {
    return storage.getReferrals();
  }

  async getUser(userId: string): Promise<User | null> {
    const users = storage.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  // Admin-only methods
  async getAdminStats(token?: string) {
    if (!this.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    return storage.getAdminStats();
  }

  async getSecurityEvents(token?: string) {
    if (!this.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    return storage.getSecurityEvents();
  }

  async getActivityLogs(token?: string) {
    if (!this.validateToken(token)) {
      throw new Error('Unauthorized');
    }
    return storage.getActivityLogs();
  }
}

export const api = new ApiService();