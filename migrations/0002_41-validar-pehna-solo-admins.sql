-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Gang" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "requestsValidation" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);
INSERT INTO "new_Gang" ("id", "latitude", "longitude", "name", "status") SELECT "id", "latitude", "longitude", "name", "status" FROM "Gang";
DROP TABLE "Gang";
ALTER TABLE "new_Gang" RENAME TO "Gang";
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
