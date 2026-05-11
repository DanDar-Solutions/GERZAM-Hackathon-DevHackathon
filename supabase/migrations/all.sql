-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.hazards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  width double precision NOT NULL DEFAULT 0.0003,
  height double precision NOT NULL DEFAULT 0.0003,
  category text NOT NULL CHECK (category = ANY (ARRAY['ice'::text, 'broken'::text, 'blocked'::text, 'slope'::text])),
  severity text NOT NULL DEFAULT 'medium'::text CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  reported_at timestamp with time zone DEFAULT now(),
  report_count integer DEFAULT 1,
  source text DEFAULT 'user'::text,
  photo_url text,
  reporter_id text,
  CONSTRAINT hazards_pkey PRIMARY KEY (id)
);
CREATE TABLE public.help_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  requester_lat double precision NOT NULL,
  requester_lng double precision NOT NULL,
  volunteer_id uuid,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT help_requests_pkey PRIMARY KEY (id),
  CONSTRAINT help_requests_volunteer_id_fkey FOREIGN KEY (volunteer_id) REFERENCES public.volunteers(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mongolian_id text NOT NULL UNIQUE,
  profile_type text,
  age_range text,
  assistive_device text,
  main_challenge text,
  travel_companion text,
  survey_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.volunteers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  register_id text NOT NULL,
  has_car boolean DEFAULT false,
  can_transport boolean DEFAULT false,
  is_online boolean DEFAULT true,
  lat double precision,
  lng double precision,
  last_seen timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT volunteers_pkey PRIMARY KEY (id)
);