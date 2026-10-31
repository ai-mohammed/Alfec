// Test-only SMTP sink: accepts every message on SMTP_PORT (default 2525) and exposes them as JSON on
// HTTP_PORT (default 8025): GET /api/messages lists parsed messages, DELETE /api/messages clears them.
import http from 'node:http';
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';

const SMTP_PORT = Number(process.env.SMTP_PORT ?? 2525);
const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8025);
let messages = [];

const smtp = new SMTPServer({
  authOptional: true,
  disabledCommands: ['STARTTLS'],
  logger: false,
  onData(stream, _session, callback) {
    simpleParser(stream)
      .then((mail) => {
        messages.push({
          from: mail.from?.text ?? '',
          to: mail.to?.text ?? '',
          replyTo: mail.replyTo?.text ?? '',
          subject: mail.subject ?? '',
          text: mail.text ?? '',
          html: mail.html || null,
          headers: Object.fromEntries([...mail.headers].map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])),
          attachments: mail.attachments.map((a) => ({ filename: a.filename, contentType: a.contentType, size: a.size })),
        });
        callback();
      })
      .catch(callback);
  },
});
smtp.listen(SMTP_PORT, '127.0.0.1');

http
  .createServer((req, res) => {
    if (req.url === '/api/messages' && req.method === 'DELETE') {
      messages = [];
      res.writeHead(204).end();
      return;
    }
    if (req.url?.startsWith('/api/messages')) {
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(messages));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('smtp sink ok');
  })
  .listen(HTTP_PORT, '127.0.0.1');

console.log(`smtp sink: smtp://127.0.0.1:${SMTP_PORT}, api http://127.0.0.1:${HTTP_PORT}/api/messages`);
