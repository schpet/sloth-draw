import webapp2
import jinja2
import os, urllib2, re, base64

from google.appengine.ext import db
from google.appengine.api import images, files

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
        sloth = SlothDrawing.get_by_key_name(sloth_path)

        if sloth == None:
            self.response.set_status(404)
            self.response.headers['Content-Type'] = 'text/plain'
            self.response.out.write('booourns no sloths here check your url!')
            return

        self.response.headers['Content-Type'] = 'image/png'
        self.response.out.write(sloth.image)

class Fetch(webapp2.RequestHandler):
    def get(self, sloth_path):
        template = jinja_environment.get_template('fetch.html')
        self.response.out.write(template.render({'sloth_path': sloth_path}))

class MainPage(webapp2.RequestHandler):
    def get(self):
        template = jinja_environment.get_template('index.html')
        self.response.out.write(template.render({}))

app = webapp2.WSGIApplication([(r'/', MainPage),
                               (r'/draw', Draw),
                               (r'/(\w+)\.png', FetchSloth),
                               (r'/(\w+)', Fetch)],
                              debug=True)
