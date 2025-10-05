'use client';
import { useState, useEffect } from 'react';
import PublicationDetails from './PublicationDetails';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicationsList() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedPub, setSelectedPub] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const limit = 12; // publications per page

  // Fetch data
  const fetchPublications = async (search = '', currentPage = 1, append = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('limit', limit);
      params.append('offset', (currentPage - 1) * limit);

      const response = await fetch(`/api/publications?${params}`);
      if (!response.ok) throw new Error('Failed to fetch publications');

      const data = await response.json();
      const newPubs = data.publications || [];

      setPublications((prev) => (append ? [...prev, ...newPubs] : newPubs));
      setHasMore(newPubs.length === limit);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications('', 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPublications(searchTerm, 1);
  };

  // Load More
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPublications(searchTerm, nextPage, true);
  };

  // Smooth scroll to top when viewing details
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (loading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 text-lg animate-pulse">
        🚀 Fetching space biology data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Header Section - Search Engine Style */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-3">
            <span className="text-cyan-400">Space</span>
            <span className="text-blue-500">Biology</span>
          </h1>
          <p className="text-gray-400 text-sm">Explore the frontier of space research</p>
        </div>

        {/* Search Bar - Google-style */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-30 transition"></div>
            <div className="relative flex items-center bg-gray-800/90 backdrop-blur-sm rounded-full border border-gray-700 hover:border-cyan-500 focus-within:border-cyan-500 transition-all shadow-2xl">
              <span className="pl-6 text-gray-400 text-xl">🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search space biology publications..."
                className="flex-1 px-4 py-5 bg-transparent text-white text-lg focus:outline-none placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setPage(1); fetchPublications(); }}
                  className="pr-4 text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 border border-gray-700 transition text-sm font-medium"
            >
              Search Publications
            </button>
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setPage(1); fetchPublications(); }}
              className="px-6 py-2.5 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 border border-gray-700 transition text-sm font-medium"
            >
              I'm Feeling Lucky
            </button>
          </div>
        </form>

        {/* Results Count */}
        {!loading && publications.length > 0 && !selectedPub && (
          <div className="text-gray-500 text-sm mb-4">
            About {publications.length}+ results {searchTerm && `for "${searchTerm}"`}
          </div>
        )}
      </div>

      {error && <div className="text-red-500 text-center mb-6 max-w-4xl mx-auto px-6">{error}</div>}

      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* Show publication details */}
        <AnimatePresence mode="wait">
          {selectedPub ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={() => { setSelectedPub(null); scrollToTop(); }}
                className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-sm"
              >
                ← Back to results
              </button>
              <PublicationDetails publication={selectedPub} />
            </motion.div>
          ) : (
            <>
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {publications.map((pub, index) => (
                  <motion.div
                    key={`${pub._additional?.id || 'no-id'}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-6 hover:bg-gray-800/60 hover:border-gray-600 transition-all duration-200"
                  >
                    <button 
                      onClick={() => { setSelectedPub(pub); scrollToTop(); }}
                      className="text-left w-full group"
                    >
                      <h2 className="text-xl text-cyan-400 group-hover:text-cyan-300 mb-2 font-normal hover:underline">
                        {pub.title || "Untitled Publication"}
                      </h2>
                      <div className="text-green-600 text-sm mb-3">
                        {pub.url || 'nasa.gov › space-biology'}
                      </div>
                      {pub.abstract && (
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                          {pub.abstract}
                        </p>
                      )}
                    </button>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                      <button
                        onClick={() => { setSelectedPub(pub); scrollToTop(); }}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded hover:bg-gray-700 transition"
                      >
                        🧠 Summarize
                      </button>
                      <button
                        onClick={() => { setSelectedPub(pub); scrollToTop(); }}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded hover:bg-gray-700 transition"
                      >
                        📘 Details
                      </button>
                      <button
                        onClick={() => { setSelectedPub(pub); scrollToTop(); }}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded hover:bg-gray-700 transition"
                      >
                        🌌 Visualize
                      </button>
                      <button
                        onClick={() => { setSelectedPub(pub); scrollToTop(); }}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded hover:bg-gray-700 transition"
                      >
                        🗺️ Mind Map
                      </button>
                    </div>

                    {/* Inline AI Summary */}
                    {summaries[pub.title] && (
                      <div className="mt-3 p-3 bg-black/40 border border-cyan-800 rounded-lg text-gray-300 text-sm">
                        <p>{summaries[pub.title]}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-2.5 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 border border-gray-700 transition text-sm font-medium"
                  >
                    Load More Results
                  </button>
                </div>
              )}

              {loading && page > 1 && (
                <div className="text-center text-gray-400 mt-6 text-sm">
                  Loading more results...
                </div>
              )}

              {!hasMore && !loading && publications.length > 0 && (
                <div className="text-center text-gray-500 mt-8 text-sm">
                  End of results
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}