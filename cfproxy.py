import requests
from urllib.parse import urlparse


class CFProxy:
    TOKEN_HEADER = 'Px-Token'
    TOKEN_VALUE = 'mysecuretoken'
    HOST_HEADER = 'Px-Host'
    IP_HEADER = 'Px-IP'

    def __init__(self, proxy_host, ua, fake_ip, proxy=None):
        self.session = requests.Session()
        self.session.proxies.update({'https': proxy,
                                     'http': proxy})
        self.session.headers.update({'User-Agent': ua,
                                     self.TOKEN_HEADER: self.TOKEN_VALUE})
        self.proxy_host = proxy_host
        self.fake_ip = fake_ip

    def get(self, url, **kwargs):
        return self.request('GET', url, **kwargs)

    def post(self, url, **kwargs):
        return self.request('POST', url, **kwargs)

    def request(self, method, url, **kwargs):
        # Gestion des headers
        if 'headers' in kwargs:
            for k, v in kwargs.get('headers'):
                self.session.headers.update({k: v})
            kwargs.pop('headers')
        parsed_uri = urlparse(url)
        self.session.headers.update({self.HOST_HEADER: parsed_uri.hostname})
        self.session.headers.update({self.IP_HEADER: self.fake_ip})
        proxyfied_url = '{0}://{1}{2}'.format(parsed_uri.scheme, self.proxy_host, parsed_uri.path)
        return self.session.request(method, proxyfied_url, **kwargs)
