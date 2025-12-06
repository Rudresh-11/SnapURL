'use client';
import { use, useState,useEffect } from 'react';
import { ChevronUp, ChevronDown,X, BarChart3, Copy, Check } from 'lucide-react';
import ConfirmDialog from '@/components/confirm-dialog';
import useApi from '@/hooks/useApi';

function parseTitleFromUrl(url) {
  try {
    const hostname = new URL(url).hostname; // google.com
    const name = hostname.replace("www.", "").split(".")[0]; // google
    return name.charAt(0).toUpperCase() + name.slice(1); // Google
  } catch {
    return "Untitled";
  }
}

function LinkReadyModal({ isOpen, onClose, shortLink = 'urlsnap.in/r/44GwO8m' }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewDetails = () => {
    console.log('View link details');
  };

  const handleCreateAnother = () => {
    console.log('Create another link');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            Your link is ready! 🎉
          </h2>
          <p className="text-gray-600 mt-2">
            Copy the link below to share it or choose a platform to share it to.
          </p>
        </div>

        {/* Link Display and Actions */}
        <div className="px-8 pb-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-center mb-4">
              <a
                href={`https://${shortLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-medium text-blue-600 hover:text-blue-700"
              >
                {shortLink}
              </a>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleViewDetails}
                className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                View link details
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex justify-center items-center gap-2 text-gray-600">
          <span>On a roll? Don't stop now!</span>
          <button
            onClick={handleCreateAnother}
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            Create another link
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LinkCreator() {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [title, setTitle] = useState('');
  const [generateQR, setGenerateQR] = useState(false);
  const [addToBitly, setAddToBitly] = useState(false);
  const [linkDetailsOpen, setLinkDetailsOpen] = useState(true);
  const [sharingOptionsOpen, setSharingOptionsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelopen, setModalOpen] = useState(false);

  const createApiUrl = useApi('/url/shorten',{method: 'POST'});

  const handleSubmit = async () => {
    setLoading(true)
    
    console.log({
      destinationUrl,
      shortLink,
      title,
      generateQR,
      addToBitly
    });

    if (!destinationUrl) {
      setError("Destination URL is required.");
      setLoading(false);
      return;
    }
    // Here you would typically send the data to your backend API
    const payload = {
      originalUrl: destinationUrl,
      customAlias: shortLink,
      title: title
    }

    const res = await createApiUrl.request(payload);
    console.log(res);
    console.log(createApiUrl.error);
    setError(createApiUrl.error);
    setLoading(createApiUrl.loading);
    if (!createApiUrl.error) {
      setModalOpen(true);
    }

  };

  const handleDestinationUrlChange = (e) => {
    const url = e.target.value;
    setDestinationUrl(url);
    if (!title) {
      setTitle(parseTitleFromUrl(url));
    }
  };

  
  

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <LinkReadyModal
        isOpen={modelopen}
        onClose={() => setModalOpen(false)}
        shortLink={shortLink ? `urlsnap.in/${shortLink}` : 'bit.ly/44GwO8m'}
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Create a new link</h1>
          <ConfirmDialog
            trigger={
              <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 cursor-pointer">
                Bulk upload
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            }
            title="Bulk Upload Links"
            description="This feature will be available soon. Stay tuned!"
            confirmText="Okay"
            cancelText="Cancel"
            onConfirm={() => {
              console.log('Bulk upload confirmed');
            }}
          />
        </div>

        {/* Link Details Section */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <button
            onClick={() => setLinkDetailsOpen(!linkDetailsOpen)}
            className="w-full px-6 py-4 flex justify-between items-center"
          >
            <h2 className="text-lg font-semibold text-gray-900">Link details</h2>
            {linkDetailsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {linkDetailsOpen && (
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-6">
                You have 4 links and 3 custom back-halves remaining this month.{' '}
                <a href="#" className="text-blue-600 hover:underline">Upgrade for more</a>.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Destination URL
                </label>
                <input
                  type="text"
                  value={destinationUrl}
                  placeholder='https://example.com/my-long-url'
                  onChange={(e) => handleDestinationUrlChange(e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Short link
                </label>
                <div className="flex gap-2">
                    <span className="px-3 py-2 w-1/2 border border-gray-300 rounded-md text-gray-700">snapurl.io</span>
                  <span className="flex items-center text-gray-500">/</span>
                  <input
                    type="text"
                    value={shortLink}
                    onChange={(e) => setShortLink(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Title <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
                {error && <p className="text-red-500 text-sm text-center flex justify-center items-center">{error}</p>}
            </div>
          )}
          
        </div>

        {/* Sharing Options Section */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <button
            onClick={() => setSharingOptionsOpen(!sharingOptionsOpen)}
            className="w-full px-6 py-4 flex justify-between items-center"
          >
            <h2 className="text-lg font-semibold text-gray-900">Sharing options</h2>
            {sharingOptionsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {sharingOptionsOpen && (
            <div className="px-6 pb-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Generate a QR Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">2 left</span>
                  <ConfirmDialog
                    trigger={<button
                    onClick={() => setGenerateQR(!generateQR)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      generateQR ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        generateQR ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>}
                    title="Generate QR Code"
                    description="This Feature will be available soon. Stay tuned!"
                    confirmText="Got it"
                    cancelText="Cancel"
                    onConfirm={() => {
                      setGenerateQR(!generateQR);
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Add to a Bitly Page</span>
                </div>
                <button
                  onClick={() => setAddToBitly(!addToBitly)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    addToBitly ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      addToBitly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
{loading ? (
          <button
            disabled
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium opacity-50 cursor-not-allowed"
          >
            Creating...
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Create Link
          </button>
        )}

        </div>
      </div>
    </div>
  );
}