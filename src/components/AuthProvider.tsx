import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSignal, initData } from '@tma.js/sdk-react';


type User = {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  telegram_username: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUsername: (username: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUsername: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const tgUser = useSignal(initData.user);
  const rawInitData = useSignal(initData.raw);
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTgUsernamePrompt, setShowTgUsernamePrompt] = useState(false);

  useEffect(() => {
    async function authenticate() {
      if (!tgUser || !rawInitData) {
        setLoading(false);
        return;
      }

      try {

        // 1. Check if we already have an active session
        let { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { error } = await supabase.auth.getUser();
          if (error && error.message.toLowerCase().includes('not authenticated')) {
            await supabase.auth.signOut();
            session = null;
          }
        }

        if (!session) {
          // 2. No session, call our Edge Function to authenticate via Telegram
          const { data: authData, error: authError } = await supabase.functions.invoke('telegram-auth', {
            body: { initDataRaw: rawInitData }
          });

          if (authError || !authData?.session) {
            console.error('Failed to authenticate with Telegram:', authError || authData);
            setLoading(false);
            return;
          }

          // 3. Set the session in the client
          const { error: sessionError } = await supabase.auth.setSession(authData.session);
          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setLoading(false);
            return;
          }
        }

        // 4. Now that we're authenticated, fetch the public user profile
        const { data: publicUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', tgUser.id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching public user profile:', userError);
          setLoading(false);
          return;
        }

        if (publicUser) {
          setUser(publicUser);
          if (!tgUser.username) {
            setShowTgUsernamePrompt(true);
          }
        } else {
          // This shouldn't happen normally since the edge function / trigger handles it
          if (!tgUser.username) {
            setShowTgUsernamePrompt(true);
          }
        }

      } catch (err: any) {
        console.error('Auth error:', err);
        if (err?.message === 'Not authenticated' || err?.message?.toLowerCase().includes('not authenticated')) {
          await supabase.auth.signOut();
        }
      } finally {
        setLoading(false);
      }
    }

    authenticate();
  }, [tgUser, rawInitData]);

  const handleSetUsername = async (username: string) => {
    if (!tgUser) return;

    try {
      // Check if username is taken
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (existing) {
        console.error('Username is already taken');
        return;
      }

      // We are authenticated now, so we can just update our public profile
      // The trigger on auth.users already created the row in public.users
      
      // Get current auth user ID
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ username })
        .eq('id', authUser.id)
        .select()
        .single();

      if (updateError) {
        // If trigger hasn't fired for some reason, try insert instead
        if (updateError.code === 'PGRST116') {
           const { data: insertedUser, error: insertError } = await supabase
             .from('users')
             .insert({
               id: authUser.id,
               telegram_id: tgUser.id,
               username,
               first_name: tgUser.first_name || tgUser.firstName,
               last_name: tgUser.last_name || tgUser.lastName || null,
               telegram_username: tgUser.username || null,
             })
             .select()
             .single();
           if (insertError) throw insertError;
           setUser(insertedUser);
        } else {
           throw updateError;
        }
      } else {
        setUser(updatedUser);
      }
      
    } catch (err: any) {
      console.error(err.message || 'An error occurred');
      if (err.message === 'Not authenticated' || err.message?.toLowerCase().includes('not authenticated')) {
        await supabase.auth.signOut();
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ color: '#1A4F9C', fontWeight: 'bold' }}>Loading...</div>
      </div>
    );
  }

  if (showTgUsernamePrompt) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div className="card" style={{ marginTop: 'auto', marginBottom: 'auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A4F9C', marginBottom: '10px' }}>Set Up Telegram Username</h2>
          <p style={{ marginBottom: '20px', color: '#4b5563' }}>We noticed you don't have a Telegram username set. Please set one up in your Telegram profile for the best experience.</p>
          
          <img 
            src="/images/telegram_set_username.JPG" 
            alt="How to set Telegram username" 
            style={{ width: '100%', borderRadius: '8px', marginBottom: '20px', objectFit: 'contain' }}
          />
          
          <button 
            className="btn-primary" 
            onClick={() => setShowTgUsernamePrompt(false)}
            style={{ width: '100%' }}
          >
            I understand, continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUsername: handleSetUsername }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
