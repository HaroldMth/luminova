import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Users, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { api } from '../services/api';
import { User, Giveaway } from '../types';

export const LeaderboardPage: React.FC = () => {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string>('all');
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    updateLeaderboard();
  }, [selectedGiveaway, giveaways]);

  const loadData = async () => {
    try {
      const allGiveaways = await api.getAllGiveaways();
      setGiveaways(allGiveaways);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeaderboard = async () => {
    if (selectedGiveaway === 'all') {
      // Get all users from all giveaways
      const allUsers: User[] = [];
      for (const giveaway of giveaways) {
        const users = await api.getGiveawayUsers(giveaway.id);
        allUsers.push(...users);
      }
      
      // Sort by referral count
      const sorted = allUsers.sort((a, b) => b.referralCount - a.referralCount);
      setTopUsers(sorted.slice(0, 50));
    } else {
      // Get users for specific giveaway
      const users = await api.getGiveawayUsers(selectedGiveaway);
      const sorted = users.sort((a, b) => b.referralCount - a.referralCount);
      setTopUsers(sorted);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Leaderboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          See who's leading the referral game across all giveaways
        </p>
      </div>

      {/* Giveaway Filter */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Giveaway:</label>
          <select
            value={selectedGiveaway}
            onChange={(e) => setSelectedGiveaway(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Giveaways</option>
            {giveaways.map((giveaway) => (
              <option key={giveaway.id} value={giveaway.id}>
                {giveaway.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Top 3 Podium */}
      {topUsers.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8">
            <div className="flex items-end justify-center space-x-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-r from-gray-400 to-gray-600 p-1">
                  <img
                    src={topUsers[1].avatar}
                    alt={topUsers[1].name}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900">{topUsers[1].name}</h3>
                <p className="text-sm text-gray-600">{topUsers[1].referralCount} referrals</p>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 p-1">
                  <img
                    src={topUsers[0].avatar}
                    alt={topUsers[0].name}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 text-lg">{topUsers[0].name}</h3>
                <p className="text-gray-600">{topUsers[0].referralCount} referrals</p>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 p-1">
                  <img
                    src={topUsers[2].avatar}
                    alt={topUsers[2].name}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900">{topUsers[2].name}</h3>
                <p className="text-sm text-gray-600">{topUsers[2].referralCount} referrals</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Trophy className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Full Rankings</h2>
        </div>

        {topUsers.length > 0 ? (
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`flex items-center space-x-4 p-4 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-purple-50 to-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>
                
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 p-0.5">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">
                    Joined {user.joinedAt.toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {user.referralCount}
                  </div>
                  <div className="text-sm text-gray-500">referrals</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No participants yet</p>
            <p className="text-gray-500">Be the first to join a giveaway!</p>
          </div>
        )}
      </Card>
    </div>
  );
};