import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Globe, User, Gift, Sparkles, Users, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { api } from '../services/api';
import { CreateGiveawayData } from '../types';
import { isValidUrl } from '../utils/helpers';

export const HomePage: React.FC = () => {
  const toLocalDatetime = (date: Date) => {
  if (!date) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateGiveawayData>({
    title: '',
    hostName: '',
    channelUrl: '',
    endDate: new Date()
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [realStats, setRealStats] = useState({
    activeGiveaways: 0,
    totalParticipants: 0,
    totalReferrals: 0,
    endedGiveaways: 0
  });

  useEffect(() => {
    loadRealStats();
  }, []);

  const loadRealStats = async () => {
    try {
      const giveaways = await api.getAllGiveaways();
      const users = await api.getAllUsers();
      const referrals = await api.getAllReferrals();

      setRealStats({
        activeGiveaways: giveaways.filter(g => !g.isEnded).length,
        totalParticipants: users.length,
        totalReferrals: referrals.filter(r => r.isValid).length,
        endedGiveaways: giveaways.filter(g => g.isEnded).length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.hostName.trim()) newErrors.hostName = 'Host name is required';
    if (!formData.channelUrl.trim()) newErrors.channelUrl = 'Channel URL is required';
    else if (!isValidUrl(formData.channelUrl)) newErrors.channelUrl = 'Invalid URL format';
    if (new Date(formData.endDate) <= new Date()) newErrors.endDate = 'End date must be in the future';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const giveaway = await api.createGiveaway(formData);
      toast.success('Giveaway created successfully!');
      navigate(`/giveaway/${giveaway.id}`);
    } catch (error) {
      toast.error('Failed to create giveaway');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateGiveawayData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const stats = [
    { icon: Gift, label: 'Active Giveaways', value: realStats.activeGiveaways },
    { icon: Users, label: 'Total Participants', value: realStats.totalParticipants },
    { icon: Trophy, label: 'Ended Giveaways', value: realStats.endedGiveaways },
    { icon: Sparkles, label: 'Valid Referrals', value: realStats.totalReferrals }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Create Amazing Giveaways
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build engagement with referral-based giveaways. Create, share, and watch your community grow with LUMIVORA's powerful platform.
          </p>
        </motion.div>

        {/* Real Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 text-center" hover>
                <Icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            );
          })}
        </motion.div>
      </div>

      {/* Create Giveaway Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="max-w-2xl mx-auto p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Giveaway</h2>
            <p className="text-gray-600">Set up a new giveaway and start building your community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Giveaway Title"
              placeholder="Enter giveaway title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={errors.title}
            />

            <Input
              label="Host Name"
              placeholder="Your name or brand"
              value={formData.hostName}
              onChange={(e) => handleInputChange('hostName', e.target.value)}
              error={errors.hostName}
            />

            <Input
              label="Channel URL"
              placeholder="https://whatsapp.com/channel/... or https://t.me/..."
              value={formData.channelUrl}
              onChange={(e) => handleInputChange('channelUrl', e.target.value)}
              error={errors.channelUrl}
              helperText="Participants will be redirected here when they click referral links"
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              value={formData.endDate ? toLocalDatetime(new Date(formData.endDate)) : ''}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              error={errors.endDate}
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Create Giveaway
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center space-y-12"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LUMIVORA?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to maximize engagement and grow your community
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Referral System',
              description: 'Participants get unique referral links to invite friends and earn more chances to win'
            },
            {
              icon: Trophy,
              title: 'Fair Winner Selection',
              description: 'Winners are selected fairly with weighted chances based on referral performance'
            },
            {
              icon: Sparkles,
              title: 'Anti-Fraud Protection',
              description: 'Built-in bot protection and IP-based tracking to prevent fraudulent activities'
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-8 text-center" hover>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};