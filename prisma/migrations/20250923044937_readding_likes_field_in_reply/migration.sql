-- AddForeignKey
ALTER TABLE "public"."Like" ADD CONSTRAINT "Like_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "public"."Reply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
