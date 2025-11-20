/* eslint-disable react/require-default-props */
/* eslint-disable react/button-has-type */

'use client';

import { useState } from 'react';

interface CompatibilityReportBoxProps {
  matchId: string;
  report?: string;
}

export default function CompatibilityReportBox({ matchId, report }: CompatibilityReportBoxProps) {
  const [aiReport, setAiReport] = useState(report || '');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/ai-report`, {
        method: 'POST',
      });
      const data = await res.json();
      setAiReport(data.report);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        AI Compatibility Report
      </h3>

      {!aiReport && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Get an AI-generated analysis of your compatibility
          </p>
          <button
            onClick={generateReport}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Generate Report
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600 mt-4">Analyzing compatibility...</p>
        </div>
      )}

      {aiReport && !loading && (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{aiReport}</p>
        </div>
      )}
    </div>
  );
}
