export interface Giveaway {
  id: string;
  title: string;
  hostName: string;
  channelUrl: string;
  endDate: Date;
  createdAt: Date;
  creatorId: string;
  winner?: User;
  isEnded: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
  giveawayId: string;
  referralCount: number;
  referralLink: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  giveawayId: string;
  ipAddress: string;
  timestamp: Date;
  isValid: boolean;
}

export interface CreateGiveawayData {
  title: string;
  hostName: string;
  channelUrl: string;
  endDate: Date;
}

export interface JoinGiveawayData {
  name: string;
  avatar?: File;
}