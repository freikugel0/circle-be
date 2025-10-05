-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "photo_profile" TEXT NOT NULL,
    "bio" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Thread" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reply" (
    "id" SERIAL NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Like" (
    "id" SERIAL NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" INTEGER NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Follow" (
    "id" SERIAL NOT NULL,
    "following_id" INTEGER NOT NULL,
    "follower_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Thread" ADD CONSTRAINT "Thread_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Thread" ADD CONSTRAINT "Thread_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Follow" ADD CONSTRAINT "Follow_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
