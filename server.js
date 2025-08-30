const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'payloads.json');

if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '[]', 'utf8');
}

function serveStatic(req, res) {
  let filePath = '.' + req.url;
  if (filePath === './') filePath = './index.html';
  const ext = path.extname(filePath).toLowerCase();
  const map = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  fs.readFile(path.join(__dirname, filePath), (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': map[ext] || 'text/plain' });
      res.end(content);
    }
  });
}

function logPayload(req, res) {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    try {
      const payload = JSON.parse(data);
      const arr = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
      arr.push({ timestamp: new Date().toISOString(), payload });
      fs.writeFileSync(LOG_FILE, JSON.stringify(arr, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } catch (e) {
      res.writeHead(400);
      res.end('Bad Request');
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/log') {
    logPayload(req, res);
  } else if (req.method === 'GET') {
    serveStatic(req, res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
