var myObstacles = [];
var myMusic;
var myscore;
var myovers;
var myscores;
var myscorec;
var mybackground;
var myGamePiece;
var mysound;
var mypos;
var myposs;
var mybullet;
var mybulletspeed;
var mybullet1;
var mybulletsound;
var mycoin;
var mycs;
var coinscore = 0;
var zeros;
var mycsl;
var myGamePiece;
var ufo;

function startGame() {
    setTimeout(function() {
        myGamePiece = new component(200, 150, "/games/android/space-fire/rockets/rocket13.png", 90, 420, "image");
        mybackground = new component(1200, 900, "/assets/images/backgrounds/02.webp", 0, 0, "background");
        myMusic = new sound("/assets/music/Recording.m4a");
        mysound = new sound("/assets/music/ACRON.mp3");
        myscore = new component("20px", "JetBrains Mono", "#ccc", 1075, 60, "text");
        myovers = new component("110px", "JetBrains Mono", "#ff0040", 300, 440, "text");
        myscores = new component("45px", "JetBrains Mono", "#ccc", 400, 510, "text");
        mycs = new component("20px", "JetBrains Mono", "#ccc", 1000, 60, "text");
        mypos = this.x;
        myposs = this.y;
        mybulletsound = new sound("/assets/music/bullet.mp3");
        mycoin = new component(30, 30, "/games/android/space-fire/coin.png", Math.floor((Math.random() * 1400) + 1), Math.floor((Math.random() * 600) + 1), "image");
        mybullet = new component(20, 10, "/games/android/space-fire/trail.png", myGamePiece.x, myGamePiece.y + 37, "image");
        mybullet1 = new component(20, 10, "/games/android/space-fire/trail.png", myGamePiece.x + 30, myGamePiece.y + 37, "image");
        coinscore = 0;
        zeros = 1;
        mycsl = new component("25px", "JetBrains Mono", "#ccc", 470, 560, "text");
        myGameArea.start();
    }, 1500);
}
var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = 1200;
        this.canvas.height = 900;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 1;
        this.interval = setInterval(updateGameArea, 5);
        window.addEventListener('keydown', function(e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', function(e) {
            myGameArea.keys[e.keyCode] = false;
        });
        window.addEventListener('touchmove', function(e) {
            myGameArea.x = e.touches[0].screenX;
            myGameArea.y = e.touches[0].screenY;
        });
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function() {
        clearInterval(this.interval);
        myGameArea.clear();
        myovers.text = "GAME OVER";
        myovers.update();
        myscores.text = "YOUR SCORE: " + myGameArea.frameNo;
        myscores.update();
        mycsl.text = "COINS COLLECTED:" + coinscore;
        mycsl.update();
        var retry = document.querySelector("canvas");
    },
    nextlevel: function() {
        clearInterval(this.interval);
        myGameArea.clear();
        myovers.text = "LEVEL 1 COMPLETE";
        myovers.update();
        myscores.text = "YOU SCORE: " + myGameArea.frameNo;
        myscores.update();
        mycsl.text = "COINS:" + coinscore;
        mycsl.update();
        myGameArea.start();
        var x = document.getElementById("back");
        x.textContent = "BACK";
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    if (type == "image" || type == "background") {
        this.image = new Image();
        this.image.src = color;
    }
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        }
        if (type == "image" || type == "background") {
            ctx.drawImage(this.image,
                this.x,
                this.y,
                this.width, this.height);
            if (type == "background") {
                ctx.drawImage(this.image,
                    this.x + this.width,
                    this.y,
                    this.width, this.height);
            }
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.type == "background") {
            if (this.x == -(this.width)) {
                this.x = 0;
            }
        }
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            mysound.stop();
            myMusic.play();
            myGameArea.stop();
            return;
        }
    }
    myGameArea.clear();
    mybackground.speedX = -1;
    myGamePiece.speedX = 0;
    mybackground.newPos();
    mybackground.update();
    mysound.play();
    mycoin.newPos();
    mycoin.update();
    myGamePiece.newPos();
    myGamePiece.update();
    myscore.text = "SCORE: " + myGameArea.frameNo;
    myscore.update();
    mycs.text = "COINS: " + coinscore;
    mycs.update();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(550)) {
        x = myGameArea.canvas.width;
        minHeight = 75;
        maxHeight = 550;
        height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        minGap = 200;
        maxGap = 500;
        gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new component(25, height, "/games/android/space-fire/asteriod.png", x, 0, "image"));
        myObstacles.push(new component(25, x - height - gap, "/games/android/space-fire/asteriod2.png", x, height + gap, "image"));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }

    function fire() {
        mybullet = new component(20, 10, "/games/android/space-fire/trail.png", myGamePiece.x, myGamePiece.y + 37, "image");
        mybullet1 = new component(20, 10, "/games/android/space-fire/trail.png", myGamePiece.x + 30, myGamePiece.y + 37, "image");
        mybullet.speedX = 6;
        mybullet1.speedX = 6;
        mybulletsound.play();
        setTimeout(() => {
            mybulletsound.stop();
        }, 200);
    }
    if (myGameArea.keys && myGameArea.keys[32]) {
        fire()
    }

    if (myGameArea.keys && myGameArea.keys[37]) {
        myGamePiece.speedX -= -1;
    }
    if (myGameArea.keys && myGameArea.keys[39]) {
        myGamePiece.speedX = 1;
    }
    if (myGameArea.keys && myGameArea.keys[38]) {
        myGamePiece.speedY = -1;
    }
    if (myGameArea.keys && myGameArea.keys[40]) {
        myGamePiece.speedY = 1;
    }
    mybullet.newPos();
    mybullet.update();
    mybullet1.newPos();
    mybullet1.update();
    if (mybullet1.x == mycoin.x) {
        if (mybullet1.y <= (mycoin.y + 100) || (mybullet1.y == mycoin.y)) {
            if (mybullet1.y >= (mycoin.y - 120) || (mybullet1.y == mycoin.y)) {
                coinscore += zeros;
                mycoin = new component(30, 30, "games/android/space-fire/coin.png", Math.floor((Math.random() * 1200) + 1), Math.floor((Math.random() * 600) + 1), "image");
            }
        }
    }
    //Touchscreen
    if (myGameArea.x && myGameArea.y) {
        myGamePiece.x = 2.5 * myGameArea.x;
        myGamePiece.y = myGameArea.y;
    }
    myGamePiece.update()
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    this.sound.loop = false;
    document.body.appendChild(this.sound);
    this.play = function() {
        this.sound.play();
    }
    this.stop = function() {
        this.sound.pause();
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {
        return true;
    }
    return false;
}

function clearmove() {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}

function change() {

}

function windowClose() {
    window.open('', '_parent', '');
    window.close();
}


function stopMove() {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
}

function moveUp() {
    myGamePiece.speedY -= 2;
}

function moveDown() {
    myGamePiece.speedY += 2;
}

function moveLeft() {
    myGamePiece.speedX -= 2;
}

function moveRight() {
    myGamePiece.speedX += 2;
}