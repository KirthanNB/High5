"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../app/firebase";

export default function CreatePost({ onPost }) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setIsPosting(true);
    try {
      // For demo purposes, use public files if no file selected
      let fileUrl = null;
      if (selectedFile) {
        // In a real app, you would upload to Firebase Storage here
        // For now, we'll use a placeholder
        fileUrl = `/sample-attachment.pdf`;
      }

      await addDoc(collection(db, "posts"), {
        name: name.trim(),
        content: content.trim(),
        category,
        likes: 0,
        hasFile: !!selectedFile,
        fileName: selectedFile?.name || null,
        fileSize: selectedFile?.size || null,
        fileUrl: fileUrl,
        createdAt: serverTimestamp()
      });

      setContent("");
      setName("");
      setCategory("general");
      setSelectedFile(null);
      setIsCreating(false);
      onPost();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    // Reset fields and exit create mode
    setName("");
    setCategory("general");
    setContent("");
    setSelectedFile(null);
    setIsCreating(false);
  };

  // When not in creating mode, show the Create New Post prompt
  if (!isCreating) {
    return (
      <div
        className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 cursor-pointer hover:bg-gray-800 transition-all"
        onClick={() => setIsCreating(true)}
      >
        <div className="flex items-center justify-center">
          {/* Using the GIF from public folder */}
          <img src="/add.gif" alt="Add Post" className="w-10 h-10 mr-3" />
          <span className="text-white font-bold">Create New Post</span>
        </div>
      </div>
    );
  }

  // In creating mode, display the post creation form
  return (
    <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all text-sm"
          >
            <option value="general">💬 General Discussion</option>
            <option value="astrobiology">🧬 Astrobiology</option>
            <option value="space-mission">🚀 Space Mission</option>
            <option value="research">📊 Research Paper</option>
            <option value="ask-scientist">❓ Ask Scientist</option>
            <option value="news">📰 News & Updates</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">What's on your mind?</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            maxLength={5000}
            className="w-full px-3 py-2 bg-gray-800 border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {content.length}/5000 characters
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          {/* Media Options */}
          <div className="flex gap-2">
            <label className="p-2 text-gray-400 hover:bg-gray-800 hover:text-cyan-400 rounded-lg transition-all cursor-pointer" title="Add file">
              <span className="text-xl">🔗</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !content.trim() || isPosting}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
            >
              {isPosting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
