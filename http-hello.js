const http = require('http');

let aHost = '127.0.0.1';
let aPort = 8080;
/** @type {?Set<string>} */
let aAllowedMethods = null;
/** @type {?Set<string>} */
let aDisallowedMethods = null;

/** @param {String} string */
function parseMethods(string) {
    const methods = new Set();
    for (let s of string.split(',')) {
        s = s.trim();
        if (!s) {
            continue;
        }
        methods.add(s.toUpperCase());
    }
    return methods.size > 0 ? methods : null;
}

function printHelp() {
    let file = process.argv[1];
    if (file.indexOf(' ') > -1) {
        file = `"${file}"`;
    }
    console.log(`Usage: ${file} [options]

Options:
  -h <host>
        Listen host.
        If 0.0.0.0 will listen all IPv4 only.
        If :: or [::] will listen all IPv6,
        and you system enable dual-stack socket,
        it may also listen all IPv4.
        (default "${aHost}")
  -p <port>
        Listen port.
        If 0 is random.
        (default ${aPort})
  -m <method>[,<method>...]
        Disallowed methods.
  -d <method>[,<method>...]
        Allowed methods.
  --help
        Print help.
`);
}

function parseArgs() {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; ++i) {
        const arg = args[i];
        switch (arg) {
            case '--help':
                printHelp();
                process.exit();
                break;
            case '-h':
                aHost = args[++i];
                break;
            case '-p':
                aPort = parseInt(args[++i]);
                break;
            case '-m':
                aAllowedMethods = parseMethods(args[++i]);
                break;
            case '-d':
                aDisallowedMethods = parseMethods(args[++i]);
                break;
            default:
                console.error('Unknown arg: ', arg);
                printHelp();
                process.exit(1);
        }
    }
}


/**
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 */
function handleRequest(request, response) {
    const {method} = request;
    const requestLine = `${method} ${request.url} HTTP/${request.httpVersion}`;
    console.log(requestLine);

    if ((aDisallowedMethods && method in aDisallowedMethods) || (aAllowedMethods && !(method in aAllowedMethods))) {
        response.writeHead(405);
        response.end();
        return;
    }

    if (method === 'HEAD') {
        response.end();
        return;
    }

    let buffers = [Buffer.from(`Hello HTTP\n\n`), Buffer.from(requestLine), Buffer.from('\r\n')];

    request.rawHeaders.forEach((v, i) => {
        buffers.push(Buffer.from(v), Buffer.from(i % 2 === 0 ? ': ' : '\r\n'));
    });

    request.on('data', chunk => {
        buffers.push(chunk);
    }).on('end', () => {
        const data = Buffer.concat(buffers);
        const {length} = data;

        const headers = {
            'Content-Type': 'text/plain',
        };

        if (length > 0) {
            headers['Content-Length'] = length;
        }
        response.writeHead(200, headers);
        response.end(data);
    });
}

parseArgs();

const server = http.createServer(handleRequest);
server.listen({
    host: aHost,
    port: aPort,
    ipv6Only: aHost.startsWith('['),
}, () => {
    const {address, port} = server.address();
    console.log(`Listening ${address.indexOf(':') > -1 ? `[${address}]` : address}:${port}`);
});
