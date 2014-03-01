from whirl.tornado_server import *
import dominate
from dominate.tags import *


@get('^/$')
@dominate.document(title='SNAKE5')
def index(request):
    doc = dominate.document(title='SNAKE5')
    doc.head += script(src='http://pyy.zkpq.ca/pyy.min.js')
    doc.head += link(rel='stylesheet', href='static/snake5.css')
    with doc:
        with div(id='body'):
            with div(cls='game'):
                    canvas(width="800", height="480")
        script(src='static/snake5.js')


    return doc.render()

server.add_static_route('^/static/(.*)$', 'static')
server.run()