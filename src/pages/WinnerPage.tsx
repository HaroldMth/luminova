import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, ExternalLink, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { Giveaway } from '../types';

export const WinnerPage: React.FC = () => {
  const { giveawayId } = useParams<{ giveawayId: string }>();
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGiveaway();
  }, [giveawayId]);

  const loadGiveaway = async () => {
    if (!giveawayId) return;

    try {
      const giveawayData = await api.getGiveaway(giveawayId);
      setGiveaway(giveawayData);
    } catch (error) {
      console.error('Failed to load giveaway:', error);
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

  if (!giveaway) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Giveaway not found</h1>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Giveaway Ended! 🎉
          </h1>
          <h2 className="text-xl text-gray-700 mb-8">{giveaway.title}</h2>

          {giveaway.winner ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Winner</h3>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 p-1">
                    <img
                      src={giveaway.winner.avatar}
                      alt={giveaway.winner.name}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900">{giveaway.winner.name}</div>
                    <div className="text-gray-600">{giveaway.winner.referralCount} referrals</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => window.open(giveaway.channelUrl, '_blank')}
                  size="lg"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Channel for Prize Details
                </Button>

                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Create Your Own Giveaway
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600">
                This giveaway has ended, but no winner was selected.
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => window.open(giveaway.channelUrl, '_blank')}
                  size="lg"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Channel
                </Button>
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Create Your Own Giveaway
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};