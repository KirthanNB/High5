"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../app/firebase";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

export default function CommunityTab() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery("");
        setShowSearchDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search results for dropdown
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const results = posts.filter(post => {
        return (
          post.name?.toLowerCase().includes(searchLower) ||
          post.content?.toLowerCase().includes(searchLower) ||
          post.category?.toLowerCase().includes(searchLower)
        );
      }).slice(0, 5); // Limit to 5 results in dropdown
      
      setSearchResults(results);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery, posts]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Add a default post from Kirthan if it doesn't exist already
      const kirthanPostExists = data.some(post => 
        post.name === "Kirthan" && 
        post.content.includes("Astrobiology research")
      );
      
      if (!kirthanPostExists) {
        // Create a sample post from Kirthan with attachment
        const samplePost = {
          id: "sample-kirthan-post-001",
          name: "Kirthan",
          content: "I've been researching the possibilities of extremophiles in Europa's subsurface ocean. Has anyone seen the latest Astrobiology research paper about potential biosignatures that could survive in such environments? Attached a relevant paper for discussion.",
          category: "astrobiology",
          likes: 12,
          hasFile: true,
          fileName: "Europa_Extremophiles_Research.pdf",
          fileSize: 2456000,
          fileUrl: "/sample-attachment.pdf",
          createdAt: { seconds: Date.now() / 1000 - 86400 } // 1 day ago
        };
        
        data = [samplePost, ...data];
      }
      
      setPosts(data);
      setFilteredPosts(data);
    });
    return () => unsub();
  }, []);

  // Filter posts by category and search
  useEffect(() => {
    let filtered = posts;
    
    // Filter by category
    if (activeFilter !== "all") {
      filtered = filtered.filter(post => {
        const category = post.category || "general";
        return category === activeFilter;
      });
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(post => {
        const searchLower = searchQuery.toLowerCase();
        return (
          post.name?.toLowerCase().includes(searchLower) ||
          post.content?.toLowerCase().includes(searchLower) ||
          post.category?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    setFilteredPosts(filtered);
  }, [activeFilter, posts, searchQuery]);

  // Sort posts
  useEffect(() => {
    const sorted = [...filteredPosts];
    if (sortBy === "recent") {
      sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } else if (sortBy === "popular") {
      sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    setFilteredPosts(sorted);
  }, [sortBy]);

  const categories = [
    { id: "all", name: "All", icon: "🌌" },
    { id: "astrobiology", name: "Astrobiology", icon: "🧬" },
    { id: "space-mission", name: "Space Missions", icon: "🚀" },
    { id: "research", name: "Research", icon: "📊" },
    { id: "ask-scientist", name: "Ask Scientists", icon: "❓" },
    { id: "news", name: "News", icon: "📰" },
    { id: "general", name: "Discussion", icon: "💬" },
  ];

  const getCategoryBadge = (category) => {
    const badges = {
      astrobiology: { color: "from-purple-600 to-pink-600", icon: "🧬", text: "Astrobiology" },
      "space-mission": { color: "from-blue-600 to-cyan-600", icon: "🚀", text: "Space Mission" },
      research: { color: "from-green-600 to-emerald-600", icon: "📊", text: "Research" },
      "ask-scientist": { color: "from-orange-600 to-red-600", icon: "❓", text: "Ask Scientist" },
      news: { color: "from-yellow-600 to-amber-600", icon: "📰", text: "News" },
      general: { color: "from-cyan-600 to-blue-600", icon: "💬", text: "Discussion" }
    };
    return badges[category] || badges.general;
  };

  // Include fixed discussion counts to avoid hydration errors
  const trendingTopics = [
    { name: "James Webb Telescope", discussions: 342 },
    { name: "Mars Perseverance", discussions: 285 },
    { name: "Europa Clipper Mission", discussions: 189 },
    { name: "Extremophiles Discovery", discussions: 476 },
    { name: "Artemis Moon Program", discussions: 312 }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Modern Header with Full-Width Search */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Community Hub
            </h1>
            <p className="text-gray-400 mt-1 text-sm">Connect, share, and explore with fellow scientists</p>
          </div>

          {/* Full-Width Search Bar with Dropdown */}
          <div className="relative w-full mb-6 search-container">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
              <svg className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search-input"
              type="text"
              placeholder="Search by content, author, category, or keywords... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
              className="w-full pl-14 pr-32 py-4 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all text-base relative z-0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2 z-10">
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchDropdown(false);
                  }}
                  className="text-gray-400 hover:text-cyan-400 transition-colors group"
                  title="Clear search (Esc)"
                >
                  <div className="p-1.5 rounded-lg bg-gray-700 group-hover:bg-gray-600 transition-colors">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-700 border border-gray-600 rounded">
                <span>⌘</span>
                <span>K</span>
              </kbd>
            </div>

            {/* Search Dropdown Results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-500/20 max-h-[500px] overflow-y-auto z-50 animate-fadeIn">
                <div className="p-3 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-400">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
                
                <div className="p-2 space-y-2">
                  {searchResults.map((post) => {
                    const badge = getCategoryBadge(post.category);
                    return (
                      <button
                        key={post.id}
                        onClick={() => {
                          // Scroll to the post
                          const postElement = document.getElementById(`post-${post.id}`);
                          if (postElement) {
                            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // Highlight effect
                            postElement.classList.add('ring-4', 'ring-cyan-500/50');
                            setTimeout(() => {
                              postElement.classList.remove('ring-4', 'ring-cyan-500/50');
                            }, 2000);
                          }
                          setShowSearchDropdown(false);
                        }}
                        className="w-full text-left p-3 bg-gray-800 hover:bg-gray-750 rounded-xl transition-all group border-2 border-transparent hover:border-cyan-500/50"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {post.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-white truncate">
                                {post.name}
                              </span>
                              <span className={`px-2 py-0.5 bg-gradient-to-r ${badge.color} text-white text-xs font-bold rounded-full flex items-center gap-1`}>
                                <span className="text-xs">{badge.icon}</span>
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-2 group-hover:text-white transition-colors">
                              {post.content}
                            </p>
                            {post.hasFile && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-cyan-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{post.fileName}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Arrow */}
                          <div className="flex items-center text-gray-500 group-hover:text-cyan-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* View All Results */}
                <div className="p-3 border-t border-gray-800">
                  <button
                    onClick={() => {
                      setShowSearchDropdown(false);
                      // Scroll to posts section
                      document.getElementById('posts-feed')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                  >
                    View All {filteredPosts.length} Results
                  </button>
                </div>
              </div>
            )}

            {/* No Results Message */}
            {showSearchDropdown && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border-2 border-gray-700 rounded-2xl shadow-2xl p-6 text-center z-50 animate-fadeIn">
                <div className="text-4xl mb-3">🔭</div>
                <p className="text-white font-semibold mb-1">No results found</p>
                <p className="text-sm text-gray-400">Try different keywords</p>
              </div>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Found <span className="font-bold text-cyan-400">{filteredPosts.length}</span> result{filteredPosts.length !== 1 ? 's' : ''} for "<span className="text-white font-semibold">{searchQuery}</span>"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all ${
                  activeFilter === cat.id
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-2 border-gray-700 hover:border-cyan-500/50"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Sidebar - User Profile Card */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="space-y-4">
              {/* User Card */}
              <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20"></div>
                <div className="px-4 pb-4 -mt-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-4 border-gray-900 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                    S
                  </div>
                  <h3 className="mt-3 text-white font-bold text-lg">Science Explorer</h3>
                  <p className="text-gray-400 text-sm">Space Biology Enthusiast</p>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Posts</span>
                      <span className="text-cyan-400 font-semibold">{posts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-400">Connections</span>
                      <span className="text-cyan-400 font-semibold">247</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-4">
                <h4 className="text-white font-bold text-sm mb-3">Quick Access</h4>
                <div className="space-y-2">
                  {["My Posts", "Saved", "Bookmarks", "Communities"].map((item, i) => (
                    <button key={i} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-cyan-400 rounded-lg transition-all text-sm">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Center Feed */}
          <main className="col-span-12 lg:col-span-6">
            {/* Sort Bar */}
            <div className="bg-gray-900 border-2 border-gray-800 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sortBy === "recent"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  🕐 Recent
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    sortBy === "popular"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  🔥 Popular
                </button>
              </div>
              
              <div className="text-sm text-gray-400">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
              </div>
            </div>

            {/* Create Post */}
            <CreatePost onPost={() => {}} />

            {/* Posts Feed */}
            <div id="posts-feed" className="space-y-4 mt-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-12 text-center animate-fadeIn">
                  <div className="text-6xl mb-4">🔭</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {searchQuery ? "No results found" : activeFilter !== "all" ? `No ${categories.find(c => c.id === activeFilter)?.name} posts` : "No posts yet"}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {searchQuery 
                      ? `No posts match "${searchQuery}". Try different keywords.` 
                      : activeFilter !== "all" 
                      ? `Be the first to post in ${categories.find(c => c.id === activeFilter)?.name}!`
                      : "Be the first to share something!"}
                  </p>
                  <div className="flex gap-3 justify-center">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all font-semibold text-sm"
                      >
                        Clear Search
                      </button>
                    )}
                    {activeFilter !== "all" && !searchQuery && (
                      <button
                        onClick={() => setActiveFilter("all")}
                        className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all font-semibold text-sm"
                      >
                        View All Posts
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredPosts.map((post, index) => (
                  <div 
                    key={post.id} 
                    id={`post-${post.id}`}
                    className="animate-fadeIn scroll-mt-24 transition-all duration-300" 
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <PostCard post={post} />
                  </div>
                ))
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="space-y-4">
              {/* Trending Topics */}
              <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 px-4 py-3 border-b border-gray-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🔥</span>
                    Trending Now
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {trendingTopics.map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(topic.name)}
                      className="block w-full text-left group"
                    >
                      <div className="text-xs text-gray-500 mb-1">#{i + 1} Trending</div>
                      <div className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                        {topic.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {topic.discussions} discussions
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Communities */}
              <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 px-4 py-3 border-b border-gray-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>👥</span>
                    Communities
                  </h3>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { name: "NASA Scientists", members: "12.5K", icon: "🛸" },
                    { name: "Astrobiology Hub", members: "8.3K", icon: "🧬" },
                    { name: "Space Explorers", members: "15.2K", icon: "🚀" },
                  ].map((community, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-xl">
                        {community.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {community.name}
                        </div>
                        <div className="text-xs text-gray-400">{community.members} members</div>
                      </div>
                      <button className="px-3 py-1 bg-cyan-600/20 text-cyan-400 text-xs font-semibold rounded-full hover:bg-cyan-600/30 transition-all">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 text-xs text-gray-500 space-y-1">
                <div className="flex flex-wrap gap-2">
                  <a href="#" className="hover:text-cyan-400">About</a>
                  <span>•</span>
                  <a href="#" className="hover:text-cyan-400">Help</a>
                  <span>•</span>
                  <a href="#" className="hover:text-cyan-400">Privacy</a>
                </div>
                <div>© 2025 Space Science Community</div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}