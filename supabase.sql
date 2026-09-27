create extension if not exists vector;
create table if not exists conversations (id uuid default gen_random_uuid() primary key, role text check (role in ('user','lulu')) not null, content text not null, channel text default 'whatsapp', created_at timestamptz default now());
create table if not exists memories (id uuid default gen_random_uuid() primary key, category text, content text not null, importance int default 5, created_at timestamptz default now());
create table if not exists reminders (id uuid default gen_random_uuid() primary key, title text not null, event_date timestamptz not null, remind_at timestamptz not null, status text default 'pending', original_text text, created_at timestamptz default now());
create table if not exists tasks (id uuid default gen_random_uuid() primary key, title text not null, done boolean default false, created_at timestamptz default now());
alter table conversations disable row level security;
alter table memories disable row level security;
alter table reminders disable row level security;
alter table tasks disable row level security;
