// The Build Output API's Node launcher passes a Node HTTP request and response.
export function nodeHandler(methods) {
  return async function serve(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const method = req.method;
    if (!Object.hasOwn(methods, method)) {
      res.setHeader('Allow', Object.keys(methods).join(', '));
      res.writeHead(405).end();
      return;
    }

    // The host seen by Vercel selects this deployment, including unique preview aliases.
    // Origin is supplied independently by the browser and checked inside the endpoint.
    const requestUrl = new URL(`https://${req.headers.host}`);
    const path = new URL(req.url, requestUrl);
    requestUrl.pathname = path.pathname;
    requestUrl.search = path.search;
    const options = { method, headers: req.headers };
    if (method === 'POST') {
      options.body = req;
      options.duplex = 'half';
    }
    const response = await methods[method](new Request(requestUrl, options));
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  };
}
