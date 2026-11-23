-- Covers the photos.uploaded_by foreign key, so deleting an account does not scan every photo.
create index photos_uploaded_by_idx on public.photos (uploaded_by);
