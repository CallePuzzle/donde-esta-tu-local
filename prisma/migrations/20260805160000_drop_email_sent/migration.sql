-- DropTable
-- La tabla email_sent guardaba el email en claro de cada envío de OTP y solo
-- la consultaba /api/user/email-sent-check, eliminado en S2. Sin lectores,
-- era PII acumulándose sin límite (S9).
DROP TABLE "public"."email_sent";
