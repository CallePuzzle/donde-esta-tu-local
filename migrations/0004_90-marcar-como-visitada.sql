-- CreateTable
CREATE TABLE "_GangsVisited" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GangsVisited_A_fkey" FOREIGN KEY ("A") REFERENCES "Gang" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GangsVisited_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_GangsVisited_AB_unique" ON "_GangsVisited"("A", "B");

-- CreateIndex
CREATE INDEX "_GangsVisited_B_index" ON "_GangsVisited"("B");
