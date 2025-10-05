-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
