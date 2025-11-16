'use client';

export default function CompatibilityCard() {
  return (
    <div className="border rounded-xl p-6 bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">Compatibility Highlights</h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Top Shared Interests</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Coding</li>
            <li>Hiking</li>
            <li>Matcha Lattes</li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium">Complementary Traits</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Adventurous</li>
            <li>Creative Thinker</li>
            <li>Good Listener</li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium">Potential Growth Areas</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            <li>Time Management</li>
            <li>Public Speaking</li>
            <li>Networking Skills</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
