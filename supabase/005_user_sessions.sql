-- One active session row per user. When a new device logs in and the user
-- confirms, this row is overwritten — the old device detects the token change
-- and signs itself out.

CREATE TABLE IF NOT EXISTS user_sessions (
  user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  device_hint  text,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own session" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);
