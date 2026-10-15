CREATE TABLE public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_questions INTEGER NOT NULL DEFAULT 0,
  exam_pattern TEXT NOT NULL DEFAULT 'custom',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tests TO authenticated;
GRANT ALL ON public.tests TO service_role;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can browse public tests and manage their own" ON public.tests FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create their own tests" ON public.tests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tests" ON public.tests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tests" ON public.tests FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX tests_public_category_created_at_idx ON public.tests (exam_pattern, created_at DESC) WHERE is_public = true;
CREATE INDEX tests_user_created_at_idx ON public.tests (user_id, created_at DESC);

CREATE TABLE public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  total_time_seconds INTEGER,
  score INTEGER,
  total_questions INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress'
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_attempts TO authenticated;
GRANT ALL ON public.test_attempts TO service_role;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own test attempts" ON public.test_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own test attempts" ON public.test_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own test attempts" ON public.test_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX test_attempts_user_started_at_idx ON public.test_attempts (user_id, started_at DESC);

CREATE TABLE public.user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_answer JSONB,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_answers TO authenticated;
GRANT ALL ON public.user_answers TO service_role;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read answers for their own attempts" ON public.user_answers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.test_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid()));
CREATE POLICY "Users can add answers to their own attempts" ON public.user_answers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.test_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid()));
CREATE POLICY "Users can update answers for their own attempts" ON public.user_answers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.test_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.test_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid()));
CREATE POLICY "Users can delete answers for their own attempts" ON public.user_answers FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.test_attempts a WHERE a.id = attempt_id AND a.user_id = auth.uid()));
CREATE INDEX user_answers_attempt_id_idx ON public.user_answers (attempt_id);