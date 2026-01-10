-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "id_resource" TEXT NOT NULL,
    "id_client" TEXT,
    "observation" TEXT,
    "price" REAL NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "reservations_id_resource_fkey" FOREIGN KEY ("id_resource") REFERENCES "resources" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_reservations" ("end_date", "id", "id_client", "id_resource", "observation", "price", "start_date") SELECT "end_date", "id", "id_client", "id_resource", "observation", "price", "start_date" FROM "reservations";
DROP TABLE "reservations";
ALTER TABLE "new_reservations" RENAME TO "reservations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
