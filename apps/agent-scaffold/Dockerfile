# Use a lightweight Python base image
FROM python:3.11-slim

# Set environment variables
ENV ANTHROPIC_API_KEY=""
ENV NODE_VERSION=20.x

# Install system dependencies
# - curl: for installing node
# - git: for the agent to use git tools
# - build-essential: for compiling some python/node packages if needed
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (Latest LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set up the agent directory
WORKDIR /agent

# Initialize package.json and install dependencies locally
RUN npm init -y && \
    npm install @anthropic-ai/claude-agent-sdk tsx typescript @types/node

# Copy the agent scaffold source code
COPY . /agent

# Create a working directory for the user's project
WORKDIR /app

# The entrypoint will be defined by the runner, but we can set a default
CMD ["/bin/bash"]
