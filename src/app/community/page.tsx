'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  Heart, 
  MessageCircle, 
  Shield, 
  UserCheck,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';

interface CommunityPost {
  id: string;
  content: string;
  mood_tag: string;
  support_count: number;
  reply_count: number;
  timestamp: string;
  is_anonymous: boolean;
  user_nickname?: string;
}

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  member_count: number;
  topic: string;
  is_active: boolean;
}

export default function CommunityPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'share'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMoodTag, setSelectedMoodTag] = useState('general');

  const moodTags = [
    { value: 'general', label: '💭 General', color: 'bg-gray-100 text-gray-700' },
    { value: 'stress', label: '😰 Stress', color: 'bg-red-100 text-red-700' },
    { value: 'anxiety', label: '😟 Anxiety', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'motivation', label: '🚀 Motivation', color: 'bg-green-100 text-green-700' },
    { value: 'relationships', label: '❤️ Relationships', color: 'bg-pink-100 text-pink-700' },
    { value: 'success', label: '🎉 Success', color: 'bg-purple-100 text-purple-700' }
  ];

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sahaara_session_id');
    if (!storedSessionId) {
      router.push('/onboard');
      return;
    }
    setSessionId(storedSessionId);

    // Load sample community data
    loadCommunityData();
  }, [router]);

  const loadCommunityData = () => {
    // Sample posts (in production, these would come from a database)
    const samplePosts: CommunityPost[] = [
      {
        id: '1',
        content: "Just completed my first week of consistent morning meditation! It's amazing how 5 minutes can change your whole day. 🧘‍♀️",
        mood_tag: 'success',
        support_count: 12,
        reply_count: 3,
        timestamp: '2 hours ago',
        is_anonymous: false,
        user_nickname: 'MindfulStudent'
      },
      {
        id: '2',
        content: "Feeling overwhelmed with exam prep. The breathing exercises from yesterday's ritual helped a lot though. Anyone else using the 4-7-8 technique?",
        mood_tag: 'stress',
        support_count: 8,
        reply_count: 5,
        timestamp: '4 hours ago',
        is_anonymous: true
      },
      {
        id: '3',
        content: "Had a difficult conversation with family about my career choices. It's hard when they don't understand your dreams, but staying true to yourself is important.",
        mood_tag: 'relationships',
        support_count: 15,
        reply_count: 7,
        timestamp: '1 day ago',
        is_anonymous: true
      },
      {
        id: '4',
        content: "Small win today: I actually asked for help when I needed it instead of struggling alone. Progress! 💪",
        mood_tag: 'success',
        support_count: 20,
        reply_count: 4,
        timestamp: '1 day ago',
        is_anonymous: false,
        user_nickname: 'GrowingDaily'
      }
    ];

    const sampleGroups: SupportGroup[] = [
      {
        id: '1',
        name: 'Exam Stress Support',
        description: 'A safe space for students dealing with academic pressure',
        member_count: 156,
        topic: 'Academic',
        is_active: true
      },
      {
        id: '2',
        name: 'Career Anxiety Circle',
        description: 'Support for those navigating career decisions and job stress',
        member_count: 89,
        topic: 'Career',
        is_active: true
      },
      {
        id: '3',
        name: 'Daily Motivation Squad',
        description: 'Share daily wins and motivate each other',
        member_count: 203,
        topic: 'Motivation',
        is_active: true
      },
      {
        id: '4',
        name: 'Mindful Living',
        description: 'Discussing mindfulness practices and mental wellness',
        member_count: 134,
        topic: 'Wellness',
        is_active: true
      }
    ];

    setPosts(samplePosts);
    setGroups(sampleGroups);
  };

  const handleSupport = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, support_count: post.support_count + 1 }
        : post
    ));
  };

  const submitPost = () => {
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      content: newPostContent.trim(),
      mood_tag: selectedMoodTag,
      support_count: 0,
      reply_count: 0,
      timestamp: 'Just now',
      is_anonymous: true
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setActiveTab('feed');
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-gray-800">Community</span>
          </div>
          
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { key: 'feed', label: 'Feed', icon: MessageCircle },
              { key: 'groups', label: 'Groups', icon: Users },
              { key: 'share', label: 'Share', icon: PlusCircle }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Privacy Notice */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Anonymous & Safe</p>
              <p className="text-xs text-green-700">All interactions are anonymous. Be supportive and kind.</p>
            </div>
          </div>
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {posts.map((post) => {
              const moodTag = moodTags.find(tag => tag.value === post.mood_tag);
              return (
                <div key={post.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {post.user_nickname || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">{post.timestamp}</p>
                      </div>
                    </div>
                    {moodTag && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${moodTag.color}`}>
                        {moodTag.label}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <button
                      onClick={() => handleSupport(post.id)}
                      className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{post.support_count} support</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.reply_count} replies</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{group.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{group.member_count} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <UserCheck className="w-3 h-3" />
                        <span>{group.topic}</span>
                      </div>
                      {group.is_active && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-3 bg-purple-600 text-white py-2 px-4 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                  Join Group
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Share Tab */}
        {activeTab === 'share' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Share with the Community</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What&apos;s on your mind?
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts, experiences, or ask for support..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none h-24 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood/Topic
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {moodTags.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() => setSelectedMoodTag(tag.value)}
                        className={`p-2 rounded-xl text-xs font-medium transition-all ${
                          selectedMoodTag === tag.value
                            ? 'ring-2 ring-purple-500 ' + tag.color
                            : 'border border-gray-200 hover:border-gray-300 ' + tag.color
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={submitPost}
                  disabled={!newPostContent.trim()}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                    newPostContent.trim()
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Share Anonymously
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2">Community Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be kind and supportive to others</li>
                <li>• Share experiences, not advice as facts</li>
                <li>• Respect everyone&apos;s journey and privacy</li>
                <li>• No sharing of personal contact information</li>
                <li>• Report any concerning content to moderators</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
