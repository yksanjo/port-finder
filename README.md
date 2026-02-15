# Port Finder

Find available ports in a range for your development servers.

## Installation

```bash
cd port-finder
npm install
```

## Usage

### Find available ports

```bash
npm start find
```

### Find next available port

```bash
npm start next 3000
```

### Find port for framework

```bash
npm start framework react-vite
npm start framework nextjs
npm start framework express
```

### List all frameworks

```bash
npm start list
```

### Check specific port

```bash
npm start check 3000
```

## Commands

| Command | Description |
|---------|-------------|
| `find` | Find available ports in range |
| `next <port>` | Find next available port |
| `framework <name>` | Find port for framework |
| `list` | List framework recommendations |
| `check <port>` | Check if port is available |

## Options

- `-s, --start <port>` - Start port
- `-e, --end <port>` - End port
- `-c, --count <number>` - Number of ports to find
