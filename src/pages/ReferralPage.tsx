import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Loader } from 'lucide-react';
import { api } from '../services/api';
import { INTERNAL_TOKEN } from '../utils/constants';

export const ReferralPage: React.FC = () => {
  const { giveawayId } = useParams<{ giveawayId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleReferralClick();
  }, [giveawayId]);

  const handleReferralClick = async () => {
    if (!giveawayId) {
      navigate('/');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const referrerId = urlParams.get('ref');

    if (!referrerId) {
      // No referrer, just redirect to giveaway
      navigate(`/giveaway/${giveawayId}`);
      return;
    }

    try {
      const result = await api.trackReferral(giveawayId, referrerId, INTERNAL_TOKEN);
      
      if (result.redirectUrl.includes('/winner/')) {
        // Giveaway has ended, show winner page
        navigate(`/winner/${giveawayId}`);
      } else {
        // Redirect to channel
        window.location.href = result.redirectUrl;
      }
    } catch (error) {
      console.error('Referral tracking failed:', error);
      // Still redirect to giveaway page
      navigate(`/giveaway/${giveawayId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        <h2 className="text-xl font-semibold text-gray-900">Processing your referral...</h2>
        <p className="text-gray-600">You'll be redirected shortly</p>
      </div>
    </div>
  );
};