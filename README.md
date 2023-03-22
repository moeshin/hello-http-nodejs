# Hello HTTP

Build an HTTP server based on the standard library and respond to the request message.

## Usage

```text
Usage: http-hello.js [options]

Options:
  -h <host>
        Listen host.
        If 0.0.0.0 will listen all IPv4 only.
        If :: or [::] will listen all IPv6,
        and you system enable dual-stack socket,
        it may also listen all IPv4.
        (default "127.0.0.1")
  -p <port>
        Listen port.
        If 0 is random.
        (default 8080)
  -m <method>[,<method>...]
        Disallowed methods.
  -d <method>[,<method>...]
        Allowed methods.
  --help
        Print help.
```

Run

```shell
node hello-http.js
```

Hello HTTP output

```text
Listening 127.0.0.1:8080
```

Test with cURL

```shell
curl http://127.0.0.1:8080
```

cURL output

```text
Hello HTTP

GET / HTTP/1.1
Host: 127.0.0.1:8080
User-Agent: curl/7.74.0
Accept: */*

```

Hello HTTP output

```text
GET / HTTP/1.1
```
