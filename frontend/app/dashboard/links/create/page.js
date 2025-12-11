'use client';
import { use, useState,useEffect } from 'react';
import { ChevronUp, ChevronDown,X, BarChart3, Copy, Check, QrCode } from 'lucide-react';
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

function LinkReadyModal({ isOpen, onClose, shortLink = 'urlsnap.in/r/something' ,id}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewDetails = () => {
    if (id){
    window.location.href = '/dashboard/' + id;
    } else {
      alert('Something went wrong: Link ID not provided');
    }
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
                href={`${shortLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-medium text-blue-600 hover:text-blue-700"
              >
                {shortLink.replace("https://" ,"")}
              </a>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleViewDetails}
                className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                View link details
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors cursor-pointer"
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
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 cursor-pointer"
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (shortLink.includes(" "))
    {
      setError("Back half must not contain space");
      setLoading(false);
      return;
    }
    if (shortLink.length >= 7)
    {
      setError("Back half must be less that 7 characters");
      setLoading(false);
      return;
    }
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

    console.log(createApiUrl.error);
    if (createApiUrl.error || !res) {
      setError(createApiUrl.error || "Some error occured while creating link");
      setLoading(createApiUrl.loading);
      return
    }
    setLoading(createApiUrl.loading);
    setModalOpen(true);

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
        onClose={() => {
          setModalOpen(false)
          setDestinationUrl('');
          setShortLink('');
          setTitle('');
        }}
        shortLink={shortLink ? `${process.env.NEXT_PUBLIC_BASE_URL}/${shortLink}` : 'bit.ly/44GwO8m'}
        id={createApiUrl?.data?.data?.id}
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
                    <span className="px-3 py-2 w-1/2 border border-gray-300 rounded-md text-gray-700">urlsnap.in/r/</span>
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
                    <QrCode className="w-6 h-6 rounded flex items-center justify-center" />
                  <span className="font-medium text-gray-900">Generate a QR Code</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Not available at the moment</span>
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
            onClick={(e)=>handleSubmit(e)}
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