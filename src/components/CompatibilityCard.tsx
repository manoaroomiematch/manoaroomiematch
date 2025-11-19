'use client';

const CompatibilityCard: React.FC = () => (
  <div className="border w-full max-w-4xl mx-auto w-100">
    <h2 className="font-semibold font-size-46 mb-6 my-4 text-center">Compatibility Highlights</h2>

    <div
      className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-2
          gap-6
        "
    >
      {/* Shared Interests */}
      <div className=" p-6">
        <h3 className="text-lg font-semibold mb-4 mx-4">Interests</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Coding</li>
          <li>Hiking</li>
          <li>Matcha Lattes</li>
        </ul>
      </div>

      {/* Complementary Traits */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 mx-4">Personalities</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Adventurous</li>
          <li>Creative Thinker</li>
          <li>Good Listener</li>
        </ul>
      </div>
    </div>
  </div>
);

export default CompatibilityCard;
