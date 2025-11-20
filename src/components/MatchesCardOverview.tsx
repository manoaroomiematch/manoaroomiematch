'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PersonCircle, StarFill } from 'react-bootstrap-icons';

interface Match {
  id: number;
  name: string;
  major: string;
  traits: string[];
  matchPercentage: number;
  photoUrl: string | null;
}

const matches: Match[] = [
  {
    id: 1,
    name: 'Kai Nakamura',
    major: 'Computer Science',
    traits: ['Night Owl', 'Tidy', 'Introvert'],
    matchPercentage: 92,
    photoUrl: null,
  },
  {
    id: 2,
    name: 'Leilani Santos',
    major: 'Biology',
    traits: ['Early Bird', 'Clean', 'Friendly'],
    matchPercentage: 88,
    photoUrl: null,
  },
  {
    id: 3,
    name: 'Noa Tanaka',
    major: 'Business',
    traits: ['Organized', 'Social', 'Gym Enthusiast'],
    matchPercentage: 85,
    photoUrl: null,
  },
];

const MatchesCardOverview: React.FC = () => (
  <div>
    <h2 className="font-semibold mb-4">Your Matches</h2>

    {/* ⭐ SAME STYLE — JUST FORCED TO 3 COLUMNS ⭐ */}
    <div className="grid grid-cols-3 gap-6">

      {matches.map((match) => (
        <div
          key={match.id}
          className="match-card bg-white border rounded-xl shadow-sm overflow-hidden d-flex flex-column"
        >
          {/* PHOTO SECTION */}
          <div className="match-photo-container w-100 position-relative" style={{ height: '180px' }}>
            {match.photoUrl ? (
              <Image
                src={match.photoUrl}
                alt={`${match.name} photo`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="
              match-photo-placeholder
              absolute inset-0 d-flex flex-columns
              justify-content-center
              align-items-center"
              >
                <PersonCircle size={80} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-4">
            <h3 className="match-name">{match.name}</h3>
            <p className="match-major">{match.major}</p>

            <p className="match-traits mt-2">{match.traits.join(' · ')}</p>

            <div className="match-percentage mt-2 d-flex justify-content-center align-items-center">
              <StarFill size={18} className="text-yellow-500 mr-1" />
              <span className="font-semibold">
                {match.matchPercentage}
                % Match
              </span>
            </div>

            <Link
              href={`/profile/${match.id}`}
              className="
                mt-3 block
                text-blue-600
                font-medium px-3 py-2 rounded-lg text-center
                hover:bg-blue-50 transition
              "
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MatchesCardOverview;
