# Tri-Axium Digital Makefile

.PHONY: dev build start import db

# Development
dev:
	npm run dev

# Build
build:
	npm run build

# Start production server
start:
	npm start

# Install dependencies
install:
	npm install

# Import data to Neo4j
import:
	npx ts-node scripts/import.ts

# Start Neo4j with Docker
db-up:
	docker-compose up -d neo4j

# Stop Neo4j
db-down:
	docker-compose down

# View Neo4j logs
db-logs:
	docker-compose logs -f neo4j

# Start full stack (app + Neo4j)
up:
	docker-compose up -d

# Stop full stack
down:
	docker-compose down

# Reset database (careful!)
db-reset:
	docker-compose down -v
	docker-compose up -d neo4j
	@echo "Waiting for Neo4j to start..."
	sleep 10
	npx ts-node scripts/import.ts
