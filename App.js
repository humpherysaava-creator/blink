import React, { useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const stories = [
  { id: 1, name: 'Your story', color: '#6758E8', initials: 'You', mine: true },
  { id: 2, name: 'Ava', color: '#FF8066', initials: 'AV' },
  { id: 3, name: 'Maya', color: '#F7C84B', initials: 'MA' },
  { id: 4, name: 'Leo', color: '#58CFA5', initials: 'LE' },
  { id: 5, name: 'Noah', color: '#64A6F3', initials: 'NO' },
];

const posts = [
  {
    id: 1,
    name: 'Ava Williams',
    handle: '@ava',
    time: '12m',
    initials: 'AV',
    color: '#FF8066',
    text: 'Found the coziest little place for coffee today ☕',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
    likes: 24,
  },
  {
    id: 2,
    name: 'Leo Martin',
    handle: '@leo',
    time: '38m',
    initials: 'LE',
    color: '#58CFA5',
    text: 'Golden hour never misses.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85',
    likes: 41,
  },
];

function Avatar({ initials, color, size = 44, ring = false }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, ring && styles.avatarRing]}>
      <View style={[styles.avatarInner, { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2, backgroundColor: color }]}
>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    </View>
  );
}

function Icon({ name, active = false }) {
  const symbols = { home: '⌂', chat: '◯', add: '+', bell: '♢', profile: '○' };
  return <Text style={[styles.icon, active && styles.activeIcon]}>{symbols[name]}</Text>;
}

export default function App() {
  const [liked, setLiked] = useState({});

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.logo}>blink</Text>
        <Pressable style={styles.headerButton}><Icon name="chat" /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Stories</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stories}>
          {stories.map((story) => (
            <Pressable key={story.id} style={styles.story}>
              <View>
                <Avatar initials={story.initials} color={story.color} size={68} ring={!story.mine} />
                {story.mine && <View style={styles.addBadge}><Text style={styles.addBadgeText}>+</Text></View>}
              </View>
              <Text style={styles.storyName} numberOfLines={1}>{story.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.feedHeader}>
          <Text style={styles.sectionTitle}>Your circle</Text>
          <Pressable><Text style={styles.seeAll}>Latest</Text></Pressable>
        </View>

        {posts.map((post) => {
          const isLiked = liked[post.id];
          return (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Avatar initials={post.initials} color={post.color} size={46} />
                <View style={styles.postIdentity}>
                  <Text style={styles.postName}>{post.name}</Text>
                  <Text style={styles.postMeta}>{post.handle} · {post.time}</Text>
                </View>
                <Pressable style={styles.moreButton}><Text style={styles.moreText}>•••</Text></Pressable>
              </View>

              <Text style={styles.postText}>{post.text}</Text>
              <Image source={{ uri: post.image }} style={styles.postImage} />

              <View style={styles.postActions}>
                <Pressable onPress={() => setLiked((value) => ({ ...value, [post.id]: !value[post.id] }))}>
                  <Text style={[styles.action, isLiked && styles.liked]}>{isLiked ? '♥' : '♡'}  {post.likes + (isLiked ? 1 : 0)}</Text>
                </Pressable>
                <Pressable><Text style={styles.action}>◯  Reply</Text></Pressable>
                <Pressable style={styles.shareButton}><Text style={styles.action}>↗</Text></Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.tabBar}>
        <Pressable style={styles.tabItem}><Icon name="home" active /></Pressable>
        <Pressable style={styles.tabItem}><Icon name="chat" /></Pressable>
        <Pressable style={styles.cameraButton}><Icon name="add" /></Pressable>
        <Pressable style={styles.tabItem}><Icon name="bell" /></Pressable>
        <Pressable style={styles.tabItem}><Icon name="profile" /></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F7FB' },
  header: { height: 64, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', backgroundColor: '#F7F7FB' },
  logo: { color: '#6758E8', fontSize: 30, fontWeight: '900', letterSpacing: -1.5 },
  headerButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 96 },
  sectionTitleRow: { paddingHorizontal: 20, marginTop: 5, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#17171C', fontSize: 20, fontWeight: '800' },
  seeAll: { color: '#6758E8', fontSize: 14, fontWeight: '700' },
  stories: { paddingHorizontal: 16, paddingBottom: 22, gap: 12 },
  story: { width: 72, alignItems: 'center' },
  storyName: { color: '#45454F', fontSize: 12, marginTop: 7, width: 72, textAlign: 'center' },
  avatar: { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  avatarRing: { borderWidth: 2.5, borderColor: '#6758E8' },
  avatarInner: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  addBadge: { position: 'absolute', right: -2, bottom: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#6758E8', borderWidth: 2, borderColor: '#F7F7FB', alignItems: 'center', justifyContent: 'center' },
  addBadgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', lineHeight: 16 },
  feedHeader: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postCard: { marginHorizontal: 16, marginBottom: 16, padding: 12, borderRadius: 24, backgroundColor: '#FFFFFF' },
  postHeader: { height: 52, flexDirection: 'row', alignItems: 'center' },
  postIdentity: { flex: 1, marginLeft: 10 },
  postName: { color: '#17171C', fontSize: 15, fontWeight: '800' },
  postMeta: { color: '#92929D', fontSize: 12, marginTop: 2 },
  moreButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  moreText: { color: '#777781', letterSpacing: 1 },
  postText: { color: '#35353D', fontSize: 14, lineHeight: 20, paddingVertical: 10 },
  postImage: { width: '100%', height: 260, borderRadius: 18, backgroundColor: '#E8E8EF' },
  postActions: { height: 46, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  action: { color: '#656570', fontSize: 14, fontWeight: '700', marginRight: 18 },
  liked: { color: '#F05A78' },
  shareButton: { marginLeft: 'auto' },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 82, paddingHorizontal: 12, paddingBottom: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EFEFF4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tabItem: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  cameraButton: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#6758E8', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  icon: { color: '#A5A5AF', fontSize: 24, fontWeight: '700' },
  activeIcon: { color: '#6758E8' },
});
