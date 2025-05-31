### Backend targets ###
# Development
setup_backend:
	cd backend && \
	python3 -m venv venv && \
	source venv/bin/activate && \
	pip install -r requirements.txt && \
	python3 manage.py migrate

# Testing
test_backend: lint_backend unittest_backend

lint_backend:
	cd backend && \
	pylint --load-plugins pylint_django --django-settings-module=backend.settings .

# Coverage targets
unittest_backend:
	cd backend && \
	coverage run --source='.' manage.py test && \
	coverage report --show-missing

coverage_html:
	cd backend && \
	coverage run --source='.' manage.py test && \
	coverage html && \
	echo "Coverage report generated in backend/htmlcov/"

# Cleanup targets
clean_backend:
	cd backend && \
	find . -name "*.pyc" -delete && \
	find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true && \
	rm -rf htmlcov/ .coverage

# Help target
help:
	@echo "Available targets:"
	@echo "  setup_backend     - Setup backend environment"
	@echo "  test_backend      - Run linting and unit tests"
	@echo "  lint_backend      - Run only linting"
	@echo "  unittest_backend  - Run only unit tests"
	@echo "  coverage_html     - Run tests with HTML coverage report"
	@echo "  clean_backend     - Clean up Python cache files"
	@echo "  help              - Show this help message"

.PHONY: test_backend lint_backend unittest_backend coverage_html clean_backend help