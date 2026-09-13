create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null default current_date,
  type text not null check (type in ('income', 'expense')),
  description text not null check (char_length(trim(description)) between 1 and 120),
  amount numeric(10, 2) not null check (amount > 0 and amount <= 1000000),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.finance_entries enable row level security;

drop policy if exists "Authenticated users can read finance entries" on public.finance_entries;
drop policy if exists "Authenticated users can add finance entries" on public.finance_entries;
drop policy if exists "Authenticated users can delete finance entries" on public.finance_entries;

create policy "Authenticated users can read finance entries"
  on public.finance_entries for select to authenticated using (true);

create policy "Authenticated users can add finance entries"
  on public.finance_entries for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "Authenticated users can delete finance entries"
  on public.finance_entries for delete to authenticated using (true);
