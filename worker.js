addEventListener('fetch', event => {
  event.respondWith(forwardReq(event.request))
})

const TOKEN_HEADER = 'Px-Token'
const TOKEN_VALUE = 'mysecuretoken'
const HOST_HEADER = 'Px-Host'
const IP_HEADER = 'Px-IP'

async function forwardReq(request) {
  if (request.headers.get(TOKEN_HEADER) != TOKEN_VALUE) {
    return new Response("Welcome to nginx!")
  }

  let newHdrs = new Headers()
  for (const [key, value] of request.headers) {
    if (key.toLowerCase() == TOKEN_HEADER.toLowerCase()) {
        continue;
    }
    if (key.toLowerCase() == HOST_HEADER.toLowerCase()) {
        continue;
    }
    if (key.toLowerCase() == IP_HEADER.toLowerCase()) {
        continue;
    }
    if (key.toLowerCase().startsWith('cf-')) {
        continue;
    }
    if (key.toLowerCase() == 'x-forwarded-for') {
        continue;
    }
    if (key.toLowerCase() == 'x-real-ip') {
        continue;
    }
    newHdrs.set(key, value)
  }
  newHdrs.set('Host', request.headers.get(HOST_HEADER))
  newHdrs.set('X-Forwarded-For', request.headers.get(IP_HEADER))

  let address = ''
  const url = new URL(request.url)
  address = request.url.replace(url.hostname, request.headers.get(HOST_HEADER))


  const init = {
    body: request.body,
    headers: newHdrs,
    method: request.method
  }

  let response = await fetch (address, init);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText
  })
}
