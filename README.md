Bypass Cloudflare
=================

## General

Related to my Medium post: [How to bypass Cloudflare bot protection](https://jychp.medium.com/how-to-bypass-cloudflare-bot-protection-1f2c6c0c36fb)

### Detailed operation
* Step 1: You make your request to myproxy.tk, as we will correctly set our domain on CloudFlare, you can come from Tor or a public proxy without blocking.
* Step 2: Your JS worker will forward the request, as you are already in the CloudFlare CDN, your request will be tagged (header + ip coming from CF) so you will bypass the CloudFlare security system

### Important information
As usual, CF adds at least the following headers to your headers:
 * cf-connecting-ip: contains your real original IP
 * x-forwarded-for: IP string containing your original IP
 * and the original IP of the request is a CloudFlare IP
 
When you go through the worker:
 * cf-connecting-ip: contains an IP of CF (probably the server where the Worker is running)
 * cf-worker: your domain name
 * and the original IP of the request is a CloudFlare IP
 
**As you can see, your domain name appears in the headers. However it is a custom header, so few sites will log it or verify it, however beware of OPSEC.**

You will also notice that the x-forwarded-for is not present for a Worker, so you must define it, because a lot of sites (using CF tutorials) use this header instead of cf-connecting-ip to know your IP original.

You will therefore have understood that in addition if the site uses x-forwarded-for you can make the site believe that you come from any IP (nice for bypassing the security linked to the IP).

## Set up
### CloudFlare side
First, you must have a domain for which you can change the DNS servers (a .tk domain works perfectly).

Once your CloudFlare account has been created and your servers configured, you will need to create at least one DNS entry, for example proxy.myproxy.tk to 1.2.3.4 in **proxyfied mode**. The IP is irrelevant because all traffic will be intercepted by the Worker.

Then go to Firewall => Firewall Rules, and add the following rule:
```
Field: Country
Operator: equal to
Value: Tor
Action: ByPass (then select all security rules)
```
You have just authorized any connection coming from Tor to connect to your domain without passing any control (therefore no blocking).

Then go to Workers => Manage Workers => Create a Worker, copy the code from the * worker.js * file into it. **Remember to customize the TOKEN_HEADER, TOKEN_VALUE, HOST_HEADER and IP_HEADER values.**

Now go to Workers => Manage Workers => Add route and configure the route:
```
Itinéraire: proxy.myproxy.tk/*
Worker: your_new_worker
``` 
NB: You can also put `*.myproxy.tk/*` to capture all the subdomains.

Open https://proxy.myproxy.com in your browser, you should see the default page ("Welcome to NGINX!" By default.).

Now you can attempt to modify your "Host" headers and the authent header and you should be able to see the page.


### Python side

Start by installing *requests* if you haven't already.

The script is simplistic, do not hesitate to complete it according to your needs. It will create a requests session, you can then use the get / post methods as with requests.


Example
```python3
>>> from cfproxy import CFProxy
>>> proxy = CFProxy('proxy.myproxy.tk', 'My Fucking User-Agent', '1.2.3.4')
>>> req = proxy.get('https://icanhazip.com')
>>> print(req.status_code)
200
>>> print(req.text)
108.162.229.50

>>> req = proxy.get('https://www.shodan.io')
>>> print(req.status_code)
200
>>> print(req.text)
[...]
```

Be careful, for your GET requests, put your parameters in a dict, and not in the URL:
```python3
# Bad Way
proxy.get('https://domain.tld/index.php?id=1')
# Good Way
payload = {'id': 'mastring qui sera urlencore proprement'}
proxy.get('https://domain.tld/index.php', params=payload)
```
