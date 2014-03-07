# pylint: disable=bad-indentation, missing-docstring, invalid-name
import logging
import json

import dominate
import tornado.websocket
from whirl.tornado_server import *
from dominate.tags import *

logging.basicConfig(
    # filename='carhack.log',
    level=logging.DEBUG,
    format='%(asctime)s : %(levelname)s : %(name)s : %(message)s',
)

log = logging.getLogger()

@get('^/$')
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

class SnakeGame(object):
  def __init__(self):
    self.clients = {}
    self.grid = [[None]*48 for i in xrange(80)]

  def update(self, points):
    for x, y, i in points:
      self.grid[x][y] = i

    for i, client in self.clients.items():
      client.update(points)

  def add(self, client):
    self.clients[id(client)] = client

  def remove(self, client):
    del self.clients[id(client)]
    points = []
    for x in xrange(80):
      for y in xrange(48):
        if self.grid[x][y] == id(client):
          points.append((x, y, None))

    self.update(points)


game = SnakeGame()


class SnakeClient(tornado.websocket.WebSocketHandler):
  def initialize(self):
    self.tail = []

  def open(self):
    game.add(self)
    log.info('new connection')

  def on_message(self, message):
    log.info('message: %r', message)
    data = json.loads(message)
    tail = [(x, y) for x, y in data.get('tail', [])]

    update  = [(x, y, id(self)) for x, y in set(tail) - set(self.tail)]
    update += [(x, y, None)     for x, y in set(self.tail) - set(tail)]

    log.info('update: %r' % update)
    game.update(update)

    self.tail = tail

  def update(self, points):
    data = {'points': [(x, y, i) for x, y, i in points if i != id(self)]}
    self.write_message(json.dumps(data))

  def on_close(self):
    log.info('connection closed')
    game.remove(self)

add_route('^/socket', SnakeClient)



server.add_static_route('^/static/(.*)$', 'static')
server.run()
