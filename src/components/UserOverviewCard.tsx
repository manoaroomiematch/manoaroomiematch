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

export default function UserOverviewCard({
  name,
  year,
  age,
  major,
  bio,
  photoUrl,
}: UserOverviewCardProps) {
  return (
    <div className="rounded-xl border bg-white shadow-md overflow-hidden">
      {/* Profile picture overlapping banner */}
      <div className="relative px-6 pb-6">
        <div className="-mt-14 flex items-start gap-4">
          <Image
            src={photoUrl || '/default-profile.png'}
            alt={`${name}'s profile picture`}
            width={120}
            height={120}
            className="rounded-full border-4 border-white shadow-md object-cover"
          />

          {/* Name + title */}
          <div className="pt-6">
            <h2 className="text-2xl font-semibold">{name}</h2>
            <p className="text-gray-600 text-sm">{major}</p>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-gray-700 text-sm">
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
          <p className="col-span-2">
            <strong>Bio:</strong>
            {' '}
            {bio}
          </p>
        </div>

        {/* Edit Link */}
        <div className="mt-4">
          <Link
            href="/profile/edit"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
