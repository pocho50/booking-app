-- CreateTable
CREATE TABLE "billings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "id_reservation" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "observations" TEXT,
    CONSTRAINT "billings_id_reservation_fkey" FOREIGN KEY ("id_reservation") REFERENCES "reservations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "billings_id_reservation_idx" ON "billings"("id_reservation");
