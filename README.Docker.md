# Docker Setup for RAGaaS Frontend

This document explains how to run the RAGaaS frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Building and Running

### Option 1: Using Docker Compose (Recommended)

#### Production Build
```bash
# Build and run the production container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at http://localhost:3000

#### Development Mode
```bash
# Run in development mode with hot reload
docker-compose --profile dev up ragaas-fe-dev

# Stop development container
docker-compose --profile dev down
```

The development server will be available at http://localhost:5173

### Option 2: Using Docker Commands

#### Build the image
```bash
docker build -t ragaas-fe .
```

#### Run the container
```bash
docker run -d -p 3000:3000 --name ragaas-frontend ragaas-fe
```

#### View logs
```bash
docker logs -f ragaas-frontend
```

#### Stop and remove the container
```bash
docker stop ragaas-frontend
docker rm ragaas-frontend
```

## Configuration

### Environment Variables

If you need to pass environment variables to the application, you can:

1. Create a `.env` file in the project root
2. Modify the `docker-compose.yml` to include:
```yaml
env_file:
  - .env
```

3. Or pass them directly in the docker run command:
```bash
docker run -d -p 3000:3000 -e VITE_API_URL=http://your-api.com ragaas-fe
```

### Port Configuration

To change the port mapping, modify the port in:
- `docker-compose.yml`: Change `"3000:3000"` to `"YOUR_PORT:3000"`
- Or in docker run: `-p YOUR_PORT:3000`

## Troubleshooting

### Container won't start
```bash
# Check container logs
docker logs ragaas-frontend

# Check if port is already in use
netstat -ano | findstr :3000
```

### Rebuild after code changes
```bash
# Using docker-compose
docker-compose build --no-cache
docker-compose up -d

# Using docker
docker build --no-cache -t ragaas-fe .
docker run -d -p 3000:3000 --name ragaas-frontend ragaas-fe
```

### Clean up
```bash
# Remove all containers and images
docker-compose down --rmi all

# Or manually
docker stop ragaas-frontend
docker rm ragaas-frontend
docker rmi ragaas-fe
```

## Multi-stage Build

The Dockerfile uses a multi-stage build to:
1. Build the application in a Node.js environment
2. Serve the built static files using a lightweight production server

This results in a smaller final image size and better security.
