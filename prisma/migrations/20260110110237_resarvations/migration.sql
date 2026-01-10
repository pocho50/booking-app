-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "id_resource" TEXT NOT NULL,
    "id_client" TEXT NOT NULL,
    "observation" TEXT,
    "price" REAL NOT NULL,
    CONSTRAINT "reservations_id_resource_fkey" FOREIGN KEY ("id_resource") REFERENCES "resources" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_id_client_fkey" FOREIGN KEY ("id_client") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
