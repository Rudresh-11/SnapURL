"use client";

import React, { useState } from 'react';
import { 
  Search, Calendar, SlidersHorizontal, Lock, Eye, Tag, Edit, Share2, 
  BarChart2, MoreHorizontal, List, Columns, Grid, Copy, ExternalLink 
} from 'lucide-react';

export default function BitlyLinksPage() {
  const [viewMode, setViewMode] = useState('list');

  // -----------------------
  // ONLY DATA ADDED HERE
  // -----------------------
  const links = [
    {
      id: 1,
      title: "Github Profile",
      short: "bit.ly/4pMJy5t",
      dest: "https://github.com/Rudresh-11",
      clicks: 42,
      date: "Dec 4, 2025",
      tags: "No tags"
    },
    {
      id: 2,
      title: "YouTube Channel",
      short: "snap.url/yt123",
      dest: "https://youtube.com/@SomeChannel",
      clicks: 131,
      date: "Nov 15, 2025",
      tags: "video"
    },
    {
      id: 3,
      title: "Portfolio Website",
      short: "snap.url/port11",
      dest: "https://rudresh.dev",
      clicks: 89,
      date: "Oct 29, 2025",
      tags: "portfolio"
    },
    {
      id: 4,
      title: "LinkedIn Profile",
      short: "snap.url/in55",
      dest: "https://linkedin.com/in/rudresh",
      clicks: 65,
      date: "Sep 12, 2025",
      tags: "career"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 w-full">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl font-bold text-gray-900">Snapped Links</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
            Create link
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search links"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Filter by created date</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Add filters</span>
          </button>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between w-full">

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">0 selected</span>
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <Lock className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="text-sm text-gray-500 hover:text-gray-700">Hide</button>
            <button className="text-sm text-gray-500 hover:text-gray-700">Tag</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 border border-gray-300 rounded-md p-1">
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                <List className="w-4 h-4 text-gray-600" />
              </button>

              <button onClick={() => setViewMode('columns')}
                className={`p-1.5 rounded ${viewMode === 'columns' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                <Columns className="w-4 h-4 text-gray-600" />
              </button>

              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                <Grid className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Active</option>
                <option>Archived</option>
                <option>All</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------ */}
      {/* LINK LIST - DYNAMICALLY RENDER */}
      {/* ------------------------------ */}

      <div className="px-6 py-6 w-full">

        {links.map(link => (
          <div key={link.id} className="bg-white rounded-lg border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">

              <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />

              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59..."
                  />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{link.title}</h3>

                <div className="flex items-center gap-2 mb-2">
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">{link.short}</a>
                  <button className="text-gray-400 hover:text-gray-600"><Copy className="w-4 h-4" /></button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <ExternalLink className="w-4 h-4" />
                  <span>{link.dest}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5"><BarChart2 className="w-4 h-4" /> <span>{link.clicks} clicks</span></div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> <span>{link.date}</span></div>
                  <div className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> <span>{link.tags}</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-md"><Edit className="w-4 h-4 text-gray-600" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-md"><Share2 className="w-4 h-4 text-gray-600" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-md"><BarChart2 className="w-4 h-4 text-gray-600" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-md"><MoreHorizontal className="w-4 h-4 text-gray-600" /></button>
              </div>
            </div>
          </div>
        ))}

        {/* Banner stays same */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-cyan-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm text-gray-700">
              Change a link's destination, even after you've shared it.
              <a href="#" className="text-cyan-700 font-medium hover:underline"> View plans </a>
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <div className="h-px bg-gray-300 w-20"></div>
            <span className="text-sm">You've reached the end of your links</span>
            <div className="h-px bg-gray-300 w-20"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
