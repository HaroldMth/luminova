import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Users, Gift, Trophy, Trash2, Eye, Calendar, TrendingUp, Shield, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import { Giveaway, User, Referral } from '../types';
import { ADMIN_SECRET_PATH, INTERNAL_TOKEN } from '../utils/constants';

export const AdminPage: React.FC = () => {
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string>('');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'giveaways' | 'security' | 'logs'>('overview');

  useEffect(() => {
    // Check if accessing via secret path
    if (location.pathname.includes(ADMIN_SECRET_PATH)) {
      setIsAuthorized(true);
      loadData();
    } else {
      // Redirect to home if not authorized
      window.location.href = '/';
    }
  }, [location]);

  useEffect(() => {
    if (selectedGiveaway && isAuthorized) {
      loadGiveawayData();
    }
  }, [selectedGiveaway]);

  const loadData = async () => {
    try {
      const allGiveaways = await api.getAllGiveaways();
      setGiveaways(allGiveaways);
      
      const allUsers = await api.getAllUsers();
      setUsers(allUsers);
      
      const allReferrals = await api.getAllReferrals();
      setReferrals(allReferrals);

      // Load admin-specific data
      const stats = await api.getAdminStats(INTERNAL_TOKEN);
      setAdminStats(stats);

      const events = await api.getSecurityEvents(INTERNAL_TOKEN);
      setSecurityEvents(events);

      const logs = await api.getActivityLogs(INTERNAL_TOKEN);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadGiveawayData = async () => {
    if (!selectedGiveaway) return;
    
    const giveawayUsers = await api.getGiveawayUsers(selectedGiveaway);
    const giveawayReferrals = await api.getGiveawayReferrals(selectedGiveaway);
    
    setUsers(giveawayUsers);
    setReferrals(giveawayReferrals);
  };

  const handleDeleteGiveaway = async (giveaway: Giveaway) => {
    if (!confirm(`Are you sure you want to delete "${giveaway.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteGiveaway(giveaway.id, giveaway.creatorId);
      toast.success('Giveaway deleted successfully');
      loadData();
    } catch (error) {
      toast.error('Failed to delete giveaway');
    }
  };

  if (!isAuthorized || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const stats = adminStats ? {
    totalGiveaways: adminStats.giveaways.total,
    activeGiveaways: adminStats.giveaways.active,
    totalUsers: selectedGiveaway ? users.length : adminStats.users.total,
    totalReferrals: selectedGiveaway ? referrals.length : adminStats.referrals.total,
    validReferrals: selectedGiveaway ? referrals.filter(r => r.isValid).length : adminStats.referrals.valid,
    securityEvents: adminStats.security.totalEvents,
    recentActivity: adminStats.activity.recentActivity
  } : {
    totalGiveaways: 0,
    activeGiveaways: 0,
    totalUsers: 0,
    totalReferrals: 0,
    validReferrals: 0,
    securityEvents: 0,
    recentActivity: 0
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent mb-4">
          🔒 HANS TECH ADMIN DASHBOARD
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Complete system monitoring and management
        </p>
      </div>

      {/* Tab Navigation */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart },
            { id: 'giveaways', label: 'Giveaways', icon: Gift },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'logs', label: 'Activity Logs', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Filter */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <label className="text-sm font-medium text-gray-700">View Data For:</label>
              <select
                value={selectedGiveaway}
                onChange={(e) => setSelectedGiveaway(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Giveaways</option>
                {giveaways.map((giveaway) => (
                  <option key={giveaway.id} value={giveaway.id}>
                    {giveaway.title}
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { icon: Gift, label: 'Total Giveaways', value: stats.totalGiveaways, color: 'purple' },
              { icon: Calendar, label: 'Active Giveaways', value: stats.activeGiveaways, color: 'green' },
              { icon: Users, label: 'Participants', value: stats.totalUsers, color: 'blue' },
              { icon: TrendingUp, label: 'Total Referrals', value: stats.totalReferrals, color: 'indigo' },
              { icon: Trophy, label: 'Valid Referrals', value: stats.validReferrals, color: 'orange' },
              { icon: Shield, label: 'Security Events', value: stats.securityEvents, color: 'red' },
              { icon: Activity, label: 'Recent Activity', value: stats.recentActivity, color: 'teal' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-4 text-center" hover>
                    <Icon className={`w-8 h-8 text-${stat.color}-600 mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Giveaways Tab */}
      {activeTab === 'giveaways' && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Gift className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Giveaways Management</h2>
          </div>

          <div className="space-y-4">
            {giveaways.length > 0 ? (
              giveaways.map((giveaway, index) => (
                <motion.div
                  key={giveaway.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{giveaway.title}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Host: {giveaway.hostName}</p>
                      <p>Created: {giveaway.createdAt.toLocaleDateString()}</p>
                      <p>Ends: {giveaway.endDate.toLocaleDateString()}</p>
                      <p>Status: {giveaway.isEnded ? 'Ended' : 'Active'}</p>
                      <p>ID: {giveaway.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/giveaway/${giveaway.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGiveaway(giveaway)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">No giveaways created yet</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Security Events</h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {securityEvents.length > 0 ? (
              securityEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">{event.type}</span>
                    </div>
                    <div className="text-sm text-red-700 mt-1">
                      IP: {event.ipAddress} | {event.timestamp.toLocaleString()}
                    </div>
                    <div className="text-sm text-red-600 mt-1">{event.details}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No security events recorded</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activityLogs.length > 0 ? (
              activityLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                  <div>
                    <span className="font-medium text-blue-800">{log.action}</span>
                    {log.details && <span className="text-blue-700 ml-2">- {log.details}</span>}
                  </div>
                  <div className="text-blue-600 text-xs">
                    {log.timestamp.toLocaleString()} | IP: {log.ipAddress}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No activity logs recorded</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};