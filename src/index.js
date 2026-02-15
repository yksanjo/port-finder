#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const net = require('net');

const FRAMEWORK_PORTS = {
  'react-vite': [5173, 5174, 5175, 5180],
  'nextjs': [3000, 3001, 3002, 3003],
  'vue': [5173, 8080, 5174],
  'angular': [4200, 4201],
  'express': [3000, 4000, 5000, 8080],
  'fastapi': [8000, 8001, 8080],
  'flask': [5000, 5001, 8000],
  'django': [8000, 8001, 8080],
  'laravel': [8000, 8001],
  'nestjs': [3000, 4000, 5000],
  'spring': [8080, 8081, 8443],
  'rails': [3000, 5000],
  'gatsby': [8000, 8001],
  'hugo': [1313, 1314],
  'aspnet': [5000, 5001, 8080],
  'node': [3000, 4000, 5000, 8080]
};

const program = new Command();

program
  .name('port-finder')
  .description('Find available ports in a range for your development servers')
  .version('1.0.0');

/**
 * Check if port is available
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Find available ports
 */
async function findAvailablePorts(start, end, count) {
  const available = [];
  for (let port = start; port <= end && available.length < count; port++) {
    if (await isPortAvailable(port)) {
      available.push(port);
    }
  }
  return available;
}

program
  .command('find')
  .description('Find available ports in range')
  .option('-s, --start <port>', 'Start port', '3000')
  .option('-e, --end <port>', 'End port', '3100')
  .option('-c, --count <number>', 'Number of ports to find', '5')
  .action(async (options) => {
    const start = parseInt(options.start);
    const end = parseInt(options.end);
    const count = parseInt(options.count);
    
    console.log(chalk.blue(`\n🔍 Finding ${count} available ports between ${start} and ${end}...\n`));
    
    const available = await findAvailablePorts(start, end, count);
    
    if (available.length === 0) {
      console.log(chalk.yellow('No available ports found in range.\n'));
      return;
    }
    
    console.log(chalk.green('✅ Available ports:'));
    console.log();
    
    // Group into rows
    for (let i = 0; i < available.length; i += 8) {
      console.log('  ' + available.slice(i, i + 8).map(p => chalk.cyan(String(p).padEnd(7))).join(' '));
    }
    
    console.log(chalk.gray(`\n   Found ${available.length} port(s)\n`));
  });

program
  .command('next')
  .description('Find next available port starting from a number')
  .argument('<port>', 'Starting port')
  .option('-c, --count <number>', 'Number of ports to find', '1')
  .action(async (port, options) => {
    const start = parseInt(port);
    const count = parseInt(options.count);
    
    console.log(chalk.blue(`\n🔍 Finding next available port(s) from ${start}...\n`));
    
    const available = await findAvailablePorts(start, 65535, count);
    
    if (available.length === 0) {
      console.log(chalk.yellow('No available ports found.\n'));
      return;
    }
    
    if (available.length === 1) {
      console.log(chalk.green(`✅ Next available port: ${chalk.cyan(available[0])}`));
    } else {
      console.log(chalk.green('✅ Available ports:'));
      for (const p of available) {
        console.log(`  ${chalk.cyan(p)}`);
      }
    }
    console.log();
  });

program
  .command('framework')
  .description('Find available port for a framework')
  .argument('<framework>', 'Framework name (react-vite, nextjs, vue, etc.)')
  .action(async (framework) => {
    const normalized = framework.toLowerCase().replace(/[_\-]/g, '-');
    const ports = FRAMEWORK_PORTS[normalized];
    
    if (!ports) {
      console.log(chalk.yellow(`\n⚠️ Unknown framework: ${framework}`));
      console.log(chalk.gray('\nAvailable frameworks:'));
      for (const [name, portList] of Object.entries(FRAMEWORK_PORTS)) {
        console.log(chalk.gray(`  ${name}: ${portList.join(', ')}`));
      }
      console.log();
      return;
    }
    
    console.log(chalk.blue(`\n🔍 Finding available port for ${framework}...\n`));
    console.log(chalk.gray(`   Preferred ports: ${ports.join(', ')}\n`));
    
    for (const port of ports) {
      if (await isPortAvailable(port)) {
        console.log(chalk.green(`✅ Available port: ${chalk.cyan(port)}`));
        console.log();
        return;
      }
    }
    
    // Find any available port near the preferred ones
    const start = ports[0] - 10;
    const available = await findAvailablePorts(Math.max(3000, start), ports[0] + 20, 5);
    
    if (available.length > 0) {
      console.log(chalk.yellow('⚠️ Preferred ports in use. Try:'));
      for (const p of available) {
        console.log(`  ${chalk.cyan(p)}`);
      }
    }
    console.log();
  });

program
  .command('list')
  .description('List framework port recommendations')
  .action(() => {
    console.log(chalk.blue.bold('\n📋 Framework Port Recommendations\n'));
    console.log(chalk.gray('═'.repeat(50)));
    
    for (const [name, ports] of Object.entries(FRAMEWORK_PORTS)) {
      console.log(chalk.cyan(`  ${name.padEnd(12)}`) + chalk.gray(ports.join(', ')));
    }
    
    console.log(chalk.gray('═'.repeat(50)));
    console.log();
  });

program
  .command('check')
  .description('Check if a specific port is available')
  .argument('<port>', 'Port to check')
  .action(async (port) => {
    const portNum = parseInt(port);
    const available = await isPortAvailable(portNum);
    
    if (available) {
      console.log(chalk.green(`\n✅ Port ${portNum} is available\n`));
    } else {
      console.log(chalk.red(`\n❌ Port ${portNum} is in use\n`));
    }
  });

program.parse();
