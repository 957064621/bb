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

// Yes 按钮点击后，进入表白成功页面
yesButton.addEventListener("click", function() {
    document.body.innerHTML = `
        <div class="yes-screen">
            <h1 class="yes-text">!!!陆宇会一直一直喜欢谷婕宝宝!! ( >᎑<)♡︎ᐝ</h1>
            <img src="images/hug.png" alt="拥抱" class="yes-image">
            
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
    
    // 添加音乐控制功能
    setTimeout(() => {
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