-- ============================================================
-- Migração 004 — Controle de acesso / perfis de usuário
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email     VARCHAR(255) NOT NULL UNIQUE,
  nome      VARCHAR(255) NOT NULL DEFAULT '',
  role      VARCHAR(20)  NOT NULL DEFAULT 'consulta'
              CHECK (role IN ('admin', 'consulta')),
  criado_em TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_user_profiles"
  ON user_profiles FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
