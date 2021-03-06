Scene = Class({
    elements: [],

    render: function(context) {
        this.elements.each(function() { this.render(context); });
    },

    tick: function() {
        var aliveElements = [];
        this.elements.each(function() { 
            if(this.tick) { this.tick(); } 
        });
        this.elements.each(function() { 
            if(!this.deleted) { aliveElements.push(this); } 
        });
        this.elements = aliveElements;
    },

});


Entity = Class({
    init: function(image) {
        this.image = image;
    },

    render: function(context) {
        context.drawImage(this.image, this.x, this.y);
    }
});

Stats = {
    numComets: 0,
    numUfos: 0
};



Sky = Class({
    skyColor: '#428bca',

    init: function(width, height) {
        this.width = width;
        this.height = height;
    },

    render: function(context) {
        context.fillStyle = this.skyColor;
        context.fillRect(0, 0, this.width, this.height);
    }
});


Telescope = Class({
    x: 325,
    y: 550,
    anchorX: 112,
    anchorY: 35,
    angle: 0,


    init: function() {
        this.image = new Image();
        this.image.src = 'images/telescope.png';
    },

    render: function(context) {
        context.save();
        context.translate(this.x, this.y);
        context.translate(this.anchorX, this.anchorY);
        context.rotate(this.angle);
        context.translate(-this.anchorX, -this.anchorY);
        context.drawImage(this.image, 0, 0);
        context.restore();
    },

    tick:function() {
        //this.angle += 0.02;
    },

    collidesWith: function(x1, y1, x2, y2) {
        return y1 < this.height && x2 > this.x && x1 < this.x + 64; 
    }

});

IcaltLogo = Class(Entity, {
    init: function(scene) {
        this.scene = scene;
        this.image = new Image();
        this.image.src = 'images/icalt.png';
        this.y = 591;
        this.x = 333;
        this.crashSound = new Sound('sound/crash.mp3');
    },

    isHit: function(x, y) {
        return x >= this.x && x <= this.x + 215 
            && y >= this.y && y <= this.y + 100;
    },

    hit: function() {
        this.scene.loseLife();
        //this.crashSound.play();
    }


});

Sound = Class({
    init: function(src, loop) {
        this.src = src;
        this.loop = loop;
    },

    lateInit: function() {
        if(!this.initted) {
            this.initted = true;
            this.elem = document.createElement("audio");
            var srcElem = document.createElement("source"); 
            srcElem.setAttribute("src", this.src)
            srcElem.setAttribute("type", " audio/mp3");
            if(this.loop) {
                this.elem.setAttribute("loop", "loop");
            }   

            this.elem.appendChild(srcElem);
            document.body.appendChild(this.elem);
        }   
    },
    play:  function () {
        this.lateInit();
        var audio = this.elem;
        audio.play();
    },
    stop: function() {
        this.lateInit();
        this.elem.pause();
        this.elem.currentTime = 0; 
    }
});

cometImage = new Image();
cometImage.src = 'images/asteroid.png';
Comet = Class({
    y: 0,
    angle: 0,
    size: 1,

    init: function(x) {
        this.image = cometImage;
        this.x = x;
        var downSpeed = 3 + 2 * Math.random();
        this.angle = Math.random() * 2 * Math.PI;
        this.vangle = Math.random() * 0.03;

        var downAngle = Math.random() * Math.PI / 2 + Math.PI * 0.25;
        this.vy = Math.sin(downAngle) * downSpeed;
        this.vx = Math.cos(downAngle) * downSpeed;
    },

    tick: function() {
        this.y += this.vy;
        this.x += this.vx;
        this.angle += this.vangle;
        var comet = this;
        scene.towns.each(function() {
            if(this.isHit(comet.x, comet.y)) {
                this.hit();
                if(this.hits == 3) { scene.reduceScore(); }
                comet.deleted = true;
            }
        });
    },

    render: function(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(this.image, -8, -8);
        context.restore();
    },

    hit: function() {
        bleepSound.play();
        scene.addScore(this.x, this.y, 25); 
        this.deleted = true;
        Stats.numComets++;
    }

});

var bleepSound = new Sound('sound/bleep.mp3');
ufoImage = new Image();
ufoImage.src = 'images/ufo.png';
bombImage = new Image();
bombImage.src = 'images/bomb.png';

Ufo = Class({ 
    y: 100,
    angle: 0,
    t: 0,
    extraRange: 1000,
    hp: 25,
    size: 45, 

    init: function(cometLayer, difficulty) {
        this.cometLayer = cometLayer;
        this.t = Math.PI * 2 * Math.random();
        var x = -(430 + this.extraRange) * Math.cos(this.t) + 430
        while(x>=-50 && x < 950) {
            this.t = Math.PI * 2 * Math.random();
            x = -(430 + this.extraRange) * Math.cos(this.t) + 430
        }
        if(!difficulty) difficulty = 0.003;
        this.difficulty = difficulty;
    },

    tick: function() {
        this.t += 0.01;
        if(this.extraRange > 0) { this.extraRange--; }
        if(Math.random() < this.difficulty) {
            this.dropBomb();
        }
    },

    render: function(context) {
        var range = 430 + this.extraRange;
        this.x = -range * Math.cos(this.t) + 430

        this.y = 100 + 50 * Math.sin(5 * this.t);
        this.angle = Math.cos(5 * this.t) / 4;
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(ufoImage, -47, -22);
        context.restore();
    },

    dropBomb: function() {
        var comet = new Comet();
        comet.x = this.x;
        comet.y = this.y;
        comet.vy = 3;
        comet.vx = 0;
        comet.image = bombImage;
        this.cometLayer.elements.push(comet);
    },

    hit: function() {
        this.hp --;
        if(this.hp <= 0 && !this.deleted) {
            this.deleted = true;
            scene.addScore(this.x, this.y, 150); 
            Stats.numUfos++;
        }
    }
});

Bullet = Class({
    y: 0,
    previousDistance: 1000000,
    hit: false,
    lineLength: 20,
    bulletSpeed: 15,

    init: function(originX, originY, targetX, targetY) {
        var angle = Math.atan2(targetY - originY, targetX - originX);
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        this.x = originX + 118 * cos;
        this.y = originY + 118 * sin;
        this.x2 = this.x + this.lineLength * cos;
        this.y2 = this.y + this.lineLength * sin;
        this.vx = this.bulletSpeed * cos;
        this.vy = this.bulletSpeed * sin;
        this.targetX = targetX;
        this.targetY = targetY;
    },
    
    tick: function() {
        this.x += this.vx;
        this.y += this.vy;
        this.x2 += this.vx;
        this.y2 += this.vy;
        var dx = this.x - this.targetX;
        var dy = this.y - this.targetY;
        var dist = dx*dx + dy*dy;
        if(dist > this.previousDistance) {
            this.hit = true;
        }
        this.previousDistance = dist;

    },

    render: function(context) {
        context.strokeStyle = 'white';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x2, this.y2);
        context.stroke();
    }
});

BulletLayer = Class({
    elements: [],

    tick: function() {
        var alive = [];
        var bulletLayer = this;
        this.elements.each(function() { 
            this.tick();
            if(!this.hit) { 
                alive.push(this); 
            } else {
                if(bulletLayer.onHit) {
                    bulletLayer.onHit(this.targetX, this.targetY);
                }
            }
        });
        this.elements = alive;
    },

    render: function(context) {
        this.elements.each(function() { this.render(context); });
    },

    addBullet: function(originX, originY, targetX, targetY) {
        var bullet = new Bullet(originX, originY, targetX, targetY);
        this.elements.push(bullet);
    }
});

CometLayer = Class({
    time: 0,
    spawnTime: 100,
    comets: [],
    difficultyTime: 0,
    averageSpawnTime: 8000 / 50, 

    init: function(scene) {
        this.scene = scene;
    },

    tick: function() {
        this.time++;
        if(this.time > this.spawnTime) {
            this.spawnTime = Math.random() * this.averageSpawnTime / 2 + this.averageSpawnTime / 2;
            this.time = 0;
            //this.comets.push(new Comet(Math.floor(Math.random() * 900)));
        }
        this.difficultyTime++;
        if(this.difficultyTime > 100) {
            this.difficultyTime = 0;
            this.averageSpawnTime *= 0.99;
        }

        var scene = this.scene;
        this.comets.each(function() { 
            var comet = this;
            comet.tick();
            scene.towns.each(function() {
                if(this.isHit(comet.x, comet.y)) {
                    this.hit();
                    if(this.hits == 3) { scene.reduceScore(); }
                    comet.x = -1000;
                    comet.y = -1000; //gedveer
                }
            });
         });
        var aliveComets = [];
        this.comets.each(function() { 
            if(this.y >= 0) {
                aliveComets.push(this);
            }
        });
        this.comets = aliveComets;
    },


    render: function(context) {
        this.comets.each(function() { this.render(context); });
    },

});

Explosion = Class({
    radius: 1,

    init: function(x, y, scene) {
        this.x = x;
        this.y = y;
        this.scene = scene;
    },
    
    tick: function() {
        if(this.radius > 0) {
            this.radius += 4.5;
        }
        this.scene.explode(this.x, this.y, this.radius);
    },

    render: function(context) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
        if(this.radius > 45) { this.deleted = true; }
    }
});

var explosionSound = new Sound('sound/explosion2.mp3');
var townImage = new Image();
townImage.src = 'images/town.png';
var townImage2 = new Image();
townImage2.src = 'images/town2.png';
var townImage3 = new Image();
townImage3.src = 'images/town3.png';

var Town = Class(Entity, {
    hits: 0,

    init: function(x, y) {
        this.image = townImage;
        this.x = x;
        this.y = y;
        this.crashSound = new Sound('sound/crash.mp3');
        this.panicSound = new Sound('sound/panic.mp3');
    },

    isHit: function(x, y) {
        return x >= this.x && x <= this.x + 184 
            && y >= this.y && y <= this.y + 74;
    },

    hit: function() {
        this.hits++;
        if(this.hits == 1) {
            this.image = townImage2;
            this.crashSound.play();
        } else if(this.hits == 2) {
            this.image = townImage3;
            this.crashSound.play();
        } else if(this.hits == 3) {
            this.panicSound.play();
            this.render = function() {};
        }
    }
});

Score = Class({
    vy: -0.5,
    ttl: 110,
    init: function(score, x, y) {
        this.score = score;
        this.x = x;
        this.y = y;
    },

    tick: function() {
        this.ttl--;
        this.y += this.vy;
    },
 
    render: function(context) {
        context.fillStyle = 'rgba(255, 255, 255, ' + this.ttl / 110 + ')';
        context.font = '24px sans serif';
        context.fillText('' + this.score, this.x, this.y);
    }
});

ScoreLayer = Class({
    elements: [],

    addScore: function(score, x, y) {
        this.elements.push(new Score(score, x, y));
    },

    tick: function() {
        var alive = [];
        this.elements.each(function() {
            this.tick();
            if(this.ttl >= 0) {
                alive.push(this);
            }
        });
        this.elements = alive;
    },

    render: function(context) {
        this.elements.each(function() {
            this.render(context);
        });
    }
});

ScoreDigit = Class({
    init: function(x, y) {
        this.x = x;
        this.y = y;
        this.movement = 0;
        this.targetDigit = 0;
        this.digit = 0;
        this.digitHeight = 20;
        this.moving = false;
    },

    setDigit: function(digit) {
        var oldDist = this.modDist(this.digit, this.targetDigit);
        var newDist = this.modDist(this.digit, digit);
        this.targetDigit = digit;
        if(!this.moving) {
            this.movement = 0;
        } else {
            this.movement = this.movement * oldDist / newDist;
        }
        this.moving = this.digit != this.targetDigit;
    },

    render: function(context) {
        context.font = '30px serif';
        context.fillStyle = 'white';

        var digitDistance = this.modDist(this.digit, this.targetDigit);
        var digit = (this.movement * digitDistance + this.digit) % 10;
        var currentDigit = Math.floor(digit);
        var nextDigit = Math.ceil(digit);
        var digitMovement = digit - currentDigit;
        var moveY = digitMovement * this.digitHeight;
        
        if(this.moving) {
            context.fillText(nextDigit, this.x, this.y - this.digitHeight + moveY);
        }

        context.fillText(currentDigit, this.x, this.y + moveY);
    },

    modDist: function(a, b) {
        return a < b ? (b - a) : b - a + 10;
    },

    ease: function(t) {
        if(t < 0.5) {
            t *= 2;
            var c = t*t*t*t;
            return c / 2;
        } else {
            t = 2 *t - 2;
            var c = t*t*t*t;
            return 1 - c / 2 ;
        }
    },

    tick: function() {
        if(this.moving) {
            this.movement += 0.02;
            if(this.movement >= 1) {
                this.moving = false;
                this.movement = 0;
                this.digit = this.targetDigit;
            }
        }
    }
});


ScoreBoard = Class({
    digits: [],
    numDigits: 5,

    init: function(x, y) {
        this.x = x;
        this.y = y;
        for(var i = 0; i < this.numDigits; i++) {
            this.digits.push(new ScoreDigit(x + 18 * i, y));
        }
    },

    setScore: function(score) {
        for(var i = this.numDigits - 1; i >= 0; i--) {
            this.digits[i].setDigit(score % 10);
            score = Math.floor(score / 10);
        }
    },

    render: function(context) {
        context.save();
        context.rect(this.x, this.y - 30, 18 * this.numDigits, 30);
        context.clip();
        this.digits.each(function() {
            this.render(context);
        });
        context.restore();
    },

    tick: function() {
        this.digits.each(function() {
            this.tick();
        });
    }
});

var GameOverScene = Class({

    init: function() {
        this.gameOverMusic = new Sound('sound/gameover.mp3', true);
    },

render: function(context) {
    if(this.gameOver) {
        var highscore = window.localStorage.getItem("highscore");
        context.font = '60px sans serif';
        context.fillStyle = 'white';
        context.fillText('Game Over!', 250, 300);
        context.font = '14px sans serif';
        var gameOverText = 'You made a total of ' + this.score + '  points!';
        var gameOverText2 = 'Your highscore is ' + highscore;
        if(this.score >= highscore) {
            gameOverText2 = 'NEW HIGHSCORE!';
            window.localStorage.setItem('highscore', this.score);
        }
        var gameOverText3 = 'Press F5 to restart the game';
        context.fillText(gameOverText, 250, 330);
        context.fillText(gameOverText2, 250, 344);
        context.fillText(gameOverText3, 250, 358);
    }
},

tick: function() {

}, 

setGameOver: function(gameOver, score) {
    this.score = score;
    this.gameOver = gameOver;
    if(this.gameOver) {
        this.gameOverMusic.play();
    } else {
        this.gameOverMusic.stop();
    }
}

});

IcaltCommandScene = Class(Scene, {
    stageWidth: 900,
    stageHeight: 700,
    gameState: 'play',
    score: 0,
    value: 3,
    towns: [],
    life: 1,

    init: function() {
        this.director = new Director(this);
        this.music = new Sound('sound/weekend.mp3', true, 1);
        this.music.play();
        this.laserSound = new Sound("sound/laser.mp3");
        this.stage = document.getElementById('stage');
        this.offsetLeft = this.stage.offsetLeft;
        this.offsetTop = this.stage.offsetTop;
        this.elements.push(new Sky(this.stageWidth, this.stageHeight));
        this.cometLayer = new CometLayer(this);
        this.elements.push(this.cometLayer);
        this.telescope = new Telescope();
        this.elements.push(this.telescope);
        var icaltLogo = new IcaltLogo(this);
        this.elements.push(icaltLogo);
        this.bulletLayer = new BulletLayer();
        this.elements.push(this.bulletLayer);
        this.scoreLayer = new ScoreLayer();
        this.elements.push(this.scoreLayer);
        var town1 = new Town(40, 620);
        var town2 = new Town(700, 620);
        this.elements.push(town1);
        this.elements.push(town2);
        this.towns.push(town1);
        this.towns.push(town2);
        this.towns.push(icaltLogo);
        this.scoreBoard = new ScoreBoard(805, 30);
        this.elements.push(this.scoreBoard);
        this.gameOverScene = new GameOverScene();
        this.elements.push(this.gameOverScene);

        this.bulletLayer.onHit = bind(this.hit, this);

        this.stage.addEventListener("click", bind(this.click, this));
        this.stage.addEventListener('mousemove', bind(this.mousemove, this));
    },

    render: function() {
        Scene.prototype.render.apply(this, [this.stage.getContext('2d')]);
    },

    tick: function() {
        this.director.tick();
        Scene.prototype.tick.apply(this, arguments);
    },

    hit: function(x, y) {
        explosionSound.play();
        this.elements.push(new Explosion(x, y, this));
    },

    explode: function(x, y, radius) {
        var alive = [];
        var scene = this;
        this.elements.each(function() {
            var dx = this.x - x;
            var dy = this.y - y;
            if(dx*dx + dy*dy <= radius*radius + this.size *this.size  && this.hit) {
                bleepSound.play();
                this.hit();
            }
        });
        this.comets = alive;
    },

    loseLife: function() {
        this.life--;
        if(this.life == 0) {
            this.music.stop();
            this.gameOver = true;
            this.gameOverScene.setGameOver(true, this.score);
            scene.goNuts();
        }
    },

    addScore: function(x, y, score) {
        //var score = this.value;
        var score = this.value * score;
        this.scoreLayer.addScore(score, x, y);
        this.score += score;
        this.scoreBoard.setScore(this.score);
    },
    
    reduceScore: function() {
        this.value--;
    },

    mousemove: function(e) {
        var x = e.pageX - this.offsetTop;
        var y = e.pageY - this.offsetTop;
        var angle = Math.atan2(y - 587, x - 432);
        this.telescope.angle = angle;
    },

    click: function(e) {
        if(!this.gameOver) {
            this.laserSound.play();
            var originX = 432;
            var originY = 576;
            var x = e.pageX - this.offsetTop;
            var y = e.pageY - this.offsetTop;
            this.bulletLayer.addBullet(originX, originY, x, y);
        }
    }, 

    goNuts: function() {
        this.director.goNuts();
    }
});


var Director = Class({
    spawnTime: 200,
    time: 0,
    averageSpawnTime: 100, 
    currentLevel: 0,
    ticks: 0,
    
    init: function(scene) { 
        this.scene = scene;
    },

    tick: function() {
        this.time++;
        this.ticks++;
        
        if(this.conditions[this.currentLevel].apply(this)) {
            this.currentLevel++;
            this.levels[this.currentLevel].apply(this);
        }
        
        if(this.time > this.spawnTime) {
            this.spawnTime = Math.random() * this.averageSpawnTime / 2 + this.averageSpawnTime / 2;
            this.time = 0;
            this.scene.elements.push(new Comet(Math.floor(Math.random() * 900)));
        }
    },

    goNuts: function() {
        //this.averageSpawnTime = 10;
        //this.scene.elements.push(new Ufo(this.scene));
        //this.scene.elements.push(new Ufo(this.scene));
        //this.scene.elements.push(new Ufo(this.scene));
    },

    spawnUfo: function(difficulty) {
        this.scene.elements.push(new Ufo(this.scene, difficulty));
    },

    levels: [
        function() {
            this.averageSpawnTime = 100;
        }, function() {
            this.spawnUfo(0.003);
        }, function() {
            Stats.numComets = 0;
            this.averageSpawnTime = 65;
        }, function() {
            this.averageSpawnTime = 100000;
            this.spawnUfo(0.005);
            this.spawnUfo(0.005);
            this.spawnUfo(0.005);
        }, function() {
            this.ticks = 0;
            this.averageSpawnTime = 50;
            this.spawnTime = 200;
        }, function() {
            Stats.numUfos = 0;
            Stats.numComets = 0;
            this.averageSpawnTime = 65;
            this.spawnUfo(0.005);
        }, function() {
            this.spawnUfo(0.003);
            this.spawnUfo(0.003);
        }
    ],

    conditions: [
        function() {
            return Stats.numComets >= 12;
        }, function() {
            return Stats.numUfos >= 1;
        }, function() {
            return Stats.numComets >= 15;
        }, function() {
            return Stats.numUfos >= 4;
        }, function() {
            return this.ticks > 2000;
        }, function() {
            return Stats.numUfos >= 1 && Stats.numComets >= 40;
        }, function() {
            return Stats.numUfos >= 3;
        }, function() {
            return Stats.numUfos >= 10;
        } ]

});
