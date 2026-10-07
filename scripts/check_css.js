const http = require('http');

http.get('http://localhost:3005/', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const matches = html.match(/<link[^>]+>/g);
    console.log('All link tags:', matches);
  });
});
