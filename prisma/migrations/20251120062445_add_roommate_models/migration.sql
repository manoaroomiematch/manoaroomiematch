-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sleepSchedule" INTEGER NOT NULL DEFAULT 3,
    "cleanliness" INTEGER NOT NULL DEFAULT 3,
    "noiseLevel" INTEGER NOT NULL DEFAULT 3,
    "socialLevel" INTEGER NOT NULL DEFAULT 3,
    "guestFrequency" INTEGER NOT NULL DEFAULT 3,
    "temperature" INTEGER NOT NULL DEFAULT 3,
    "smoking" BOOLEAN NOT NULL DEFAULT false,
    "drinking" TEXT NOT NULL DEFAULT 'occasionally',
    "pets" BOOLEAN NOT NULL DEFAULT false,
    "petTypes" TEXT[],
    "dietary" TEXT[],
    "interests" TEXT[],
    "workSchedule" TEXT NOT NULL DEFAULT 'day',
    "preferences" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "compatibilityReport" TEXT,
    "icebreakers" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_user1Id_user2Id_key" ON "Match"("user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
