// src/utils/storage.js

import { Giveaway, User, Referral } from '../types';

interface SecurityEvent {
  type: string;
  ipAddress: string;
  timestamp: Date;
  details: string;
}

interface ActivityLog {
  action: string;
  ipAddress: string;
  timestamp: Date;
  giveawayId?: string;
  userId?: string;
  details?: string;
}

const API = 'http://localhost:3000';

class APIStorage {
  private async get<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await fetch(`${API}/${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
    const data = await res.json();
    return data.map((item: any) => this.parseDates(endpoint, item));
  } catch (err) {
    console.error(`❌ API get(${endpoint}) error:`, err);
    throw err;
  }
}

  

  private async post<T>(endpoint: string, body: T): Promise<void> {
    await fetch(`${API}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  private async delete(endpoint: string): Promise<void> {
    await fetch(`${API}/${endpoint}`, {
      method: 'DELETE'
    });
  }

  private parseDates(type: string, obj: any): any {
  const parsed = { ...obj };
  if (type === 'giveaways') {
    if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    if (parsed.endDate) parsed.endDate = new Date(parsed.endDate);
  } else if (type === 'users') {
    if (parsed.joinedAt) parsed.joinedAt = new Date(parsed.joinedAt);
  } else if (type === 'referrals' || type === 'activity' || type === 'security') {
    if (parsed.timestamp) parsed.timestamp = new Date(parsed.timestamp);
  }
  return parsed;
}



  // Activity Logging
  async logActivity(activity: ActivityLog): Promise<void> {
    await this.post('activity', activity);
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    return this.get<ActivityLog>('activity');
  }

  async getRecentActivity(ipAddress: string): Promise<ActivityLog[]> {
    const logs = await this.getActivityLogs();
    const oneMinuteAgo = new Date(Date.now() - 60000);
    return logs.filter(log => log.ipAddress === ipAddress && log.timestamp > oneMinuteAgo);
  }

  // Security Events
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.post('security', event);
  }

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    return this.get<SecurityEvent>('security');
  }

  // Giveaways
  async getGiveaways(): Promise<Giveaway[]> {
    return this.get<Giveaway>('giveaways');
  }

  async saveGiveaway(giveaway: Giveaway): Promise<void> {
    await this.post('giveaways', giveaway);
    await this.logActivity({
      action: 'GIVEAWAY_SAVED',
      ipAddress: '127.0.0.1',
      giveawayId: giveaway.id,
      details: giveaway.title,
      timestamp: new Date()
    });
  }

  async deleteGiveaway(id: string): Promise<void> {
    await this.delete(`giveaways/${id}`);
    await this.logActivity({
      action: 'GIVEAWAY_DELETED',
      ipAddress: '127.0.0.1',
      giveawayId: id,
      timestamp: new Date()
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.get<User>('users');
  }

  async saveUser(user: User): Promise<void> {
    await this.post('users', user);
    await this.logActivity({
      action: 'USER_SAVED',
      ipAddress: '127.0.0.1',
      userId: user.id,
      giveawayId: user.giveawayId,
      details: user.name,
      timestamp: new Date()
    });
  }

  async getUsersByGiveaway(giveawayId: string): Promise<User[]> {
    const users = await this.getUsers();
    return users.filter(u => u.giveawayId === giveawayId);
  }

  // Referrals
  async getReferrals(): Promise<Referral[]> {
    return this.get<Referral>('referrals');
  }

  async saveReferral(referral: Referral): Promise<void> {
    await this.post('referrals', referral);
    await this.logActivity({
      action: 'REFERRAL_TRACKED',
      ipAddress: referral.ipAddress,
      userId: referral.referrerId,
      giveawayId: referral.giveawayId,
      details: `Valid: ${referral.isValid}`,
      timestamp: new Date()
    });
  }

 

  async getReferralsByGiveaway(giveawayId: string): Promise<Referral[]> {
    const referrals = await this.getReferrals();
    return referrals.filter(r => r.giveawayId === giveawayId);
  }

  async hasReferredBefore(giveawayId: string, ipAddress: string): Promise<boolean> {
    const referrals = await this.getReferrals();
    return referrals.some(r => r.giveawayId === giveawayId && r.ipAddress === ipAddress);
  }

  // Rate Limit
  async getRateLimitData(): Promise<{ [key: string]: { count: number; windowStart: number } }> {
    const res = await fetch(`${API}/rate-limit`);
    return res.json();
  }

  async setRateLimitData(data: { [key: string]: { count: number; windowStart: number } }): Promise<void> {
    await this.post('rate-limit', data);
  }
}

export const storage = new APIStorage();
