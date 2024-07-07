-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "datetime" DATETIME NOT NULL,
    "is_send" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Task" ("datetime", "id", "is_send", "title") SELECT "datetime", "id", "is_send", "title" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
