SET search_path TO plantour, public;

begin;

delete from sitemap_urls;

insert into sitemap_urls (url, last_modified, priority, is_active)
values
	('/', now(), 80, true),
	('/packing-list-generator', now(), 70, true),
	('/packing-list-generator/templates', now(), 70, true),
	('/sign-in', now(), 40, true);


commit;