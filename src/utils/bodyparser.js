export default function bodyparser(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    callback(JSON.parse(body));
  });
}
