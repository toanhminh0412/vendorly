test_backend: lint_backend unitest_backend

lint_backend:
	cd backend && \
	pylint --load-plugins pylint_django --django-settings-module=backend.settings .

unitest_backend:
	cd backend && \
	python manage.py test