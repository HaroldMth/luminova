import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Globe, User, Share2, Trophy, Copy, QrCode, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { CountdownTimer } from '../components/ui/CountdownTimer';
import { QRCode } from '../components/ui/QRCode';
import { api } from '../services/api';
import { Giveaway, User as UserType, JoinGiveawayData } from '../types';
import { LUMIVORA_CHANNEL } from '../utils/constants';

export const GiveawayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [joinData, setJoinData] = useState<JoinGiveawayData>({
    name: '',
    avatar: undefined
  });

  useEffect(() => {
    loadGiveaway();
  }, [id]);

  const loadGiveaway = async () => {
    if (!id) return;
    
    try {
      const giveawayData = await api.getGiveaway(id);
      setGiveaway(giveawayData);
      
      // Check if user is already joined
      const existingUser = localStorage.getItem(`user_${id}`);
      if (existingUser) {
        const userData = JSON.parse(existingUser);
        const currentUser = await api.getUser(userData.id);
        setUser(currentUser);
      }
    } catch (error) {
      toast.error('Failed to load giveaway');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giveaway || !joinData.name.trim()) return;

    setJoinLoading(true);
    try {
      const newUser = await api.joinGiveaway(giveaway.id, joinData);
      setUser(newUser);
      localStorage.setItem(`user_${giveaway.id}`, JSON.stringify({ id: newUser.id }));
      toast.success('Successfully joined the giveaway!');
      
      // Prompt to join Lumivora channel
      setTimeout(() => {
        toast.success('Don\'t forget to join our HANS TECH channel for updates!', {
          duration: 5000,
        });
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join giveaway');
    } finally {
      setJoinLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (user) {
      navigator.clipboard.writeText(user.referralLink);
      toast.success('Referral link copied!');
    }
  };

  const shareReferralLink = () => {
    if (user && navigator.share) {
      navigator.share({
        title: `Join ${giveaway?.title} Giveaway`,
        text: `Join this amazing giveaway hosted by ${giveaway?.hostName}!`,
        url: user.referralLink
      });
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
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Giveaway Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {giveaway.title}
            </h1>
            <p className="text-lg text-gray-600">Hosted by {giveaway.hostName}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Ends: {giveaway.endDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Globe className="w-5 h-5" />
                <span>Channel: {new URL(giveaway.channelUrl).hostname}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-5 h-5" />
                <span>Created: {giveaway.createdAt.toLocaleDateString()}</span>
              </div>
            </div>

            <CountdownTimer
              endDate={giveaway.endDate}
              onEnd={() => setGiveaway(prev => prev ? { ...prev, isEnded: true } : null)}
            />
          </div>
        </Card>
      </motion.div>

      {/* Join Form or User Dashboard */}
      {!user ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join the Giveaway</h2>
              <p className="text-gray-600">Enter your details to participate and get your referral link</p>
            </div>

            <form onSubmit={handleJoin} className="max-w-md mx-auto space-y-6">
              <Input
                label="Your Name"
                placeholder="Enter your name"
                value={joinData.name}
                onChange={(e) => setJoinData(prev => ({ ...prev, name: e.target.value }))}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setJoinData(prev => ({ ...prev, avatar: e.target.files?.[0] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  If not provided, we'll assign you a random anime avatar
                </p>
              </div>

              <Button type="submit" size="lg" loading={joinLoading} className="w-full">
                Join Giveaway
              </Button>
            </form>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                <strong>Important:</strong> Please join our{' '}
                <a
                  href={LUMIVORA_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 underline"
                >
                  WhatsApp Channel
                </a>{' '}
                to stay updated with giveaway announcements!
              </p>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* User Profile */}
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-r from-purple-600 to-blue-600 p-1">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">Joined {user.joinedAt.toLocaleDateString()}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">{user.referralCount}</div>
              <div className="text-sm text-purple-600">Successful Referrals</div>
            </div>
          </Card>

          {/* Referral Tools */}
          <Card className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Share & Earn</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Referral Link
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={user.referralLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={copyReferralLink}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={shareReferralLink} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
                <Button variant="outline" onClick={() => setShowQR(!showQR)}>
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>

              {showQR && (
                <div className="text-center">
                  <QRCode value={user.referralLink} size={150} className="mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Scan to join via your referral</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <a
                  href={giveaway.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 text-purple-600 hover:text-purple-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Giveaway Channel</span>
                </a>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Winner Display */}
      {giveaway.isEnded && giveaway.winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎉 Winner Announced! 🎉</h2>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 p-1">
                <img
                  src={giveaway.winner.avatar}
                  alt={giveaway.winner.name}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{giveaway.winner.name}</h3>
                <p className="text-gray-600">{giveaway.winner.referralCount} referrals</p>
              </div>
            </div>

            <Button 
              onClick={() => window.open(giveaway.channelUrl, '_blank')}
              size="lg"
            >
              Visit Channel for Prize Details
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
};