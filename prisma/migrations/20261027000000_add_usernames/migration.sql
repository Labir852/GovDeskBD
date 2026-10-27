ALTER TABLE "User" ADD COLUMN "username" TEXT;

DO $$
DECLARE
  user_record RECORD;
  base_username TEXT;
  candidate TEXT;
  suffix INTEGER;
BEGIN
  FOR user_record IN
    SELECT "id", "email"
    FROM "User"
    ORDER BY ("email" = 'admin@govdeskbd.com') DESC, "createdAt", "id"
  LOOP
    base_username := COALESCE(
      NULLIF(left(regexp_replace(lower(split_part(user_record."email", '@', 1)), '[^a-z0-9._-]', '', 'g'), 32), ''),
      'user'
    );
    candidate := base_username;
    suffix := 1;

    WHILE EXISTS (SELECT 1 FROM "User" WHERE "username" = candidate) LOOP
      candidate := left(base_username, 32 - length(suffix::text)) || suffix::text;
      suffix := suffix + 1;
    END LOOP;

    UPDATE "User" SET "username" = candidate WHERE "id" = user_record."id";
  END LOOP;
END $$;

ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
