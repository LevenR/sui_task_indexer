-- CreateTable
CREATE TABLE "PurchaseStBTC" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "buyer" TEXT NOT NULL,
    "amount_in" TEXT NOT NULL,
    "amount_out" TEXT NOT NULL,
    "atob" BOOLEAN NOT NULL,
    "pool" TEXT NOT NULL,
    "vault_a_amount" TEXT NOT NULL,
    "vault_b_amount" TEXT NOT NULL,
    "block_time" DATETIME NOT NULL,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AddLiquidity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sender" TEXT NOT NULL,
    "after_liquidity" TEXT NOT NULL,
    "amount_a" TEXT NOT NULL,
    "amount_b" TEXT NOT NULL,
    "liquidity" TEXT NOT NULL,
    "pool" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "block_time" DATETIME NOT NULL,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NaviCetusTask" (
    "user" TEXT NOT NULL PRIMARY KEY,
    "supply_task" BOOLEAN NOT NULL DEFAULT false,
    "borrow_task" BOOLEAN NOT NULL DEFAULT false,
    "liquidity_task" BOOLEAN NOT NULL DEFAULT false,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SupplyStBTC" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" TEXT NOT NULL,
    "reserve" INTEGER NOT NULL,
    "sender" TEXT NOT NULL,
    "block_time" DATETIME NOT NULL,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Borrow" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" TEXT NOT NULL,
    "reserve" INTEGER NOT NULL,
    "sender" TEXT NOT NULL,
    "block_time" DATETIME NOT NULL,
    "created_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_time" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cursor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventSeq" TEXT NOT NULL,
    "txDigest" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "PurchaseStBTC_buyer_idx" ON "PurchaseStBTC"("buyer");

-- CreateIndex
CREATE INDEX "PurchaseStBTC_amount_in_idx" ON "PurchaseStBTC"("amount_in");

-- CreateIndex
CREATE INDEX "PurchaseStBTC_amount_out_idx" ON "PurchaseStBTC"("amount_out");

-- CreateIndex
CREATE INDEX "PurchaseStBTC_atob_idx" ON "PurchaseStBTC"("atob");

-- CreateIndex
CREATE INDEX "AddLiquidity_sender_idx" ON "AddLiquidity"("sender");

-- CreateIndex
CREATE INDEX "AddLiquidity_amount_a_idx" ON "AddLiquidity"("amount_a");

-- CreateIndex
CREATE INDEX "SupplyStBTC_sender_idx" ON "SupplyStBTC"("sender");

-- CreateIndex
CREATE INDEX "SupplyStBTC_amount_idx" ON "SupplyStBTC"("amount");

-- CreateIndex
CREATE INDEX "Borrow_sender_idx" ON "Borrow"("sender");

-- CreateIndex
CREATE INDEX "Borrow_amount_idx" ON "Borrow"("amount");
