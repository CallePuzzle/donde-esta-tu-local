-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "picture" TEXT,
    "gangId" INTEGER,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "subscription" TEXT,
    CONSTRAINT "User_gangId_fkey" FOREIGN KEY ("gangId") REFERENCES "Gang" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("gangId", "id", "name", "picture", "role", "subscription") SELECT "gangId", "id", "name", "picture", "role", "subscription" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
