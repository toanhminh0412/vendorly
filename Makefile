### Backend targets ###
# Development
setup_backend:
	cd backend && \
	python3 -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt && \
	python3 manage.py migrate
	@echo "Backend setup complete. Virtual environment created in backend/venv. Run 'source backend/venv/bin/activate' to activate it."

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

### Frontend targets ###
# Development
setup_frontend:
	cd frontend && \
	npm ci --legacy-peer-deps
	@echo "Frontend setup complete. Dependencies installed."

# Testing
test_frontend:
	@echo "Running frontend linting..."
	-$(MAKE) lint_frontend
	@echo "Running frontend unit tests..."
	$(MAKE) unittest_frontend

lint_frontend:
	cd frontend && \
	npm run lint

unittest_frontend:
	cd frontend && \
	npm test -- --watchAll=false --coverage

# Cleanup targets
clean_frontend:
	cd frontend && \
	rm -rf node_modules/ coverage/ .next/

# Help target
help:
	@echo "Available targets:"
	@echo "Backend:"
	@echo "  setup_backend     - Setup backend environment"
	@echo "  test_backend      - Run linting and unit tests"
	@echo "  lint_backend      - Run only linting"
	@echo "  unittest_backend  - Run only unit tests"
	@echo "  coverage_html     - Run tests with HTML coverage report"
	@echo "  clean_backend     - Clean up Python cache files"
	@echo ""
	@echo "Frontend:"
	@echo "  setup_frontend    - Setup frontend environment"
	@echo "  test_frontend     - Run linting and unit tests"
	@echo "  lint_frontend     - Run only linting"
	@echo "  unittest_frontend - Run only unit tests"
	@echo "  clean_frontend    - Clean up node modules and build files"
	@echo ""
	@echo "  help              - Show this help message"

.PHONY: test_backend lint_backend unittest_backend coverage_html clean_backend setup_frontend test_frontend lint_frontend unittest_frontend clean_frontend help