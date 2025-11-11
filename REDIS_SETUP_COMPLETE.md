# Complete Redis Setup Guide - All Operating Systems

## 📋 Table of Contents
1. [macOS Installation](#macos-installation)
2. [Linux (Ubuntu/Debian) Installation](#linux-ubuntudebian-installation)
3. [Linux (CentOS/RHEL/Fedora) Installation](#linux-centosrhelfedora-installation)
4. [Windows Installation](#windows-installation)
5. [Docker Installation (All OS)](#docker-installation-all-os)
6. [Configuration](#configuration)
7. [Testing Redis](#testing-redis)
8. [Project Setup](#project-setup)
9. [Troubleshooting](#troubleshooting)

---

## 🍎 macOS Installation

### Method 1: Using Homebrew (Recommended)

#### Step 1: Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step 2: Install Redis
```bash
brew install redis
```

#### Step 3: Start Redis
```bash
# Start Redis now
brew services start redis

# Or start Redis in foreground (manual mode)
redis-server /usr/local/etc/redis.conf
```

#### Step 4: Verify Installation
```bash
redis-cli ping
# Should return: PONG
```

### Method 2: From Source

```bash
# Download Redis
cd /tmp
curl -O http://download.redis.io/redis-stable.tar.gz

# Extract and build
tar xzvf redis-stable.tar.gz
cd redis-stable
make
sudo make install

# Start Redis
redis-server
```

### Managing Redis on macOS

```bash
# Start Redis
brew services start redis

# Stop Redis
brew services stop redis

# Restart Redis
brew services restart redis

# Check status
brew services list | grep redis
```

---

## 🐧 Linux (Ubuntu/Debian) Installation

### Method 1: APT Package Manager (Recommended)

#### Step 1: Update Package List
```bash
sudo apt update
```

#### Step 2: Install Redis
```bash
sudo apt install redis-server -y
```

#### Step 3: Configure Redis
Edit Redis configuration:
```bash
sudo nano /etc/redis/redis.conf
```

Find and update (for production):
```conf
supervised systemd
```

#### Step 4: Start Redis
```bash
sudo systemctl start redis-server
```

#### Step 5: Enable on Boot
```bash
sudo systemctl enable redis-server
```

#### Step 6: Verify Installation
```bash
redis-cli ping
# Should return: PONG
```

### Method 2: From Source (Latest Version)

```bash
# Install dependencies
sudo apt update
sudo apt install build-essential tcl -y

# Download Redis
cd /tmp
wget http://download.redis.io/redis-stable.tar.gz

# Extract and build
tar xzvf redis-stable.tar.gz
cd redis-stable
make
sudo make install

# Create directories
sudo mkdir /etc/redis
sudo mkdir /var/redis

# Copy configuration
sudo cp utils/redis_init_script /etc/init.d/redis_6379
sudo cp redis.conf /etc/redis/6379.conf

# Create working directory
sudo mkdir /var/redis/6379

# Start Redis
sudo /etc/init.d/redis_6379 start
```

### Managing Redis on Ubuntu/Debian

```bash
# Start Redis
sudo systemctl start redis-server

# Stop Redis
sudo systemctl stop redis-server

# Restart Redis
sudo systemctl restart redis-server

# Check status
sudo systemctl status redis-server

# View logs
sudo journalctl -u redis-server
```

---

## 🎩 Linux (CentOS/RHEL/Fedora) Installation

### Method 1: DNF/YUM Package Manager

#### CentOS/RHEL 8+:
```bash
sudo dnf install redis -y
sudo systemctl start redis
sudo systemctl enable redis
```

#### CentOS/RHEL 7:
```bash
sudo yum install epel-release -y
sudo yum install redis -y
sudo systemctl start redis
sudo systemctl enable redis
```

#### Fedora:
```bash
sudo dnf install redis -y
sudo systemctl start redis
sudo systemctl enable redis
```

### Method 2: From Source

```bash
# Install dependencies
sudo yum install gcc make -y

# Download Redis
cd /tmp
wget http://download.redis.io/redis-stable.tar.gz

# Extract and build
tar xzvf redis-stable.tar.gz
cd redis-stable
make
sudo make install

# Start Redis
redis-server
```

### Managing Redis on CentOS/RHEL/Fedora

```bash
# Start Redis
sudo systemctl start redis

# Stop Redis
sudo systemctl stop redis

# Restart Redis
sudo systemctl restart redis

# Check status
sudo systemctl status redis

# Enable on boot
sudo systemctl enable redis
```

---

## 🪟 Windows Installation

### Method 1: Using WSL2 (Recommended)

#### Step 1: Install WSL2
Open PowerShell as Administrator:
```powershell
wsl --install
```

Restart your computer.

#### Step 2: Install Ubuntu from Microsoft Store
1. Open Microsoft Store
2. Search for "Ubuntu"
3. Install Ubuntu 22.04 LTS

#### Step 3: Install Redis in WSL2
Open Ubuntu terminal:
```bash
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
```

#### Step 4: Verify Installation
```bash
redis-cli ping
# Should return: PONG
```

### Method 2: Windows Native (Using Memurai)

Memurai is a Redis-compatible server for Windows.

#### Step 1: Download Memurai
- Visit: https://www.memurai.com/get-memurai
- Download Memurai Developer Edition (Free)

#### Step 2: Install
- Run the installer
- Follow installation wizard
- Memurai will start automatically as a Windows service

#### Step 3: Verify Installation
Open Command Prompt:
```cmd
memurai-cli ping
```

### Method 3: Docker Desktop (Windows)

See [Docker Installation](#docker-installation-all-os) section below.

### Managing Redis on Windows (WSL2)

```bash
# Start Redis
sudo service redis-server start

# Stop Redis
sudo service redis-server stop

# Restart Redis
sudo service redis-server restart

# Check status
sudo service redis-server status
```

### Managing Memurai on Windows

```powershell
# Start Memurai service
net start Memurai

# Stop Memurai service
net stop Memurai

# Restart Memurai service
net stop Memurai && net start Memurai
```

---

## 🐳 Docker Installation (All OS)

### Prerequisites
Install Docker Desktop:
- **Windows/Mac:** https://www.docker.com/products/docker-desktop
- **Linux:** https://docs.docker.com/engine/install/

### Method 1: Quick Start

```bash
# Pull and run Redis
docker run --name redis -p 6379:6379 -d redis:latest

# Verify Redis is running
docker ps

# Test connection
docker exec -it redis redis-cli ping
# Should return: PONG
```

### Method 2: With Persistent Data

```bash
# Create volume for data persistence
docker volume create redis-data

# Run Redis with volume
docker run --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  -d redis:latest redis-server --appendonly yes
```

### Method 3: Using Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

Start Redis:
```bash
docker-compose up -d
```

### Managing Redis with Docker

```bash
# Start Redis container
docker start redis

# Stop Redis container
docker stop redis

# Restart Redis container
docker restart redis

# View logs
docker logs redis

# Follow logs in real-time
docker logs -f redis

# Access Redis CLI
docker exec -it redis redis-cli

# Remove container
docker rm -f redis

# Remove volume
docker volume rm redis-data
```

---

## ⚙️ Configuration

### Basic Configuration

Edit Redis configuration file:

**macOS (Homebrew):**
```bash
nano /usr/local/etc/redis.conf
```

**Linux:**
```bash
sudo nano /etc/redis/redis.conf
```

### Important Settings

#### 1. Bind Address
```conf
# Listen on all interfaces (development only!)
bind 0.0.0.0

# Listen on localhost only (production recommended)
bind 127.0.0.1
```

#### 2. Password Protection
```conf
# Uncomment and set password
requirepass your_strong_password_here
```

Then update your `config.env`:
```env
REDIS_PASSWORD=your_strong_password_here
```

#### 3. Memory Limit
```conf
# Set max memory (e.g., 256MB)
maxmemory 256mb

# Eviction policy
maxmemory-policy allkeys-lru
```

#### 4. Persistence
```conf
# Save to disk
save 900 1      # After 900 sec if 1 key changed
save 300 10     # After 300 sec if 10 keys changed
save 60 10000   # After 60 sec if 10000 keys changed

# Enable AOF (Append Only File)
appendonly yes
```

### Apply Configuration Changes

**Linux:**
```bash
sudo systemctl restart redis-server
```

**macOS:**
```bash
brew services restart redis
```

**Docker:**
```bash
docker restart redis
```

---

## 🧪 Testing Redis

### Basic Tests

#### 1. Ping Test
```bash
redis-cli ping
# Expected: PONG
```

#### 2. Set and Get
```bash
redis-cli
127.0.0.1:6379> SET test "Hello Redis"
OK
127.0.0.1:6379> GET test
"Hello Redis"
127.0.0.1:6379> exit
```

#### 3. Check Redis Info
```bash
redis-cli INFO
```

### Performance Test

```bash
redis-benchmark -q -n 10000
```

### Check Redis Version

```bash
redis-cli --version
# or
redis-server --version
```

---

## 🚀 Project Setup

### Step 1: Install Node Dependencies

```bash
npm install
```

This will install the `redis` package (already in package.json).

### Step 2: Configure Environment Variables

Your `config/config.env` should have:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

**For production**, update to:
```env
REDIS_HOST=your-redis-server.com
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
```

### Step 3: Start Your Server

```bash
npm run dev
```

You should see:
```
MongoDB connected to : localhost
Redis connecting...
Redis client connected and ready
Server running in development mode on port 3000
```

### Step 4: Test Caching

```bash
# First request (cache miss)
curl http://localhost:3000/api/v1/items

# Second request (cache hit - faster!)
curl http://localhost:3000/api/v1/items
```

Check terminal logs:
- Yellow: `Cache MISS: /api/v1/items`
- Green: `Cache HIT: /api/v1/items`

---

## 🔧 Troubleshooting

### Issue 1: Connection Refused

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**

1. **Check if Redis is running:**
```bash
# Linux
sudo systemctl status redis-server

# macOS
brew services list | grep redis

# Docker
docker ps | grep redis
```

2. **Start Redis:**
```bash
# Linux
sudo systemctl start redis-server

# macOS
brew services start redis

# Docker
docker start redis
```

### Issue 2: Permission Denied

**Error:**
```
(error) NOAUTH Authentication required
```

**Solution:**
Either remove password from Redis config or add to your `config.env`:
```env
REDIS_PASSWORD=your_password
```

### Issue 3: Port Already in Use

**Error:**
```
Address already in use
```

**Solution:**

1. **Find process using port 6379:**
```bash
# Linux/macOS
sudo lsof -i :6379

# Windows
netstat -ano | findstr :6379
```

2. **Kill the process:**
```bash
# Linux/macOS
sudo kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

3. **Or use different port:**
Edit `redis.conf`:
```conf
port 6380
```

Update `config.env`:
```env
REDIS_PORT=6380
```

### Issue 4: Redis Not Persisting Data

**Solution:**

1. **Enable persistence in redis.conf:**
```conf
appendonly yes
save 900 1
```

2. **Restart Redis:**
```bash
sudo systemctl restart redis-server
```

### Issue 5: Memory Issues

**Error:**
```
OOM command not allowed when used memory > 'maxmemory'
```

**Solution:**

Edit `redis.conf`:
```conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

### Issue 6: Slow Performance

**Solutions:**

1. **Check latency:**
```bash
redis-cli --latency
```

2. **Monitor slow queries:**
```bash
redis-cli SLOWLOG GET 10
```

3. **Check memory usage:**
```bash
redis-cli INFO memory
```

### Issue 7: Can't Connect from Remote

**Solution:**

Edit `redis.conf`:
```conf
bind 0.0.0.0
protected-mode no
```

**⚠️ WARNING:** Only for development. For production, use firewall rules!

---

## 📊 Monitoring Redis

### CLI Commands

```bash
# Monitor all commands
redis-cli MONITOR

# Check memory
redis-cli INFO memory

# View all keys
redis-cli KEYS "*"

# Count keys
redis-cli DBSIZE

# Get server stats
redis-cli INFO stats

# Check connected clients
redis-cli CLIENT LIST
```

### GUI Tools

1. **RedisInsight** (Official, Free)
   - Download: https://redis.com/redis-enterprise/redis-insight/

2. **Redis Desktop Manager** (Cross-platform)
   - Download: https://github.com/uglide/RedisDesktopManager

3. **Medis** (macOS only)
   - Download: https://getmedis.com/

---

## 🔒 Production Recommendations

### 1. Enable Authentication
```conf
requirepass very_strong_password_here_123!@#
```

### 2. Bind to Localhost
```conf
bind 127.0.0.1
```

### 3. Disable Dangerous Commands
```conf
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

### 4. Set Memory Limits
```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 5. Enable Persistence
```conf
appendonly yes
appendfsync everysec
```

### 6. Use Redis Sentinel (High Availability)
```bash
redis-sentinel /path/to/sentinel.conf
```

### 7. Use TLS/SSL (Redis 6+)
```conf
tls-port 6380
tls-cert-file /path/to/redis.crt
tls-key-file /path/to/redis.key
```

---

## 🌐 Cloud Redis Services

If you don't want to manage Redis yourself:

### 1. **Redis Cloud** (Official)
- Free tier: 30MB
- URL: https://redis.com/redis-enterprise-cloud/

### 2. **AWS ElastiCache**
- Managed Redis on AWS
- URL: https://aws.amazon.com/elasticache/

### 3. **Azure Cache for Redis**
- Managed Redis on Azure
- URL: https://azure.microsoft.com/en-us/services/cache/

### 4. **Google Cloud Memorystore**
- Managed Redis on Google Cloud
- URL: https://cloud.google.com/memorystore

### 5. **Heroku Redis**
- Free tier: 25MB
- URL: https://elements.heroku.com/addons/heroku-redis

### 6. **Railway**
- Free tier available
- URL: https://railway.app/

---

## 📚 Additional Resources

- **Official Redis Documentation:** https://redis.io/documentation
- **Redis Commands:** https://redis.io/commands
- **Node Redis Client:** https://github.com/redis/node-redis
- **Redis Best Practices:** https://redis.io/docs/manual/patterns/
- **Redis University (Free Courses):** https://university.redis.com/

---

**Setup Complete!** 🎉

Your Lost & Found API now has Redis caching configured for improved performance!
