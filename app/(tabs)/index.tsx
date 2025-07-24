import React, { useEffect, useState } from 'react';
import HomeScreen from '../../screens/HomeScreen';
import AuthScreen from '../../screens/AuthScreen';
import { getUser } from '../../services/authService';
import { useInvestments } from '../../hooks/useInvestments';
import { supabase } from '../../services/supabaseClient';
import { Investment } from '../../hooks/useInvestments';
import { fetchForexRatePair } from '../../services/forexService';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingModal from '../../components/OnboardingModal';

export default function TabIndex() {
  const { investments, setInvestments } = useInvestments();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    (async () => {
      const { data } = await getUser();
      setAuthenticated(!!data?.user);
      setLoading(false);
      // Onboarding check
      const onboarded = await AsyncStorage.getItem('onboarding_shown');
      if (!onboarded) setShowOnboarding(true);
    })();
  }, []);

  // Fetch investments from Supabase after login
  useEffect(() => {
    if (authenticated) {
      (async () => {
        const { data: { user } } = await getUser();
        if (user) {
          const { data, error } = await supabase
            .from('investments')
            .select('*')
            .eq('user_id', user.id);
          if (!error && data) {
            setInvestments(data as Investment[]);
          }
        }
      })();
    }
  }, [authenticated]);

  // Sync investments to Supabase on change
  useEffect(() => {
    if (authenticated) {
      (async () => {
        const { data: { user } } = await getUser();
        if (user) {
          // Upsert all investments for this user
          for (const inv of investments) {
            await supabase.from('investments').upsert({ ...inv, user_id: user.id });
          }
        }
      })();
    }
  }, [investments, authenticated]);

  if (loading) return null;
  if (!authenticated) return <AuthScreen onAuthSuccess={() => setAuthenticated(true)} />;
  return <>
    <HomeScreen />
    {showOnboarding && <OnboardingModal onDone={async () => {
      setShowOnboarding(false);
      await AsyncStorage.setItem('onboarding_shown', '1');
    }} />}
  </>;
}
