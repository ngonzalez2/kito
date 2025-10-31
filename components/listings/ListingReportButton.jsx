'use client';

import { useState } from 'react';
import useTranslations from '@/hooks/useTranslations';

export default function ListingReportButton({ listingId }) {
  const { listings } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const toggle = () => {
    setIsOpen((prev) => !prev);
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reason.trim()) {
      setMessage(listings.report.validation);
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      setReason('');
      setStatus('success');
      setMessage(listings.report.success);
    } catch (error) {
      console.error('Report submission failed', error);
      setStatus('error');
      setMessage(listings.report.error);
    }
  };

  return (
    <div className="mt-4 border-t border-sand/40 pt-3">
      <button
        type="button"
        onClick={toggle}
        className="text-xs font-semibold uppercase tracking-[0.3em] text-deep-blue/70 transition-colors duration-300 hover:text-coral"
      >
        {isOpen ? listings.report.close : listings.report.button}
      </button>
      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <label className="text-xs uppercase tracking-[0.3em] text-deep-blue/60">
            {listings.report.label}
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1 min-h-[80px] rounded-2xl border border-sand/60 bg-white/60 px-3 py-2 text-sm text-deep-blue focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
              placeholder={listings.report.placeholder}
              maxLength={400}
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="gradient-button rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'loading' ? listings.report.submitting : listings.report.submit}
            </button>
            {message && (
              <p
                className={`text-xs ${
                  status === 'success' ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
