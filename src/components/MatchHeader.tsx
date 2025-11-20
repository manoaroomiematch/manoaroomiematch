import { UserProfile } from '@/types';
import Image from 'next/image';

interface MatchHeaderProps {
  currentUser: UserProfile;
  matchUser: UserProfile;
  overallScore: number;
}

export default function MatchHeader({ currentUser, matchUser, overallScore }: MatchHeaderProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        {/* Current User */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
            {currentUser.photoUrl ? (
              <Image src={currentUser.photoUrl} alt={currentUser.name} width={64} height={64} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                {currentUser.name[0]}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{currentUser.name}</h3>
            <p className="text-sm text-gray-600">You</p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="px-8 text-center">
          <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
            %
          </div>
          <p className="text-sm text-gray-600 mt-1">Overall Match</p>
        </div>

        {/* Match User */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="text-right">
            <h3 className="font-semibold text-lg">{matchUser.name}</h3>
            <p className="text-sm text-gray-600">Your Match</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
            {matchUser.photoUrl ? (
              <Image src={matchUser.photoUrl} alt={matchUser.name} width={64} height={64} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                {matchUser.name[0]}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
