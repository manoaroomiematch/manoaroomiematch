'use client';

import Image from 'next/image';
import Link from 'next/link';

interface UserOverviewCardProps {
  name: string;
  year: string;
  age: number;
  major: string;
  bio: string;
  photoUrl: string;
}

const UserOverviewCard: React.FC<UserOverviewCardProps> = ({
  name,
  year,
  age,
  major,
  bio,
  photoUrl,
}) => (
  <div className="
      bg-white border rounded-xl shadow-sm p-8
      flex items-center justify-start
      h-full
    "
  >
    {/* Profile Image - Left Side */}
    <div className="flex-shrink-0 mr-8">
      <Image
        src={photoUrl || '/johndoe.jpg'}
        alt={`${name}'s profile picture`}
        width={200}
        height={200}
        className="
          rounded-full
          border-4 border-white
          shadow-md
          object-cover
        "
      />
    </div>

    {/* Content - Right Side */}
    <div className="flex-1">
      {/* Name + major */}
      <div>
        <h2 className="text-4xl font-bold">{name}</h2>
        <p className="text-gray-600 text-xl mt-1">{major}</p>
      </div>

      {/* Details */}
      <div className="mt-6 space-y-3 text-gray-700 text-xl">
        <p>
          <strong>Year:</strong>
          {' '}
          {year}
        </p>
        <p>
          <strong>Age:</strong>
          {' '}
          {age}
        </p>
        <p>
          <strong>Bio:</strong>
          {' '}
          {bio}
        </p>
      </div>

      {/* Edit Link */}
      <div className="mt-6">
        <Link
          href="/profile/edit"
          className="text-blue-600 hover:underline font-medium text-xl"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  </div>
);

export default UserOverviewCard;
