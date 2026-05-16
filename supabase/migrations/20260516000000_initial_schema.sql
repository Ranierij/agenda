create extension if not exists "pgcrypto";

create or replace function public.set_updated_date()
returns trigger as $$
begin
  new.updated_date = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public."Salao" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  owner_email text,
  nome_salao text not null,
  slug text unique,
  admin_email text not null,
  telefone text,
  endereco text,
  plano text not null default 'starter' check (plano in ('starter', 'pro', 'enterprise')),
  status text not null default 'pendente' check (status in ('ativo', 'bloqueado', 'pendente')),
  onboarding_concluido boolean not null default false,
  logo_url text,
  cor_primaria text not null default '#f43f5e',
  cor_secundaria text not null default '#fda4af',
  observacoes text,
  whatsapp text,
  instagram text,
  email_salao text,
  slogan text,
  descricao text
);

create table if not exists public."Servico" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  nome text not null,
  categoria text check (categoria in ('Cabelo', 'Unhas', 'Estética', 'Maquiagem', 'Massagem', 'Sobrancelha', 'Outro')),
  duracao_minutos integer not null default 60,
  valor numeric(10,2) not null,
  descricao text,
  ativo boolean not null default true
);

create table if not exists public."Profissional" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  nome text not null,
  especialidade text,
  telefone text,
  email text,
  dias_atendimento text[] default array[]::text[],
  hora_inicio text not null default '09:00',
  hora_fim text not null default '22:00',
  ativo boolean not null default true
);

create table if not exists public."Cliente" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  nome text not null,
  telefone text,
  email text,
  data_nascimento date,
  observacoes text,
  ativo boolean not null default true
);

create table if not exists public."Agendamento" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  cliente_id uuid,
  cliente_nome text not null,
  servico_id uuid,
  servico_nome text not null,
  profissional_id uuid,
  profissional_nome text,
  data date not null,
  hora text not null,
  duracao_minutos integer not null default 60,
  valor numeric(10,2) default 0,
  status text not null default 'agendado' check (status in ('agendado', 'confirmado', 'chegou', 'concluido', 'cancelado', 'faltou')),
  forma_pagamento text check (forma_pagamento in ('Pix', 'Cartão', 'Dinheiro', 'Transferência', 'Pacote') or forma_pagamento is null or forma_pagamento = ''),
  pacote_cliente_id uuid,
  observacoes text,
  repetir_dias integer not null default 0,
  confirmacao_enviada boolean not null default false
);

create table if not exists public."ListaEspera" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  cliente_id uuid,
  cliente_nome text not null,
  cliente_telefone text,
  cliente_email text,
  servico_id uuid,
  servico_nome text,
  profissional_id uuid,
  profissional_nome text,
  data_preferencia date,
  horario_preferencia text,
  observacoes text,
  status text not null default 'aguardando' check (status in ('aguardando', 'notificado', 'agendado', 'desistiu')),
  notificado_em timestamptz
);

create table if not exists public."Notificacao" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  tipo text not null default 'info' check (tipo in ('falta', 'cancelamento', 'info')),
  titulo text not null,
  mensagem text not null,
  agendamento_id uuid,
  cliente_nome text,
  lida boolean not null default false
);

create table if not exists public."Pacote" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  nome text not null,
  descricao text,
  servicos_incluidos text[] default array[]::text[],
  total_sessoes integer not null,
  valor numeric(10,2) not null,
  validade_dias integer not null default 90,
  ativo boolean not null default true
);

create table if not exists public."PacoteCliente" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  company_id uuid not null references public."Salao"(id) on delete cascade,
  pacote_id uuid not null,
  pacote_nome text,
  cliente_id uuid not null,
  cliente_nome text,
  total_sessoes integer not null,
  sessoes_usadas integer not null default 0,
  valor_pago numeric(10,2),
  data_inicio date,
  data_validade date,
  status text not null default 'ativo' check (status in ('ativo', 'concluido', 'vencido', 'cancelado')),
  observacoes text
);

create table if not exists public."AppConfig" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  super_admin_emails text[] default array[]::text[],
  app_name text not null default 'BeautyFlow AI',
  system_settings jsonb not null default '{}'::jsonb
);

create table if not exists public."User" (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  email text unique not null,
  full_name text,
  role text not null default 'user'
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'Salao', 'Servico', 'Profissional', 'Cliente', 'Agendamento',
    'ListaEspera', 'Notificacao', 'Pacote', 'PacoteCliente', 'AppConfig', 'User'
  ]
  loop
    execute format('drop trigger if exists set_updated_date on public.%I', table_name);
    execute format(
      'create trigger set_updated_date before update on public.%I for each row execute function public.set_updated_date()',
      table_name
    );
  end loop;
end $$;

create index if not exists salao_owner_email_idx on public."Salao"(owner_email);
create index if not exists salao_admin_email_idx on public."Salao"(admin_email);
create index if not exists servico_company_id_idx on public."Servico"(company_id);
create index if not exists profissional_company_id_idx on public."Profissional"(company_id);
create index if not exists cliente_company_id_idx on public."Cliente"(company_id);
create index if not exists agendamento_company_data_idx on public."Agendamento"(company_id, data);
create index if not exists lista_espera_company_id_idx on public."ListaEspera"(company_id);
create index if not exists notificacao_company_id_idx on public."Notificacao"(company_id);
create index if not exists pacote_company_id_idx on public."Pacote"(company_id);
create index if not exists pacote_cliente_company_id_idx on public."PacoteCliente"(company_id);

alter table public."Salao" enable row level security;
alter table public."Servico" enable row level security;
alter table public."Profissional" enable row level security;
alter table public."Cliente" enable row level security;
alter table public."Agendamento" enable row level security;
alter table public."ListaEspera" enable row level security;
alter table public."Notificacao" enable row level security;
alter table public."Pacote" enable row level security;
alter table public."PacoteCliente" enable row level security;
alter table public."AppConfig" enable row level security;
alter table public."User" enable row level security;

drop policy if exists "public can read active saloes" on public."Salao";
drop policy if exists "authenticated can manage saloes" on public."Salao";
drop policy if exists "public can read active servicos" on public."Servico";
drop policy if exists "authenticated can manage servicos" on public."Servico";
drop policy if exists "public can read active profissionais" on public."Profissional";
drop policy if exists "authenticated can manage profissionais" on public."Profissional";
drop policy if exists "authenticated can manage clientes" on public."Cliente";
drop policy if exists "public can read agendamentos for availability" on public."Agendamento";
drop policy if exists "public can create agendamentos" on public."Agendamento";
drop policy if exists "authenticated can manage agendamentos" on public."Agendamento";
drop policy if exists "authenticated can manage lista espera" on public."ListaEspera";
drop policy if exists "authenticated can manage notificacoes" on public."Notificacao";
drop policy if exists "authenticated can manage pacotes" on public."Pacote";
drop policy if exists "authenticated can manage pacote cliente" on public."PacoteCliente";
drop policy if exists "authenticated can read app config" on public."AppConfig";
drop policy if exists "authenticated can manage users" on public."User";

create policy "public can read active saloes" on public."Salao" for select using (status <> 'bloqueado');
create policy "authenticated can manage saloes" on public."Salao" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read active servicos" on public."Servico" for select using (ativo = true);
create policy "authenticated can manage servicos" on public."Servico" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read active profissionais" on public."Profissional" for select using (ativo = true);
create policy "authenticated can manage profissionais" on public."Profissional" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can manage clientes" on public."Cliente" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public can read agendamentos for availability" on public."Agendamento" for select using (true);
create policy "public can create agendamentos" on public."Agendamento" for insert with check (true);
create policy "authenticated can manage agendamentos" on public."Agendamento" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated can manage lista espera" on public."ListaEspera" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated can manage notificacoes" on public."Notificacao" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated can manage pacotes" on public."Pacote" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated can manage pacote cliente" on public."PacoteCliente" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated can read app config" on public."AppConfig" for select using (auth.role() = 'authenticated');
create policy "authenticated can manage users" on public."User" for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into public."AppConfig" (app_name, super_admin_emails)
select 'BeautyFlow AI', array[]::text[]
where not exists (select 1 from public."AppConfig");

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

drop policy if exists "public can read uploads" on storage.objects;
drop policy if exists "authenticated can upload files" on storage.objects;
drop policy if exists "authenticated can update own uploads" on storage.objects;
drop policy if exists "authenticated can delete own uploads" on storage.objects;

create policy "public can read uploads"
on storage.objects for select
using (bucket_id = 'uploads');

create policy "authenticated can upload files"
on storage.objects for insert
with check (bucket_id = 'uploads' and auth.role() = 'authenticated');

create policy "authenticated can update own uploads"
on storage.objects for update
using (bucket_id = 'uploads' and auth.role() = 'authenticated')
with check (bucket_id = 'uploads' and auth.role() = 'authenticated');

create policy "authenticated can delete own uploads"
on storage.objects for delete
using (bucket_id = 'uploads' and auth.role() = 'authenticated');
