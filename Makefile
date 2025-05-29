lint_backend:
	cd backend && \
	pylint --load-plugins pylint_django --django-settings-module=backend.settings .
