function food(game, x, y) {
  this.game = game;
  this.x = x;
  this.y = y;
  this.value = 1;
  game.add(this);
  game.grid[x][y] = this;
}

food.prototype.tick = function() {

};

food.prototype.remove = function() {
  this.game.grid[this.x][this.y] = null;
  this.game = null;
};

function snake(game, x, y, vx, vy) {
  this.status = snake.ALIVE;
  this.game = game;
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.length = 3;
  this.tail = [[x, y]];
  game.add(this);
  game.grid[x][y] = this;
}

pyy.utils.mix(snake, {
  ALIVE: 1,
  DEAD: 2
});

snake.prototype.tick = function() {
  // console.log([this.x, this.y, this.status]);
  if (this.status == snake.DEAD) { return; }
  var nx = this.x + this.vx;
  var ny = this.y + this.vy;
  if ((nx < 0) || (nx >= this.game.width )) { this.die(); return; }
  if ((ny < 0) || (ny >= this.game.height)) { this.die(); return; }
  cell = this.game.grid[nx][ny];
  if (cell === null) {
    ; // safe;
  } else if (cell instanceof food) {
    this.game.eat(this, cell);
  } else {
    this.die(); return;
  }
  this.x = nx;
  this.y = ny;
  this.game.grid[nx][ny] = this;
  this.tail.push([nx, ny]);
  if (this.tail.length >= this.length) {
    var oxy = this.tail.shift();
    this.game.grid[oxy[0]][oxy[1]] = null;
  }
};

snake.prototype.die = function() {
  this.status = snake.DEAD;

  if (confirm('DEAD! Restart?')) this.reset();
};

snake.prototype.reset = function() {
  this.x = 40;
  this.y = 24;
  this.status = snake.ALIVE;
};

snake.prototype.remove = function() {
  var x, y;
  for (var i=0; i<this.tail.length; i++) {
    var oxy = this.tail[i];
    this.game.grid[oxy[0]][oxy[1]] = null;
  }
  this.status = null;
  this.tail = null;
  this.game = null;
};

snake.prototype.setDeathHandler = function(callback) {
  this.deathEmitter = callback;
};



function snake5(dom) {
  this.dom = dom;
  this.width = 80;
  this.height = 48;
  this.objects = [];
  this.grid = [];
  this.frame = 0;
  for (var x=0; x<this.width; x++) {
    this.grid[x] = [];
    for (var y=0; y<this.height; y++) {
      this.grid[x][y] = null;
    }
  }
  this.spawn_food();
}

snake5.prototype.add = function(obj) {
  this.objects.push(obj);
};

snake5.prototype.remove = function(obj) {
  this.objects.splice(this.objects.indexOf(obj), 1);
  obj.remove();
};

snake5.prototype.tick = function() {
  this.frame++;
  U.foreach(this.objects, function(obj) {
    obj.tick();
  }, this);
  this.render();
};

snake5.prototype.spawn_food = function() {
  var x, y;
  while (1) {
    x = Math.floor(Math.random() * this.width);
    y = Math.floor(Math.random() * this.height);
    if (this.grid[x][y] === null) { break; }
  }
  new food(this, x, y);
};

snake5.prototype.eat = function(snake, food) {
  snake.length += food.value;
  this.remove(food);
  this.spawn_food();
};

snake5.prototype.render = function() {
  var ctx = this.dom.getContext('2d');
  ctx.clearRect(0, 0, this.dom.width, this.dom.height);

  ctx.save();
  ctx.translate(0.1, 0.1);
  ctx.scale(10, -10);
  ctx.translate(0, -this.height);
  for (var x=0; x<this.width; x++) {
    for (var y=0; y<this.height; y++) {
      var cell = this.grid[x][y];
      if (cell === null) {
        continue;
      } else if (cell instanceof food) {
        ctx.fillStyle = '#0000ff';
      } else if (cell instanceof snake) {
        ctx.fillStyle = '#ff0000';
      }
      // ctx.arc(x, y, 1, 0, 2);
      ctx.fillRect(x, y, 0.8, 0.8);
    }
  }
  console.log(0);
  ctx.restore();

};

function server5(game, player) {
  this.game = game;
  this.player = player;
  game.add(this);
  this.connect();
};

server5.prototype.connect = function() {
  this.socket = new WebSocket('ws://' + window.location.host + '/socket');
  var t = this;
  this.socket.onopen    = function(e) { t.onopen(e);      };
  this.socket.onclose   = function(e) { t.onclose(e);     };
  this.socket.onerror   = function(e) { t.onerror(e);     };
  this.socket.onmessage = function(e) { t.onmessage(e);   };
 };

server5.prototype.close = function() {
  this.socket.close();
  this.socket = null;
};

server5.prototype.onopen = function(e) {
  console.log(e);
};

server5.prototype.onclose = function(e) {
  console.log(e);
};

server5.prototype.onerror = function(e) {
  console.log(e);
};

server5.prototype.onmessage = function(e) {
  console.log(e);
  data = JSON.parse(e.data);
  for (var i=0; i<data.points.length; i++) {
    var point = data.points[i];
    var x = point[0];
    var y = point[1];
    var i = point[2];
    this.game.grid[x][y] = i;
  }
};

server5.prototype.tick = function() {
  data = {
    tick: this.game.tick,
    tail: this.player.tail
  };
  this.socket.send(JSON.stringify(data));
};

var game = new snake5(one('.game canvas').dom);
var player1 = new snake(game, 40, 24, 1, 0);
var server = new server5(game, player1);

one(document.body).onkeydown(function(e) {
  console.log(e);
  switch (e.which) {
    case 38:
        player1.vx = 0;
        player1.vy = 1;
        break;
    case 40:
        player1.vx = 0;
        player1.vy =-1;
        break;
    case 37:
        player1.vx =-1;
        player1.vy = 0;
        break;
    case 39:
        player1.vx = 1;
        player1.vy = 0;
        break;
    default:
        break;
  }
});

window.setInterval(function () { game.tick(); }, (60 * 1000/60));