'use client';

import UserOverviewCard from '@/components/UserOverviewCard';
import CompatibilityCard from '@/components/CompatibilityCard';
import MatchesCardOverview from '@/components/MatchesCardOverview';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="md:col-span-2 space-y-8">
          {/*
          John Doe is just a mock up user data for demonstration purposes.
          Will need to fetch this data from your backend database or user session.
          */}
          <UserOverviewCard
            name="John Doe"
            year="Junior"
            age={20}
            major="Computer Science"
            bio="I love coding, hiking, and matcha lattes."
            photoUrl=""
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-1">
          <CompatibilityCard />
        </div>

        <div className="text-center">
          <MatchesCardOverview />
        </div>
      </div>
    </div>
  );
}
