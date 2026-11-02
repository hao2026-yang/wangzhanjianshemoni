/* =========================================================
   视频数据 + 首页卡片渲染 + 播放页填充
   ========================================================= */
window.DY_VIDEOS = [
  { id: "v1",  cat: "food",   title: "探店｜这家藏在二楼的咖啡店，雨天最好坐", dur: "00:06",
    likes: "5.4万", comments: "286", author: "咖啡因研究所", poster: "images/v1.png",
    src: "videos/v1.mp4", tags: "#咖啡 #探店 #雨天" },
  { id: "v2",  cat: "life",   title: "下雨天不出门，就坐在窗边听雨", dur: "00:05",
    likes: "2.1万", comments: "412", author: "下雨天", poster: "images/v2.png",
    src: "videos/v2.mp4", tags: "#治愈 #雨声 #白噪音" },
  { id: "v3",  cat: "travel", title: "城市夜景，随手一拍就是壁纸", dur: "00:08",
    likes: "2185", comments: "96", author: "夜行记录", poster: "images/v3.png",
    src: "videos/v3.mp4", tags: "#城市 #夜景 #航拍" },
  { id: "v4",  cat: "anime",  title: "二次元壁纸分享，这张我用了一整年", dur: "00:06",
    likes: "5.2万", comments: "1304", author: "二次元仓库", poster: "images/v4.png",
    src: "videos/v4.mp4", tags: "#二次元 #壁纸 #插画" },

  { id: "v5",  cat: "animal", title: "猫：这个家没我得散", dur: "00:07",
    likes: "17.9万", comments: "8021", author: "阿团", poster: "images/v5.png",
    src: "videos/v5.mp4", tags: "#猫 #萌宠 #布偶" },
  { id: "v6",  cat: "food",   title: "老板你好！铁板土豆出锅，先吃为敬", dur: "00:05",
    likes: "3.6万", comments: "742", author: "铁板小厨", poster: "images/v6.png",
    src: "videos/v6.mp4", tags: "#美食 #路边摊 #土豆" },
  { id: "v7",  cat: "travel", title: "东京的夜，走到哪都像电影", dur: "00:09",
    likes: "1.7万", comments: "508", author: "东京散步", poster: "images/v7.png",
    src: "videos/v7.mp4", tags: "#旅行 #东京 #街头" },
  { id: "v8",  cat: "travel", title: "雪山脚下的一天，风比想象中大", dur: "00:06",
    likes: "30.4万", comments: "2103", author: "山野", poster: "images/v8.png",
    src: "videos/v8.mp4", tags: "#旅行 #雪山 #高原" },

  { id: "v9",  cat: "music",  title: "弹一首，送给加班到现在的你", dur: "00:07",
    likes: "9.8万", comments: "4521", author: "小满", poster: "images/v9.png",
    src: "videos/v9.mp4", tags: "#音乐 #吉他 #翻唱" },
  { id: "v10", cat: "travel", title: "把日落看完，再回家", dur: "00:05",
    likes: "1.2万", comments: "876", author: "海边老陈", poster: "images/v10.png",
    src: "videos/v10.mp4", tags: "#日落 #海边 #治愈" },
  { id: "v11", cat: "beauty", title: "白开水淡妆，五分钟出门不迟到", dur: "00:06",
    likes: "8.9万", comments: "1203", author: "阿瑶", poster: "images/v11.png",
    src: "videos/v11.mp4", tags: "#美妆 #淡妆 #通勤" },
  { id: "v12", cat: "car",    title: "夜里开车经过江边，只有引擎声", dur: "00:08",
    likes: "2.2万", comments: "418", author: "夜行记录", poster: "images/v12.png",
    src: "videos/v12.mp4", tags: "#汽车 #夜路 #氛围" }
];

/* ---------- 首页：用数据渲染 12 张卡片 ---------- */
(function renderGrid() {
    var grid = document.getElementById("grid");
    if (!grid || !window.DY_VIDEOS) return;

    grid.innerHTML = window.DY_VIDEOS.map(function (v) {
        return '' +
        '<a href="video.html?id=' + v.id + '" class="vcard" data-vid="' + v.id + '" data-cat="' + v.cat + '">' +
        '  <img src="' + v.poster + '" alt="' + v.title + '">' +
        '  <span class="dur">' + v.dur + '</span>' +
        '  <div class="play-mask"><svg class="ico"><use href="#i-play"/></svg></div>' +
        '  <div class="vcard-body">' +
        '    <h3>' + v.title + '</h3>' +
        '    <div class="vcard-stats">' +
        '      <span><svg class="ico"><use href="#i-heart"/></svg>' + v.likes + '</span>' +
        '      <span><svg class="ico"><use href="#i-comment"/></svg>' + v.comments + '</span>' +
        '    </div>' +
        '  </div>' +
        '</a>';
    }).join("");

    /* 悬停静音预览 */
    grid.querySelectorAll(".vcard").forEach(function (card) {
        var id = card.getAttribute("data-vid");
        var item = window.DY_VIDEOS.filter(function (v) { return v.id === id; })[0];
        var video = null;

        card.addEventListener("mouseenter", function () {
            if (video || !item) return;
            video = document.createElement("video");
            video.src = item.src;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = "none";
            video.className = "card-preview";
            card.appendChild(video);
            video.play().catch(function () {});
        });

        card.addEventListener("mouseleave", function () {
            if (!video) return;
            video.pause();
            video.remove();
            video = null;
        });
    });
})();

/* ---------- 播放页：按 ?id= 填充 ---------- */
(function fillWatchPage() {
    if (!document.querySelector(".watch")) return;

    var id = new URLSearchParams(location.search).get("id");
    var item = (window.DY_VIDEOS || []).filter(function (v) { return v.id === id; })[0];

    if (!item) {
        item = {
            title: "最近在剪的一支片子，先放个预告", tags: "#剪辑 #日常",
            author: "心动开机", poster: "images/vi_poster.jpg", src: "images/vi.mp4",
            likes: "1024", comments: "56", dur: "00:09"
        };
    }
    window.DY_CURRENT = item;

    var h2 = document.querySelector(".watch-head h2");
    if (h2) h2.textContent = item.title;

    var tags = document.querySelector(".watch-head .tags");
    if (tags) tags.textContent = item.tags || "";

    var authorEl = document.getElementById("videoAuthor");
    if (authorEl) authorEl.textContent = "@" + (item.author || "心动开机") + " · 刚刚";

    var poster = document.querySelector(".player > img");
    if (poster) poster.src = item.poster;

    var stats = document.querySelectorAll(".watch-stats b");
    if (stats.length >= 2) {
        stats[0].textContent = item.likes;
        stats[1].textContent = item.comments;
    }

    var likeCount = document.getElementById("likeCount");
    if (likeCount) likeCount.textContent = item.likes;

    document.title = item.title + " - 抖音";
})();
