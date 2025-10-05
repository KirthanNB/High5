import { useState } from "react";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../app/firebase";

export default function PostCard({ post, searchQuery = "" }) {
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  // Function to highlight search terms
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-cyan-500/30 text-cyan-300 rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleLike = async () => {
    if (hasLiked) return;
    
    setIsLiking(true);
    setHasLiked(true);
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likes: increment(1)
      });
    } catch (error) {
      console.error("Error liking post:", error);
      setHasLiked(false);
    } finally {
      setTimeout(() => setIsLiking(false), 300);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    try {
      await addDoc(collection(db, "posts", post.id, "comments"), {
        name: name.trim(),
        content: comment.trim(),
        likes: 0,
        createdAt: serverTimestamp()
      });

      setComment("");
      setName("");
      setIsCommenting(false);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

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

  const badge = getCategoryBadge(post.category);
  const timeAgo = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : "Just now";
  const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;

  return (
    <article className={`bg-gray-900 border-2 rounded-xl overflow-hidden transition-all ${
      hasSearchQuery ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-gray-800 hover:border-cyan-500/50'
    }`}>
      {/* Post Header - Reddit/LinkedIn Style */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {post.name?.charAt(0).toUpperCase() || "?"}
            </div>
          </div>
          
          {/* User Info & Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-white font-bold text-base">
                {hasSearchQuery ? highlightText(post.name, searchQuery) : post.name}
              </h3>
              <span className="text-gray-500 text-sm">•</span>
              <time className="text-gray-400 text-sm">{timeAgo}</time>
              <span className={`ml-auto px-3 py-1 bg-gradient-to-r ${badge.color} text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5`}>
                <span>{badge.icon}</span>
                <span className="hidden sm:inline">{badge.text}</span>
              </span>
            </div>

            {/* Post Content */}
            <div className="mt-3">
              <p className="text-gray-200 text-base leading-relaxed whitespace-pre-wrap break-words">
                {hasSearchQuery ? highlightText(post.content, searchQuery) : post.content}
              </p>
            </div>

            {/* File Attachment Display */}
            {post.hasFile && post.fileName && (
              <div className="mt-4 p-4 bg-gray-800 border-2 border-gray-700 rounded-xl hover:border-cyan-500/50 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {post.fileName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      {post.fileSize && (
                        <span>{(post.fileSize / 1024).toFixed(2)} KB</span>
                      )}
                      <span>•</span>
                      <span className="text-cyan-400">Attachment</span>
                    </div>
                  </div>
                  <button className="text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
                
                {/* File Preview */}
                {post.fileUrl && (
                  <div className="mt-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                    <div className="text-xs text-gray-400 mb-2 font-semibold">Preview:</div>
                    {post.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img 
                        src={post.fileUrl} 
                        alt={post.fileName}
                        className="w-full max-h-96 object-contain rounded-lg border border-gray-700"
                      />
                    ) : post.fileName?.match(/\.(pdf)$/i) ? (
                      <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-2 border-red-500/30 rounded-lg p-4 flex items-center gap-3">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <div className="text-sm font-bold text-red-300">PDF Document</div>
                          <div className="text-xs text-gray-400">Click download to view full document</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-lg p-4 flex items-center gap-3">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <div className="text-sm font-bold text-blue-300">Document File</div>
                          <div className="text-xs text-gray-400">Click download to view full content</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Stats - Reddit Style */}
      <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          {post.likes > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-cyan-400">👍</span>
              <span>{post.likes}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="text-cyan-400">💬</span>
            <span>0 comments</span>
          </span>
        </div>
      </div>

      {/* Action Buttons - LinkedIn/X Style */}
      <div className="px-4 py-2 border-t border-gray-800 bg-gray-900/30">
        <div className="flex items-center gap-1">
          <button
            onClick={handleLike}
            disabled={hasLiked}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              hasLiked
                ? "bg-cyan-600/20 text-cyan-400"
                : "text-gray-300 hover:bg-gray-800 hover:text-cyan-400"
            }`}
          >
            <span className="text-lg">{isLiking ? "✨" : hasLiked ? "👍" : "👍"}</span>
            <span>{hasLiked ? "Liked" : "Like"}</span>
          </button>

          <button
            onClick={() => setIsCommenting(!isCommenting)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-800 hover:text-cyan-400 transition-all"
          >
            <span className="text-lg">💬</span>
            <span>Comment</span>
          </button>

          <button
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-800 hover:text-cyan-400 transition-all"
          >
            <span className="text-lg">🔁</span>
            <span>Share</span>
          </button>

          <button
            className="flex items-center justify-center p-2.5 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-cyan-400 transition-all"
          >
            <span className="text-lg">📌</span>
          </button>
        </div>
      </div>

      {/* Comment Section - LinkedIn Style */}
      {isCommenting && (
        <div className="px-4 py-4 border-t border-gray-800 bg-gray-900/50">
          <form onSubmit={handleComment} className="space-y-3">
            <div className="flex gap-3">
              {/* Comment Avatar */}
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                />

                <textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCommenting(false);
                      setComment("");
                      setName("");
                    }}
                    className="px-4 py-1.5 text-gray-300 text-sm font-semibold hover:bg-gray-800 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || !comment.trim()}
                    className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
