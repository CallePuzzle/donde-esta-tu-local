-- CreateTable
CREATE TABLE "GangRequestValidation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gangId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "GangRequestValidation_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "Gang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GangRequestValidation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "picture" TEXT,
    "gangId" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "subscription" TEXT,
    CONSTRAINT "User_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "Gang" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "gangId", "id", "name", "picture", "subscription") SELECT "email", "gangId", "id", "name", "picture", "subscription" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "GangRequestValidation_userId_key" ON "GangRequestValidation"("userId");
