// This is specifically for the Category Breakdown on Match Comparison page

interface CategoryScoreCardProps {
  category: string;
  yourValue: string | number;
  theirValue: string | number;
  compatibility: number;
  description: string;
}

export default function CategoryScoreCard({
  category,
  yourValue,
  theirValue,
  compatibility,
  description,
}: CategoryScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-800">{category}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-16 h-2 rounded-full ${getScoreColor(compatibility)}`} />
          <span className="text-sm font-medium text-gray-600">
            {compatibility}
            %
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{description}</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">You</p>
          <p className="font-medium text-gray-800">{yourValue}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Them</p>
          <p className="font-medium text-gray-800">{theirValue}</p>
        </div>
      </div>
    </div>
  );
}
