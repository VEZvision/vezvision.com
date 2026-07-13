-- Naprawa rozszerzenia pgcrypto i funkcji logowania

-- Upewnij się że rozszerzenie jest zainstalowane
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;

-- Usuń starą funkcję jeśli istnieje
DROP FUNCTION IF EXISTS admin_login(text, text);

-- Utwórz funkcję logowania z poprawnymi typami danych
CREATE OR REPLACE FUNCTION admin_login(p_username TEXT, p_password TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    email TEXT,
    role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.username,
        a.email,
        a.role
    FROM admins a
    WHERE a.is_active = TRUE
        AND a.username = p_username
        AND a.password_hash = crypt(p_password, a.password_hash)
    LIMIT 1;
END;
$$;

-- Przyznaj uprawnienia do funkcji
GRANT EXECUTE ON FUNCTION admin_login(text, text) TO anon;
GRANT EXECUTE ON FUNCTION admin_login(text, text) TO authenticated;

-- Sprawdź czy domyślny admin istnieje, jeśli nie to dodaj
INSERT INTO admins (username, email, password_hash)
SELECT 'admin', 'admin@vezvision.pl', crypt('admin123', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE username = 'admin');