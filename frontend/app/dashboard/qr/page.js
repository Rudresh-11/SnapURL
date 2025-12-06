'use client';
import { useState } from 'react';
import { X, BarChart3, Copy, Check } from 'lucide-react';

function LinkReadyModal({ isOpen, onClose, shortLink = 'bit.ly/44GwO8m' }) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

// Demo wrapper to show the modal
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <div className="min-h-screen ">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Link Ready Modal Demo</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Open Modal
        </button>

        <LinkReadyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          shortLink="bit.ly/44GwO8m"
        />
      </div>
    </div>
  );
}