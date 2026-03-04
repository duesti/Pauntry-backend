-- CreateTable
CREATE TABLE "albums" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "album_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photos_filename_key" ON "photos"("filename");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;
