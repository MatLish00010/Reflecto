-- Создание таблицы users (если не существует)
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    fingerprint TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы notes (если не существует)
CREATE TABLE IF NOT EXISTS public.notes (
    id BIGSERIAL PRIMARY KEY,
    note TEXT,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение RLS для таблиц
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
-- Разрешаем вставку новых пользователей (создание по fingerprint)
CREATE POLICY "Users can insert themselves" ON public.users
    FOR INSERT WITH CHECK (true);

-- Разрешаем чтение пользователей по fingerprint
CREATE POLICY "Users can read themselves" ON public.users
    FOR SELECT USING (true);

-- Разрешаем обновление пользователей по fingerprint
CREATE POLICY "Users can update themselves" ON public.users
    FOR UPDATE USING (true);

-- Политики для таблицы notes
-- Разрешаем вставку записей для пользователей
CREATE POLICY "Users can insert notes" ON public.notes
    FOR INSERT WITH CHECK (true);

-- Разрешаем чтение записей пользователя
CREATE POLICY "Users can read their notes" ON public.notes
    FOR SELECT USING (true);

-- Разрешаем обновление записей пользователя
CREATE POLICY "Users can update their notes" ON public.notes
    FOR UPDATE USING (true);

-- Разрешаем удаление записей пользователя
CREATE POLICY "Users can delete their notes" ON public.notes
    FOR DELETE USING (true);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_fingerprint ON public.users(fingerprint);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at); 