import webapp2
import jinja2
import os, urllib2, re, base64, urllib, datetime
from time import gmtime, strftime

from google.appengine.ext import db
from google.appengine.api import images, files, memcache, users

# cache bustin
#
# feel free to clear memcached from the appengine dashboard if you forget to
# bump this
version = '13'

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
                'version': version,
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
                    'version': version,
                    'render_date': strftime("%Y-%m-%d %H:%M:%S", gmtime()),
                    'development': development
                })

            if not memcache.add(memcached_key, homepage, cachetime):
                logging.error('Memcache set failed.')

            self.response.out.write(homepage)

class About(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('about.html')
        self.response.out.write(template.render({
                'title': 'about',
                'version': version,
                'bodyclass': 'about-page'}))

class Gallery(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:

            if users.is_current_user_admin():
                sloths = db.GqlQuery("SELECT * FROM SlothDrawing ORDER BY date DESC LIMIT 100")

                gallery = "<table style='border:none'>"
                for sloth in sloths:
                    gallery += """
                        <tr>
                            <td>
                            <a href="%s">%s</a>
                            </td>
                            <td>
                                <span style="color: #666">%s</span>
                            </td>
                        </tr>
                            """ % (sloth.key().name(), sloth.key().name(), sloth.date)
                gallery += "</table>"
            else:
                gallery = 'email peter to get access to this'

            greeting = ("%s<br>sup %s, (<a href=\"%s\">sign out</a>)" %
                        (gallery, user.nickname(), users.create_logout_url("/")))
        else:
            greeting = ("<a href=\"%s\">Sign in</a>" %
                        users.create_login_url("/gallery"))

        self.response.out.write("<html><body>%s</body></html>" % greeting)


app = webapp2.WSGIApplication([(r'/', MainPage),
                               (r'/draw', Draw),
                               (r'/about', About),
                               (r'/gallery', Gallery),
                               (r'/(\w+)\.png', FetchSloth),
                               (r'/(\w+)', Fetch)],
                              debug=True)
