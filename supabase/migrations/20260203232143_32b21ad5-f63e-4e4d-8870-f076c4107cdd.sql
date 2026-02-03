-- Adicionar coluna user_id à tabela user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para user_id
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Tornar device_id opcional (para migração gradual)
ALTER TABLE public.user_profiles 
ALTER COLUMN device_id DROP NOT NULL;

-- Adicionar constraint unique para user_id
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Remover políticas antigas
DROP POLICY IF EXISTS "Public profiles access" ON public.user_profiles;
DROP POLICY IF EXISTS "Public conversations access" ON public.conversations;

-- Novas políticas RLS para user_profiles (baseadas em user_id)
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Novas políticas RLS para conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
  profile_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.user_profiles WHERE user_id = auth.uid()
  )
);

-- Permitir acesso via service role (para edge function)
CREATE POLICY "Service role full access profiles" 
ON public.user_profiles 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access conversations" 
ON public.conversations 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);