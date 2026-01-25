/*
  Warnings:

  - You are about to drop the `billings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "billings";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "id_reservation" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "observations" TEXT,
    CONSTRAINT "payments_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "payments_id_reservation_idx" ON "payments"("id_reservation");
