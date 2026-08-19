create table if not exists public."Campanha" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  title text not null,
  objective text,
  target_audience text,
  audience_size integer not null default 0,
  message text not null,
  cta text,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'email', 'sms', 'push', 'multi_channel')),
  tone text not null default 'casual' check (tone in ('formal', 'casual', 'engracado', 'elegante', 'persuasivo')),
  status text not null default 'draft' check (status in ('draft', 'ready', 'sent', 'cancelled')),
  recommended_send_time text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists campanha_company_id_idx on public."Campanha"(company_id);
create index if not exists campanha_status_idx on public."Campanha"(status);

alter table public."Campanha" enable row level security;

drop policy if exists "authenticated can manage campanhas" on public."Campanha";
create policy "authenticated can manage campanhas" on public."Campanha"
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop trigger if exists set_updated_date_campanha on public."Campanha";
create trigger set_updated_date_campanha
  before update on public."Campanha"
  for each row execute function public.set_updated_date();
