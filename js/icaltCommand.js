Scene = Class({
    elements: [],

    render: function(context) {
        this.elements.each(function() { this.render(context); });
    },

    tick: function() {
        this.elements.each(function() { if(this.tick) { this.tick(); } });
    },

});

PipeLayer = Class({
    elements: [],
    pipeTimer: 100,

    init: function(sectionImage, topImage, bottomImage) {
        this.sectionImage = sectionImage;
        this.topImage = topImage;
        this.bottomImage = bottomImage;
    },

    render: function(context) {
        this.elements.each(function() { this.render(context); });
    },

    tick: function() {
        this.elements.each(function() { this.tick(); });
        this.pipeTimer++;
        if(this.pipeTimer >= 100) {
            this.pipeTimer = 0;
            this.createPipes();
            this.cleanPipes();
        }
    },

    createPipes: function() {
        var height = Math.round(Math.random() * 450 + 100);

        var pipe = new TopPipe(this.bottomImage, this.sectionImage);
        pipe.height = height;
        this.elements.push(pipe);
        
        var pipe2 = new BottomPipe(this.topImage, this.sectionImage);
        pipe2.height = height + 157;
        this.elements.push(pipe2);
    },

    cleanPipes: function() {
        var filtered = [];
        this.elements.each(function() {
            if(this.x > -70) {
                filtered.push(this);
            }
        });
        this.elements = filtered;
    },

    collidesWith: function(x1, y1, x2, y2) {
        var collides = false;
        this.elements.each(function() {
            if(this.collidesWith(x1, y1, x2, y2)) {
                collides = true;
            }
        });
        return collides;
    },

    scores: function() {
        var scores = false;
        this.elements.each(function() {
            if(this.x < 80 && !this.passed) {
                scores = true;
                this.passed = true;
            }
        });
        return scores;
    }
});

Entity = Class({
    init: function(image) {
        this.image = image;
    },

    render: function(context) {
        context.drawImage(this.image, this.x, this.y);
    }
});


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
        this.crashSound.play();
    }


});

Sound = Class({
    init: function(src) {
        this.src = src;
        this.elem = document.createElement("audio");
        var srcElem = document.createElement("source"); 
        srcElem.setAttribute("src", src)
        srcElem.setAttribute("type", " audio/mp3");
        this.elem.appendChild(srcElem);
        document.body.appendChild(this.elem);
    },
    play:  function () {
        var audio = this.elem;
        audio.play();
    }
});

cometImage = new Image();
cometImage.src = 'images/asteroid.png';
Comet = Class({
    y: 0,
    angle: 0,

    init: function(x) {
        this.x = x;
        var downSpeed = 1 + 1 * Math.random();
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
    },

    render: function(context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(cometImage, -8, -8);
        context.restore();
    }
});

Bullet = Class({
    y: 0,
    previousDistance: 1000000,
    hit: false,
    lineLength: 20,
    bulletSpeed: 8,

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
        this.bleepSound = new Sound('sound/bleep.mp3');
        this.scene = scene;
    },

    tick: function() {
        this.time++;
        if(this.time > this.spawnTime) {
            this.spawnTime = Math.random() * this.averageSpawnTime / 2 + this.averageSpawnTime / 2;
            //console.debug(this.averageSpawnTime * 50 / 1000);
            this.time = 0;
            this.comets.push(new Comet(Math.floor(Math.random() * 900)));
        }
        this.difficultyTime++;
        if(this.difficultyTime > 250) {
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
    },

    render: function(context) {
        this.comets.each(function() { this.render(context); });
    },

    explode: function(x, y, radius) {
        var alive = [];
        var cometLayer = this;
        this.comets.each(function() {
            var dx = this.x - x;
            var dy = this.y - y;
            if(dx*dx + dy*dy > radius*radius) {
                alive.push(this);
            } else {
                cometLayer.bleepSound.play();
                cometLayer.scene.addScore(this.x, this.y); 
            }
        });
        this.comets = alive;
    }
});

Explosion = Class({
    radius: 1,

    init: function(x, y, cometLayer) {
        this.x = x;
        this.y = y;
        this.cometLayer = cometLayer;
    },
    
    tick: function() {
        if(this.radius > 0) {
            this.radius += 2;
        }
        this.cometLayer.explode(this.x, this.y, this.radius);
    },

    render: function(context) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fill();
        if(this.radius > 30) { this.radius = 0; }
    }
});

var ExplosionLayer = Class({
    explosions: [],

    init: function() {
        this.explosionSound = new Sound('sound/explosion2.mp3');
    },

    tick: function() {
        this.explosions.each(function() { this.tick(); });
    },

    render: function(context) {
        this.explosions.each(function() { this.render(context); });
    },

    addExplosion: function(x, y) {
        this.explosionSound.play();
        this.explosions.push(new Explosion(x, y, this.cometLayer));
    }
});

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
        this.moving = true;
        this.setDigit(Math.floor(Math.random() * 10));
    },

    setDigit: function(digit) {
        this.targetDigit = digit;
        this.moving = this.digit != this.targetDigit;
    },

    render: function(context) {
        context.font = '30px serif';
        context.fillStyle = 'white';

        var moveY = this.movement * this.digitHeight;
        
        if(this.moving) {
            context.fillText((this.digit + 1) % 10, this.x, this.y - this.digitHeight + moveY);
        }

        context.fillText(this.digit, this.x, this.y + moveY);
    },

    tick: function() {
        if(this.moving) {
            this.movement += 0.02;
            if(this.movement >= 1) {
                this.movement = 0;
                this.digit = (this.digit + 1) % 10;
                if(this.digit == this.targetDigit) {
                    this.moving = false;
                }
            }
        }
    }
});


ScoreBoard = Class({
    digits: [],
    numDigits: 3,

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

IcaltCommandScene = Class(Scene, {
    stageWidth: 900,
    stageHeight: 700,
    gameState: 'play',
    score: 0,
    value: 3,
    towns: [],
    life: 1,
    highscore: window.localStorage.getItem("highscore"),

    init: function() {

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
        this.explosionLayer = new ExplosionLayer();
        this.elements.push(this.explosionLayer);
        this.scoreLayer = new ScoreLayer();
        this.elements.push(this.scoreLayer);
        var town1 = new Town(40, 620);
        var town2 = new Town(700, 620);
        this.elements.push(town1);
        this.elements.push(town2);
        this.towns.push(town1);
        this.towns.push(town2);
        this.towns.push(icaltLogo);
        

        //this.elements.push(new ScoreDigit(840, 30));
        //this.elements.push(new ScoreDigit(858, 30));
        //this.elements.push(new ScoreDigit(876, 30));
        this.scoreBoard = new ScoreBoard(840, 30);
        this.elements.push(this.scoreBoard);

        this.bulletLayer.onHit = bind(this.hit, this);
        this.explosionLayer.cometLayer = this.cometLayer;

        this.stage.addEventListener("click", bind(this.click, this));
        this.stage.addEventListener('mousemove', bind(this.mousemove, this));
    },

    render: function() {
        Scene.prototype.render.apply(this, [this.stage.getContext('2d')]);
    },

    tick: function() {
        Scene.prototype.tick.apply(this, arguments);
    },

    hit: function(x, y) {
        this.explosionLayer.addExplosion(x, y);
    },

    loseLife: function() {
        this.life--;
        if(this.life == 0) {
            alert("Game over. Your score is " + this.score);
        }
    },

    addScore: function(x, y) {
        var score = this.value;
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
        this.laserSound.play();
        var originX = 432;
        var originY = 576;
        var x = e.pageX - this.offsetTop;
        var y = e.pageY - this.offsetTop;
        this.bulletLayer.addBullet(originX, originY, x, y);
    }


});
