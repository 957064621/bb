const preloadImages = ['shocked.png', 'think.png', 'angry.png', 'crying.png'];
preloadImages.forEach(img => {
  new Image().src = `./images/${img}`;
});
let yesButton = document.getElementById("yes");
let noButton = document.getElementById("no");
let questionText = document.getElementById("question");
let mainImage = document.getElementById("mainImage");

let clickCount = 0;  // 记录点击 No 的次数

// No 按钮的文字变化
const noTexts = [
    "？你认真的吗…", 
    "要不再想想？", 
    "不许选这个！ ", 
    "我会很伤心…", 
    "不行:("
];

// No 按钮点击事件
noButton.addEventListener("click", function() {
    clickCount++;

    // 让 Yes 变大，每次放大 2 倍
    let yesSize = 1 + (clickCount * 1.2);
    yesButton.style.transform = `scale(${yesSize})`;

    // 挤压 No 按钮，每次右移 100px
    let noOffset = clickCount * 50;
    noButton.style.transform = `translateX(${noOffset}px)`;

    // **新增：让图片和文字往上移动**
    let moveUp = clickCount * 25; // 每次上移 20px
    mainImage.style.transform = `translateY(-${moveUp}px)`;
    questionText.style.transform = `translateY(-${moveUp}px)`;

    // No 文案变化（前 5 次变化）
    if (clickCount <= 5) {
        noButton.innerText = noTexts[clickCount - 1];
    }

    // 图片变化（前 5 次变化）
    if (clickCount === 1) mainImage.src = "images/shocked.png"; // 震惊
    if (clickCount === 2) mainImage.src = "images/think.png";   // 思考
    if (clickCount === 3) mainImage.src = "images/angry.png";   // 生气
    if (clickCount === 4) mainImage.src = "images/crying.png";  // 哭
    if (clickCount >= 5) mainImage.src = "images/crying.png";  // 之后一直是哭

});

// 粒子爱心动画配置和实现
var settings = {
    particles: {
        length: 600,  // 爱心的大小
        duration: 4,  // 爱心扩散速度，越小速度越快
        velocity: 80,  // 爱心扩散速度，越小速度越慢
        effect: -0.3, // 爱心收缩效果，比如：1扩散，-2收缩
        size: 32, // 爱心数量
    },
};

(function () { 
    var b = 0; 
    var c = ["ms", "moz", "webkit", "o"]; 
    for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) { 
        window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"]; 
        window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"] 
    } 
    if (!window.requestAnimationFrame) { 
        window.requestAnimationFrame = function (h, e) { 
            var d = new Date().getTime(); 
            var f = Math.max(0, 16 - (d - b)); 
            var g = window.setTimeout(function () { h(d + f) }, f); 
            b = d + f; 
            return g 
        } 
    } 
    if (!window.cancelAnimationFrame) { 
        window.cancelAnimationFrame = function (d) { clearTimeout(d) } 
    } 
})();

var Point = (function () {
    function Point(x, y) {
        this.x = (typeof x !== 'undefined') ? x : 0;
        this.y = (typeof y !== 'undefined') ? y : 0;
    }
    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    };
    Point.prototype.length = function (length) {
        if (typeof length == 'undefined')
            return Math.sqrt(this.x * this.x + this.y * this.y);
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
    };
    Point.prototype.normalize = function () {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    };
    return Point;
})();

var Particle = (function () {
    function Particle() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
    }
    Particle.prototype.initialize = function (x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
    };
    Particle.prototype.update = function (deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
    };
    Particle.prototype.draw = function (context, image) {
        function ease(t) {
            return (--t) * t * t + 1;
        }
        var size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
    };
    return Particle;
})();

var ParticlePool = (function () {
    var particles,
        firstActive = 0,
        firstFree = 0,
        duration = settings.particles.duration;
    function ParticlePool(length) {
        // create and populate particle pool
        particles = new Array(length);
        for (var i = 0; i < particles.length; i++)
            particles[i] = new Particle();
    }
    ParticlePool.prototype.add = function (x, y, dx, dy) {
        particles[firstFree].initialize(x, y, dx, dy);
        // handle circular queue
        firstFree++;
        if (firstFree == particles.length) firstFree = 0;
        if (firstActive == firstFree) firstActive++;
        if (firstActive == particles.length) firstActive = 0;
    };
    ParticlePool.prototype.update = function (deltaTime) {
        var i;
        // update active particles
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
                particles[i].update(deltaTime);
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
                particles[i].update(deltaTime);
            for (i = 0; i < firstFree; i++)
                particles[i].update(deltaTime);
        }
        // remove inactive particles
        while (particles[firstActive].age >= duration && firstActive != firstFree) {
            firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        }
    };
    ParticlePool.prototype.draw = function (context, image) {
        // draw active particles
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++)
                particles[i].draw(context, image);
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++)
                particles[i].draw(context, image);
            for (i = 0; i < firstFree; i++)
                particles[i].draw(context, image);
        }
    };
    return ParticlePool;
})();

function initHeartAnimation(canvas) {
    var context = canvas.getContext('2d'),
        particles = new ParticlePool(settings.particles.length),
        particleRate = settings.particles.length / settings.particles.duration, // particles/sec
        time;
    
    // get point on heart with -PI <= t <= PI
    function pointOnHeart(t) {
        return new Point(
            160 * Math.pow(Math.sin(t), 3),
            130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
        );
    }
    
    // creating the particle image using a dummy canvas
    var image = (function () {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');
        canvas.width = settings.particles.size;
        canvas.height = settings.particles.size;
        // helper function to create the path
        function to(t) {
            var point = pointOnHeart(t);
            point.x = settings.particles.size / 2 + point.x * settings.particles.size / 350;
            point.y = settings.particles.size / 2 - point.y * settings.particles.size / 350;
            return point;
        }
        // create the path
        context.beginPath();
        var t = -Math.PI;
        var point = to(t);
        context.moveTo(point.x, point.y);
        while (t < Math.PI) {
            t += 0.01; // baby steps!
            point = to(t);
            context.lineTo(point.x, point.y);
        }
        context.closePath();
        // create the fill
        context.fillStyle = '#ea80b0';
        context.fill();
        // create the image
        var image = new Image();
        image.src = canvas.toDataURL();
        return image;
    })();
    
    // render that thing!
    function render() {
        // next animation frame
        requestAnimationFrame(render);
        // update time
        var newTime = new Date().getTime() / 1000,
            deltaTime = newTime - (time || newTime);
        time = newTime;
        // clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // create new particles
        var amount = particleRate * deltaTime;
        for (var i = 0; i < amount; i++) {
            var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
            var dir = pos.clone().length(settings.particles.velocity);
            particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
        }
        // update and draw particles
        particles.update(deltaTime);
        particles.draw(context, image);
    }
    
    // handle (re-)sizing of the canvas
    function onResize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    window.addEventListener('resize', onResize);
    
    // delay rendering bootstrap
    setTimeout(function () {
        onResize();
        render();
    }, 10);
}

// Yes 按钮点击后，进入表白成功页面
yesButton.addEventListener("click", function() {
    document.body.innerHTML = `
        <div class="yes-screen">
            <h1 class="yes-text">
                !!!陆宇会一直一直喜欢谷婕宝宝!! ( >᎑<)♡︎ᐝ <br>
                ❤斯人若彩虹，遇上方知有❤
            </h1>
            <img src="images/hug.png" alt="拥抱" class="yes-image">
            
            <!-- 爱心动画画布 -->
            <canvas id="heartCanvas" class="heart-canvas"></canvas>
            
            <!-- 音乐控制按钮 -->
            <div class="music-controls">
                <button id="musicToggle" class="music-btn">🎵 音乐开</button>
            </div>
            
            <!-- 音乐播放器 -->
            <audio id="successMusic" loop autoplay>
                <source src="music/love-song.mp3" type="audio/mpeg">
                <source src="music/love-song.ogg" type="audio/ogg">
            </audio>
        </div>
    `;

    document.body.style.overflow = "hidden";
    
    // 添加音乐控制功能和爱心动画
    setTimeout(() => {
        // 初始化爱心动画
        const heartCanvas = document.getElementById('heartCanvas');
        if (heartCanvas) {
            initHeartAnimation(heartCanvas);
        }
        
        const music = document.getElementById('successMusic');
        const musicToggle = document.getElementById('musicToggle');
        let isPlaying = true;
        
        // 尝试播放音乐（处理浏览器自动播放策略）
        const playPromise = music.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('音乐开始播放');
                musicToggle.innerHTML = '🎵 音乐开';
            }).catch(error => {
                console.log('自动播放被阻止，需要用户交互');
                isPlaying = false;
                musicToggle.innerHTML = '🎵 音乐关';
            });
        }
        
        // 音乐控制按钮点击事件
        musicToggle.addEventListener('click', function() {
            if (isPlaying) {
                music.pause();
                musicToggle.innerHTML = '🎵 音乐关';
                isPlaying = false;
            } else {
                music.play().then(() => {
                    musicToggle.innerHTML = '🎵 音乐开';
                    isPlaying = true;
                }).catch(error => {
                    console.log('播放失败:', error);
                });
            }
        });
        
        // 监听音乐播放状态
        music.addEventListener('play', () => {
            isPlaying = true;
            musicToggle.innerHTML = '🎵 音乐开';
        });
        
        music.addEventListener('pause', () => {
            isPlaying = false;
            musicToggle.innerHTML = '🎵 音乐关';
        });
        
    }, 100); // 短暂延迟确保DOM元素已创建
});