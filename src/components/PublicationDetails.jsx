'use client';

import { useState } from 'react';
import AIInsightsPanel from './AIInsightsPanel';
import GraphicalAnalysis from './GraphicalAnalysis/GraphicalAnalysis';
import MindMap from './MindMap/MindMap';

export default function PublicationDetails({ publication }) {
  const [showVisualization, setShowVisualization] = useState(false);
  const [showAbstract, setShowAbstract] = useState(true);
  const [showSource, setShowSource] = useState(true);
  const [activeTab, setActiveTab] = useState('abstract');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30 rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        
        {/* Animated Orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative p-8">
          {/* Title with Glow Effect */}
          <div className="mb-6">
            <h1 className="text-4xl font-light text-white mb-4 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {publication.title || "Untitled Publication"}
            </h1>
            
            {/* Metadata with Icons */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {publication.pmcid && (
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                  <span className="font-medium text-gray-400">PMCID:</span>
                  <span className="text-cyan-400 font-mono">{publication.pmcid}</span>
                </div>
              )}

              {publication.source_url && (
                <a
                  href={publication.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all duration-300 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Source
                </a>
              )}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => { setShowAbstract(true); setActiveTab('abstract'); }}
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'abstract'
                  ? 'bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5'
                  : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border border-transparent'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Abstract
            </button>
            
            <button
              onClick={() => { setShowSource(true); setActiveTab('source'); }}
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'source'
                  ? 'bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5'
                  : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border border-transparent'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Source Details
            </button>

            <button
              onClick={() => setShowVisualization(prev => !prev)}
              className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                showVisualization 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 border border-transparent hover:border-cyan-500/30'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              {showVisualization ? "Hide Visualizations" : "Show Visualizations"}
            </button>
          </div>

          {/* Abstract Section with Enhanced Design */}
          {showAbstract && publication.abstract && (
            <div className="p-6 bg-gray-800/20 rounded-xl border border-gray-700/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                Abstract
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                {publication.abstract}
              </p>
            </div>
          )}

          {/* Source URL Section with Enhanced Design */}
          {showSource && publication.source_url && (
            <div className="p-6 bg-gray-800/20 rounded-xl border border-gray-700/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                Source Information
              </h2>
              <div className="flex flex-col gap-3">
                <span className="text-sm text-gray-400">Direct Link to Publication</span>
                <a
                  href={publication.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-base break-all hover:underline bg-gray-900/50 px-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300"
                >
                  {publication.source_url}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights with Enhanced Card */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
            AI Analysis & Insights
          </h2>
          <AIInsightsPanel publication={publication} />
        </div>
      </div>

      {/* Visualizations Section - Premium Design */}
      {showVisualization && (
        <div className="space-y-8">
          {/* Knowledge Graph with Enhanced Header */}
          <div className="bg-gradient-to-br from-gray-900/50 to-blue-900/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-blue-900/20">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">Knowledge Graph</h2>
                  <p className="text-gray-400 mt-2">Interactive network of scientific concepts and their relationships</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <GraphicalAnalysis publication={publication} />
            </div>
          </div>

          {/* Mind Map with Enhanced Header */}
          <div className="bg-gradient-to-br from-gray-900/50 to-purple-900/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-purple-900/20">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">Interactive Mind Map</h2>
                  <p className="text-gray-400 mt-2">Explore key concepts and their hierarchical relationships</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <MindMap publication={publication} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}