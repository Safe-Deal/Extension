// Host-level network boundary for a verification browser. Chromium sends all traffic through this
// local proxy from its first request, so it covers what Playwright routes miss: requests made before
// routes exist (the install tab) and targets Playwright does not attach to (the action popup).
import http from "node:http";
import net from "node:net";

export const INSTALL_HOST = "api.joinsafedeal.com";
export const ALWAYS_DENIED_HOSTS = ["const.joinsafedeal.com"];

const hostMatches = (host, listed) => host === listed || host.endsWith(`.${listed}`);

export const startGuard = async ({ deniedHosts, record }) => {
  const denied = new Set([...ALWAYS_DENIED_HOSTS, ...deniedHosts]);
  let installHostHeld = true;
  let offline = false;

  const isDeniedHost = (host) => [...denied].some((listed) => hostMatches(host, listed));
  const decide = (host) => {
    if (isDeniedHost(host)) return "denied";
    if (installHostHeld && hostMatches(host, INSTALL_HOST)) return "held";
    if (offline) return "offline";
    return "allowed";
  };

  const seen = new Set();
  const note = (host, decision) => {
    const key = `${host}:${decision}`;
    if (seen.has(key)) return;
    seen.add(key);
    record({ at: new Date().toISOString(), layer: "proxy", host, decision });
  };

  const server = http.createServer((req, res) => {
    const target = new URL(req.url);
    const decision = decide(target.hostname);
    note(target.hostname, decision);
    if (decision !== "allowed") {
      res.writeHead(403).end();
      return;
    }
    const upstream = http.request(
      { host: target.hostname, port: target.port || 80, path: target.pathname + target.search, method: req.method, headers: req.headers },
      (response) => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
      }
    );
    upstream.on("error", () => res.destroy());
    req.pipe(upstream);
  });

  server.on("connect", (req, client, head) => {
    const [host, port] = req.url.split(":");
    const decision = decide(host);
    note(host, decision);
    if (decision !== "allowed") {
      client.end("HTTP/1.1 403 Forbidden\r\n\r\n");
      return;
    }
    const upstream = net.connect(Number(port) || 443, host, () => {
      client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      upstream.write(head);
      upstream.pipe(client);
      client.pipe(upstream);
    });
    upstream.on("error", () => client.destroy());
    client.on("error", () => upstream.destroy());
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  return {
    port: server.address().port,
    deniedHostCount: denied.size,
    isDeniedHost,
    releaseInstallHost: () => {
      installHostHeld = false;
    },
    goOffline: () => {
      offline = true;
    },
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      })
  };
};
