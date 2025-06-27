import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { api } from '../services/api';
import { Giveaway } from '../types';

export const BrowsePage: React.FC = () => {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGiveaways();
  }, []);

  const loadGiveaways = async () => {
    try {
      const allGiveaways = await api.getAllGiveaways();
      setGiveaways(allGiveaways);
    } catch (error) {
      console.error('Failed to load giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const activeGiveaways = giveaways.filter(g => !g.isEnded);
  const endedGiveaways = giveaways.filter(g => g.isEnded);

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Browse Giveaways
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover amazing giveaways and join the ones that interest you
        </p>
      </div>

      {/* Active Giveaways */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Active Giveaways</h2>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
            {activeGiveaways.length}
          </span>
        </div>

        {activeGiveaways.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGiveaways.map((giveaway, index) => (
              <motion.div
                key={giveaway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GiveawayCard giveaway={giveaway} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No active giveaways right now</p>
            <Link to="/">
              <Button className="mt-4">Create the First One</Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Ended Giveaways */}
      {endedGiveaways.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="w-6 h-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Ended Giveaways</h2>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
              {endedGiveaways.length}
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endedGiveaways.map((giveaway, index) => (
              <motion.div
                key={giveaway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <GiveawayCard giveaway={giveaway} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GiveawayCard: React.FC<{ giveaway: Giveaway }> = ({ giveaway }) => {
  return (
    <Card className="p-6" hover>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {giveaway.title}
          </h3>
          <p className="text-gray-600">by {giveaway.hostName}</p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Created: {giveaway.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Ends: {giveaway.endDate.toLocaleDateString()}</span>
          </div>
        </div>

        {!giveaway.isEnded ? (
          <CountdownTimer endDate={giveaway.endDate} />
        ) : (
          <div className="bg-gray-100 rounded-lg p-3 text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-sm text-gray-600">Giveaway Ended</div>
            {giveaway.winner && (
              <div className="text-sm font-medium text-gray-900">
                Winner: {giveaway.winner.name}
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <Link to={giveaway.isEnded ? `/winner/${giveaway.id}` : `/giveaway/${giveaway.id}`}>
            <Button className="w-full">
              {giveaway.isEnded ? 'View Winner' : 'Join Giveaway'}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};