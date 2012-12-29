import webapp2
import jinja2
import os, urllib2, re, base64, urllib, datetime
from time import gmtime, strftime

from google.appengine.ext import db
from google.appengine.api import images, files, memcache

version = '3' # cache bustin'

development = False
cachetime = 3600 * 24 * 5
if os.environ.get('SERVER_SOFTWARE').startswith('Development'):
    development = True
    cachetime = 1

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

#
# ((-)_(-))!!!! Thats a sloth by the way!
#

class SlothDrawing(db.Model):
    date = db.DateTimeProperty(auto_now_add=True)
    image = db.BlobProperty()

class Draw(webapp2.RequestHandler):
    def post(self):
        try:
            key = re.sub('[\W_]+', '', self.request.get('key_name'))

            if SlothDrawing.get_by_key_name(key) != None:
                self.response.set_status(409)
                return

            sloth_drawing = SlothDrawing(key_name=key)

            data = str(self.request.get('image'))
            data_to_64 = re.search(r'base64,(.*)', data).group(1)
            decoded = data_to_64.decode('base64')

            sloth_drawing.image = db.Blob(decoded)
            sloth_drawing.put()

            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write('{ "path": "%s" }' % key)

        except Exception, e:
            u_suck = e
            print u_suck

class FetchSloth(webapp2.RequestHandler):
    def get(self, sloth_path):
        memcached_key = '%s-sloth:%s' % (version, sloth_path)
        sloth_image = memcache.get(memcached_key)

        if sloth_image is not None:
            self.response.headers['Content-Type'] = 'image/png'
            self.response.out.write(sloth_image)
        else:

            sloth = SlothDrawing.get_by_key_name(sloth_path)

            if sloth == None:
                self.response.set_status(404)
                self.response.headers['Content-Type'] = 'text/plain'
                self.response.out.write('booourns no sloths here check your url!')
                return

            sloth_image = sloth.image

            if not memcache.add(memcached_key, sloth_image, cachetime):
                logging.error('Memcache set failed.')

            self.response.headers['Content-Type'] = 'image/png'
            self.response.out.write(sloth_image)

class Fetch(webapp2.RequestHandler):
    def get(self, sloth_path):
        memcached_key = '%s-fetch:%s' % (version, sloth_path)

        fetched = memcache.get(memcached_key)

        if fetched is not None:
            self.response.out.write(fetched)
        else:
            sloth = SlothDrawing.get_by_key_name(sloth_path)

            if sloth == None:
                self.response.set_status(404)
                self.response.headers['Content-Type'] = 'text/plain'
                self.response.out.write('booourns no sloths here check your url!')
                return

            # smrt ppl wouldn't hard code this
            # i'm not claiming to be one of them
            share_url_enc = urllib.quote_plus('http://sloths.arerad.com/' +
                sloth_path)

            template = jinja_environment.get_template('fetch.html')
            data = {
                'sloth_path': sloth_path,
                'title': sloth_path,
                'twitter_share_url':
                    'https://twitter.com/share',

                'facebook_share_url':
                    'https://www.facebook.com/sharer/sharer.php?u=' +
                    share_url_enc,

                'email_share_url': share_url_enc,

                'render_date':
                    strftime("%Y-%m-%d %H:%M:%S", gmtime()),

                'development': development
            }

            fetched = template.render(data)

            if not memcache.add(memcached_key, fetched, cachetime):
                logging.error('Memcache set failed.')

            self.response.out.write(fetched)

class MainPage(webapp2.RequestHandler):
    def get(self):
        memcached_key = '%s-homepage' % version
        homepage = memcache.get(memcached_key)
        if homepage is not None:
            self.response.out.write(homepage)
        else:
            template = jinja_environment.get_template('index.html')
            homepage = template.render({
                    'render_date': strftime("%Y-%m-%d %H:%M:%S", gmtime()),
                    'development': development
                })

            if not memcache.add(memcached_key, homepage, cachetime):
                logging.error('Memcache set failed.')

            self.response.out.write(homepage)

class About(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('about.html')
        self.response.out.write(template.render({ 'title': 'about'}))

app = webapp2.WSGIApplication([(r'/', MainPage),
                               (r'/draw', Draw),
                               (r'/about', About),
                               (r'/(\w+)\.png', FetchSloth),
                               (r'/(\w+)', Fetch)],
                              debug=True)
