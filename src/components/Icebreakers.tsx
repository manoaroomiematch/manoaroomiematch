/* eslint-disable react/no-array-index-key */
/* eslint-disable max-len */
/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */

'use client';

import { useState } from 'react';

interface IcebreakersBoxProps {
  matchId: string;
  icebreakers?: string[];
}

export default function IcebreakersBox({ matchId, icebreakers }: IcebreakersBoxProps) {
  const [questions, setQuestions] = useState(icebreakers || []);
  const [loading, setLoading] = useState(false);

  const generateIcebreakers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/ai-report`, {
        method: 'POST',
      });
      const data = await res.json();
      setQuestions(data.icebreakers);
    } catch (err) {
      console.error('Error generating icebreakers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Conversation Starters
      </h3>

      {questions.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Get personalized questions to break the ice
          </p>
          <button
            onClick={generateIcebreakers}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Generate Questions
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600 mt-4">Creating questions...</p>
        </div>
      )}

      {questions.length > 0 && !loading && (
        <ul className="space-y-3">
          {questions.map((question, idx) => (
            <li key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {idx + 1}
              </span>
              <p className="text-gray-700 text-sm pt-0.5">{question}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
