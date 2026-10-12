console.log('StudioPlus boot', {
  cwd: process.cwd(),
  node: process.version,
  port: process.env.PORT || '',
});

try {
  await import('./server/server.js');
} catch (err) {
  console.error('StudioPlus failed to start:', err);
  const http = await import('node:http');
  const port = Number(process.env.PORT || 8000);
  const message = err?.stack || String(err);
  http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(message);
  }).listen(port, '0.0.0.0', () => {
    console.error(`Error page listening on 0.0.0.0:${port}`);
  });
}
