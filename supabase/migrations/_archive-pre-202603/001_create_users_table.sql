-- Rozszerzenia wymagane do generowania UUID i bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela administratorów (nie korzysta z auth.users, własna kontrola haseł)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Trigger aktualizujący updated_at
CREATE OR REPLACE FUNCTION admins_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_admins_updated_at ON admins;
CREATE TRIGGER trg_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION admins_set_updated_at();

-- Włączenie RLS – nie będziemy udostępniać bezpośrednich SELECT-ów z frontendu
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Funkcja RPC do logowania admina; nie ujawnia hashy; porównuje bcrypt
CREATE OR REPLACE FUNCTION admin_login(p_username TEXT, p_password TEXT)
RETURNS TABLE (id UUID, username TEXT, email TEXT, role TEXT)
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.username, a.email, a.role
  FROM admins a
  WHERE a.is_active = TRUE
    AND a.username = p_username
    AND a.password_hash = crypt(p_password, a.password_hash)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Uprawnienia do wykonywania RPC z kluczem anon
GRANT EXECUTE ON FUNCTION admin_login(TEXT, TEXT) TO anon;

-- Dodanie domyślnego admina: login 'admin', hasło 'admin123'
INSERT INTO admins (username, email, password_hash)
SELECT 'admin', 'admin@vezvision.pl', crypt('admin123', gen_salt('bf'))
WHERE NOT EXISTS (
  SELECT 1 FROM admins WHERE username = 'admin'
);