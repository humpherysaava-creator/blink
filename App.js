import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import {
  Alert, Image, Pressable, SafeAreaView, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'humpherysaava7@gmail.com';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true },
    })
  : null;

const stories = [
  { id: 1, name: 'Your story', initials: 'You', color: '#6758E8', mine: true },
  { id: 2, name: 'Ava', initials: 'AV', color: '#FF8066' },
  { id: 3, name: 'Maya', initials: 'MA', color: '#F7C84B' },
  { id: 4, name: 'Leo', initials: 'LE', color: '#58CFA5' },
];

const posts = [
  { id: 1, name: 'Ava Williams', handle: '@ava', time: '12m', initials: 'AV', color: '#FF8066', text: 'Found the coziest little place for coffee today ☕', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85', likes: 24 },
  { id: 2, name: 'Leo Martin', handle: '@leo', time: '38m', initials: 'LE', color: '#58CFA5', text: 'Golden hour never misses.', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85', likes: 41 },
];

function Avatar({ initials, color, size = 44, ring = false }) {
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, ring && styles.ring]}><View style={[styles.avatarInner, { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2, backgroundColor: color }]}><Text style={styles.avatarText}>{initials}</Text></View></View>;
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    if (!supabase) {
      Alert.alert('Setup required', 'Add your Supabase URL and anonymous key to the environment.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    setPassword('');
    if (error) Alert.alert('Sign-in failed', error.message);
  }

  return <SafeAreaView style={styles.loginSafe}><StatusBar barStyle="dark-content" /><View style={styles.loginCard}><Text style={styles.logo}>blink</Text><Text style={styles.loginTitle}>Welcome back</Text><Text style={styles.loginSubtitle}>Sign in to your close-friends circle.</Text><TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#9A9AA5" autoCapitalize="none" keyboardType="email-address" style={styles.input}/><TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#9A9AA5" secureTextEntry style={styles.input}/><Pressable disabled={loading} onPress={login} style={[styles.loginButton, loading && { opacity: 0.6 }]}><Text style={styles.loginButtonText}>{loading ? 'Signing in…' : 'Sign in'}</Text></Pressable></View></SafeAreaView>;
}

function AdminPanel({ user, onClose, onLogout }) {
  return <SafeAreaView style={styles.safe}><View style={styles.adminHeader}><Pressable onPress={onClose}><Text style={styles.back}>‹  Back</Text></Pressable><Text style={styles.adminTitle}>Admin</Text><View style={{ width: 64 }}/></View><ScrollView contentContainerStyle={styles.adminContent}><View style={styles.adminBadge}><Text style={styles.adminBadgeText}>ADMIN</Text></View><Text style={styles.adminName}>{user.email}</Text><Text style={styles.adminSubtitle}>Community management</Text><View style={styles.statRow}><View style={styles.stat}><Text style={styles.statNumber}>—</Text><Text style={styles.statLabel}>Users</Text></View><View style={styles.stat}><Text style={styles.statNumber}>—</Text><Text style={styles.statLabel}>Posts</Text></View><View style={styles.stat}><Text style={styles.statNumber}>—</Text><Text style={styles.statLabel}>Reports</Text></View></View><Pressable style={styles.adminAction}><Text style={styles.adminActionText}>Manage users</Text></Pressable><Pressable style={styles.adminAction}><Text style={styles.adminActionText}>Review reports</Text></Pressable><Pressable onPress={onLogout} style={styles.logoutButton}><Text style={styles.logoutText}>Sign out</Text></Pressable></ScrollView></SafeAreaView>;
}

function Feed({ user, onAdmin, onLogout }) {
  const [liked, setLiked] = useState({});
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL || user?.app_metadata?.role === 'admin';
  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" /><View style={styles.header}><Text style={styles.logo}>blink</Text><Pressable onPress={isAdmin ? onAdmin : onLogout} style={styles.profileChip}><Text style={styles.profileText}>{isAdmin ? 'Admin' : '•••'}</Text></Pressable></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedContent}><Text style={styles.sectionTitle}>Stories</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stories}>{stories.map(story => <Pressable key={story.id} style={styles.story}><Avatar initials={story.initials} color={story.color} size={68} ring={!story.mine}/>{story.mine && <View style={styles.addBadge}><Text style={styles.addBadgeText}>+</Text></View>}<Text style={styles.storyName}>{story.name}</Text></Pressable>)}</ScrollView><Text style={styles.sectionTitle}>Your circle</Text>{posts.map(post => { const active = liked[post.id]; return <View key={post.id} style={styles.postCard}><View style={styles.postHeader}><Avatar initials={post.initials} color={post.color} size={46}/><View style={styles.postIdentity}><Text style={styles.postName}>{post.name}</Text><Text style={styles.postMeta}>{post.handle} · {post.time}</Text></View></View><Text style={styles.postText}>{post.text}</Text><Image source={{ uri: post.image }} style={styles.postImage}/><Pressable onPress={() => setLiked(value => ({ ...value, [post.id]: !value[post.id] }))}><Text style={[styles.action, active && styles.liked]}>{active ? '♥' : '♡'}  {post.likes + (active ? 1 : 0)}</Text></Pressable></View>; })}</ScrollView></SafeAreaView>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  async function logout() { if (supabase) await supabase.auth.signOut(); setAdminOpen(false); }

  if (!session) return <LoginScreen />;
  if (adminOpen) return <AdminPanel user={session.user} onClose={() => setAdminOpen(false)} onLogout={logout}/>;
  return <Feed user={session.user} onAdmin={() => setAdminOpen(true)} onLogout={logout}/>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7FB' }, loginSafe: { flex: 1, backgroundColor: '#F7F7FB', justifyContent: 'center' }, loginCard: { marginHorizontal: 24, padding: 24, borderRadius: 28, backgroundColor: '#FFF' }, logo: { color: '#6758E8', fontSize: 32, fontWeight: '900' }, loginTitle: { fontSize: 26, fontWeight: '800', color: '#17171C', marginTop: 24 }, loginSubtitle: { color: '#777781', marginTop: 8, marginBottom: 20 }, input: { height: 54, borderRadius: 14, backgroundColor: '#F4F4F8', paddingHorizontal: 16, color: '#17171C', marginTop: 10 }, loginButton: { height: 54, borderRadius: 14, backgroundColor: '#6758E8', alignItems: 'center', justifyContent: 'center', marginTop: 16 }, loginButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  header: { height: 64, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }, profileChip: { height: 36, borderRadius: 18, backgroundColor: '#6758E8', paddingHorizontal: 14, justifyContent: 'center' }, profileText: { color: '#FFF', fontWeight: '800', fontSize: 12 }, feedContent: { paddingHorizontal: 16, paddingBottom: 40 }, sectionTitle: { color: '#17171C', fontSize: 20, fontWeight: '800', marginVertical: 12 }, stories: { gap: 12, paddingBottom: 10 }, story: { width: 72, alignItems: 'center' }, storyName: { color: '#45454F', fontSize: 12, marginTop: 7 }, avatar: { backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }, ring: { borderWidth: 2.5, borderColor: '#6758E8' }, avatarInner: { alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFF', fontWeight: '800' }, addBadge: { position: 'absolute', right: 0, bottom: 22, width: 22, height: 22, borderRadius: 11, backgroundColor: '#6758E8', alignItems: 'center', justifyContent: 'center' }, addBadgeText: { color: '#FFF', fontWeight: '800' }, postCard: { marginBottom: 16, padding: 12, borderRadius: 24, backgroundColor: '#FFF' }, postHeader: { height: 52, flexDirection: 'row', alignItems: 'center' }, postIdentity: { marginLeft: 10 }, postName: { fontWeight: '800', color: '#17171C' }, postMeta: { color: '#92929D', fontSize: 12 }, postText: { marginVertical: 10, color: '#35353D' }, postImage: { width: '100%', height: 260, borderRadius: 18 }, action: { marginTop: 12, color: '#656570', fontWeight: '700' }, liked: { color: '#F05A78' },
  adminHeader: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }, back: { color: '#6758E8', fontWeight: '800', width: 64 }, adminTitle: { fontSize: 18, fontWeight: '800' }, adminContent: { alignItems: 'center', padding: 20 }, adminBadge: { backgroundColor: '#6758E8', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 }, adminBadgeText: { color: '#FFF', fontWeight: '900', fontSize: 12 }, adminName: { marginTop: 14, fontSize: 20, fontWeight: '800' }, adminSubtitle: { color: '#777781', marginTop: 4 }, statRow: { flexDirection: 'row', gap: 10, marginVertical: 24 }, stat: { width: 105, height: 88, borderRadius: 18, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }, statNumber: { fontSize: 22, fontWeight: '900' }, statLabel: { color: '#777781', marginTop: 5 }, adminAction: { width: '100%', height: 54, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', paddingHorizontal: 16, marginBottom: 10 }, adminActionText: { fontWeight: '800' }, logoutButton: { width: '100%', height: 54, borderRadius: 14, borderWidth: 1, borderColor: '#F05A78', alignItems: 'center', justifyContent: 'center', marginTop: 10 }, logoutText: { color: '#F05A78', fontWeight: '800' },
});
