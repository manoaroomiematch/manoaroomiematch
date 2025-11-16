'use client';

export default function MatchesList() {
// Mocked match data
  const matches = [
    { name: 'Alyssa I.', school: 'University of Hawaiʻi at Mānoa' },
    { name: 'Colin K.', school: 'University of Hawaiʻi at Mānoa' },
    { name: 'Dylan S.', school: 'University of Hawaiʻi at Mānoa' },
  ];

  return (
    <div className="border rounded-xl p-6 bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">Your Matches</h2>

      <div className="space-y-3">
        {matches.map((m) => (
          <div
            key={`${m.name}-${m.school}`}
            className="flex items-center justify-between border p-3 rounded-lg"
          >
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-sm text-gray-600">{m.school}</p>
            </div>

            <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
