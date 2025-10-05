-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
