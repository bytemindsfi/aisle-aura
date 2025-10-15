create table if not exists users (
    id bigint primary key not null,
    firstName text not null,
    lastName text not null,
    email text not null,
    agreeToTerms boolean not null,
    createdAt timestamptz default now(),
    updatedAt timestamptz default now()
    )