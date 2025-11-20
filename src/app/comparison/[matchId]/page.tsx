/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
/* eslint-disable react/button-has-type */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ComparisonData } from '@/types';
import MatchHeader from '@/components/MatchHeader';
import CategoryScoreCard from '@/components/CategoryScorecard';
import CompatibilityReportBox from '@/components/CompatibilityReport';
import IcebreakersBox from '@/components/Icebreakers';

export default function ComparisonPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const matchId = params.matchId as string;
  const userId = searchParams.get('userId');

  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComparison() {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/matches/${matchId}/comparison?userId=${userId}`);
        if (!res.ok) throw new Error('Failed to fetch comparison data');

        const comparisonData = await res.json();
        setData(comparisonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, [matchId, userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading comparison...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">
          Error:
          {error || 'No data available'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with both users and overall score */}
        <MatchHeader
          currentUser={data.currentUser}
          matchUser={data.matchUser}
          overallScore={data.match.overallScore}
        />

        {/* Category Comparisons */}
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Compatibility Breakdown
          </h2>

          {data.categoryBreakdown.map((category, idx) => (
            <CategoryScoreCard
              key={idx}
              category={category.category}
              yourValue={category.yourValue}
              theirValue={category.theirValue}
              compatibility={category.compatibility}
              description={category.description}
            />
          ))}
        </div>

        {/* AI-Generated Content Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompatibilityReportBox
            matchId={matchId}
            report={data.match.compatibilityReport || undefined}
          />

          <IcebreakersBox
            matchId={matchId}
            icebreakers={data.match.icebreakers}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Accept Match
          </button>
          <button className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
            Pass
          </button>
          <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
            Save for Later
          </button>
        </div>
      </div>
    </div>
  );
}
