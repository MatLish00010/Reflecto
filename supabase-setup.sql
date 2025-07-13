-- Создание таблицы users (если не существует)
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы invites (если не существует)
CREATE TABLE IF NOT EXISTS public.invites (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
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
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
-- Разрешаем вставку новых пользователей
CREATE POLICY "Users can insert themselves" ON public.users
    FOR INSERT WITH CHECK (true);

-- Разрешаем чтение пользователей
CREATE POLICY "Users can read themselves" ON public.users
    FOR SELECT USING (true);

-- Разрешаем обновление пользователей
CREATE POLICY "Users can update themselves" ON public.users
    FOR UPDATE USING (true);

-- Политики для таблицы invites
-- Разрешаем вставку приглашений
CREATE POLICY "Invites can be inserted" ON public.invites
    FOR INSERT WITH CHECK (true);

-- Разрешаем чтение приглашений по коду
CREATE POLICY "Invites can be read by code" ON public.invites
    FOR SELECT USING (true);

-- Разрешаем обновление приглашений (для отметки использованных)
CREATE POLICY "Invites can be updated" ON public.invites
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
CREATE INDEX IF NOT EXISTS idx_invites_code ON public.invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_user_id ON public.invites(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at); 