
ALTER TABLE public.birthday_spins
  ADD COLUMN latitude double precision,
  ADD COLUMN longitude double precision;

ALTER TABLE public.points_transactions
  ADD COLUMN latitude double precision,
  ADD COLUMN longitude double precision;
