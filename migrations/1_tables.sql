create table categories (
  id integer primary key not null,
  name text not null
);

create table transactions (
  id integer primary key not null,
  category_id integer not null,
  date text not null,
  amount integer not null,
  foreign key(category_id) references categories(id)
);
