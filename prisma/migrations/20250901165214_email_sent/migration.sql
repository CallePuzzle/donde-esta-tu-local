-- CreateTable
CREATE TABLE "public"."email_sent" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_sent_pkey" PRIMARY KEY ("id")
);
