/* =========================================================
   抖音仿站 · 交互脚本
   ========================================================= */
(function () {
    "use strict";

    function $(s, c) { return (c || document).querySelector(s); }
    function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

    /* ============ 通用：轻提示 ============ */
    var toastBox = null;
    function toast(msg) {
        if (!toastBox) {
            toastBox = document.createElement("div");
            toastBox.className = "toast-box";
            document.body.appendChild(toastBox);
        }
        var el = document.createElement("div");
        el.className = "toast";
        el.textContent = msg;
        toastBox.appendChild(el);
        requestAnimationFrame(function () { el.classList.add("show"); });
        setTimeout(function () {
            el.classList.remove("show");
            setTimeout(function () { el.remove(); }, 280);
        }, 2100);
    }

    /* ============ 通用：弹窗 ============ */
    function modal(opts) {
        var mask = document.createElement("div");
        mask.className = "modal-mask open";
        mask.innerHTML =
            '<div class="modal">' +
            '  <div class="modal-head"><h3></h3><button class="modal-x" type="button">×</button></div>' +
            '  <div class="modal-body"></div>' +
            '  <div class="modal-foot">' +
            '    <button class="btn-soft" type="button">取消</button>' +
            '    <button class="btn-main" type="button"></button>' +
            '  </div>' +
            '</div>';

        mask.querySelector("h3").textContent = opts.title || "提示";
        mask.querySelector(".modal-body").innerHTML = opts.body || "";
        mask.querySelector(".btn-main").textContent = opts.confirmText || "确定";
        document.body.appendChild(mask);

        function close() { mask.remove(); }
        mask.querySelector(".modal-x").addEventListener("click", close);
        mask.querySelector(".btn-soft").addEventListener("click", close);
        mask.addEventListener("click", function (e) { if (e.target === mask) close(); });
        mask.querySelector(".btn-main").addEventListener("click", function () {
            if (opts.onConfirm && opts.onConfirm(mask) === false) return;
            close();
        });

        if (opts.onOpen) opts.onOpen(mask);
        return mask;
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { toast("链接已复制"); },
                function () { toast("复制失败，请手动选择"); });
        } else {
            var input = document.createElement("textarea");
            input.value = text;
            document.body.appendChild(input);
            input.select();
            try { document.execCommand("copy"); toast("链接已复制"); } catch (e) { toast("请手动复制"); }
            input.remove();
        }
    }

    /* ============ 1. 分类筛选 ============ */
    var cats = $("#cats");
    var grid = $("#grid");

    if (cats) {
        cats.addEventListener("click", function (e) {
            var btn = e.target.closest(".cat");
            if (!btn) return;
            e.preventDefault();

            $$(".cat", cats).forEach(function (c) { c.classList.remove("active"); });
            btn.classList.add("active");

            var cat = btn.getAttribute("data-cat");
            if (!grid) { toast("已切换到「" + btn.textContent + "」"); return; }

            var visible = 0;
            $$(".vcard", grid).forEach(function (card) {
                var ok = cat === "all" || card.getAttribute("data-cat") === cat;
                card.style.display = ok ? "" : "none";
                if (ok) visible++;
            });

            if (cat !== "all" && visible === 0) {
                $$(".vcard", grid).forEach(function (c) { c.style.display = ""; });
                toast("「" + btn.textContent + "」暂时没有内容，先看看全部");
            } else {
                toast("已筛选：" + btn.textContent + "（" + visible + " 个视频）");
            }
        });
    }

    /* ============ 2. 播放 / 暂停 ============ */
    var hero = $(".hero");
    var playBtn = $(".hero-play");
    var bar = $(".hero-progress i") || $(".player-bar .progress i");
    var timeLabel = $(".hero-bar span") || $("#playTime");
    var timer = null;
    var progress = 24;
    var mountedVideo = null;
    var mountedPoster = null;

    function fmt(sec) {
        var m = Math.floor(sec / 60), s = Math.round(sec % 60);
        return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    }

    function paint() {
        if (bar) bar.style.width = progress + "%";
        if (timeLabel) {
            var total = window.__videoTotal || 575;
            timeLabel.textContent = fmt(total * progress / 100) + " / " + fmt(total);
        }
    }

    function stop() {
        if (timer) { clearInterval(timer); timer = null; }
        if (playBtn) {
            playBtn.style.opacity = "";
            playBtn.style.pointerEvents = "";
            playBtn.classList.remove("is-playing");
        }
    }

    if (playBtn) {
        playBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (timer) { stop(); toast("已暂停"); return; }

            playBtn.style.opacity = "0";
            playBtn.style.pointerEvents = "none";
            playBtn.classList.add("is-playing");
            timer = setInterval(function () {
                progress = Math.min(100, progress + 0.6);
                paint();
                if (progress >= 100) { stop(); progress = 0; paint(); toast("播放结束，自动重播"); }
            }, 500);
            toast("开始播放");
        });

        var stage = $(".player") || hero;
        if (stage) {
            stage.addEventListener("click", function (e) {
                if (e.target.closest(".hero-play")) return;
                if (timer) { stop(); toast("已暂停"); }
            });
        }
    }

    /* ============ 3. 点赞 / 收藏 / 分享 ============ */
    var likeBtn = $("#likeBtn");
    if (likeBtn) {
        var likeCount = $("#likeCount");
        likeBtn.addEventListener("click", function () {
            var on = likeBtn.classList.toggle("on");
            var n = parseInt(likeCount.textContent, 10) || 0;
            likeCount.textContent = on ? n + 1 : n - 1;
            toast(on ? "已点赞，感谢喜欢" : "已取消点赞");
        });
    }

    var favBtn = $("#favBtn");
    if (favBtn) {
        favBtn.addEventListener("click", function () {
            favBtn.classList.toggle("on");
            var on = favBtn.classList.contains("on");
            favBtn.querySelector("span").textContent = on ? "已收藏" : "收藏";
            toast(on ? "已收藏到「我的收藏」" : "已取消收藏");
        });
    }

    var shareBtn = $("#shareBtn");
    if (shareBtn) {
        shareBtn.addEventListener("click", function () {
            modal({
                title: "分享视频",
                body: '<p>复制下面的链接，发给朋友就能打开：</p>' +
                      '<input type="text" readonly value="' + location.href + '">',
                confirmText: "复制链接",
                onOpen: function (m) {
                    var input = m.querySelector("input");
                    input.addEventListener("click", function () { input.select(); });
                },
                onConfirm: function (m) {
                    copyText(m.querySelector("input").value);
                }
            });
        });
    }

    /* ============ 4. 评论点赞 ============ */
    function bindCommentLike(btn) {
        btn.addEventListener("click", function () {
            var on = btn.classList.toggle("on");
            var span = btn.querySelector("span");
            var n = parseInt(span.textContent, 10) || 0;
            span.textContent = on ? n + 1 : n - 1;
        });
    }
    $$(".c-like").forEach(bindCommentLike);

    /* ============ 5. 发表评论 ============ */
    var input = $("#commentInput");
    var sendBtn = $("#sendBtn");
    var list = $("#commentList");
    var counter = $("#charCount");
    var MAX = 50;

    if (input && counter) {
        input.addEventListener("input", function () {
            var left = MAX - input.value.length;
            counter.textContent = left >= 0 ? "还可以输入 " + left + " 字" : "已超出 " + (-left) + " 字";
            counter.style.color = left >= 0 ? "" : "#fe2c55";
        });
    }

    function post() {
        if (!input || !list) return;
        var text = input.value.trim();
        if (!text) { input.focus(); toast("说点什么再发送吧"); return; }
        if (text.length > MAX) { toast("评论不能超过 " + MAX + " 字"); return; }

        var item = document.createElement("div");
        item.className = "comment";
        item.innerHTML =
            '<div class="ava" style="background:#fe2c55">我</div>' +
            '<div class="c-body">' +
            '  <p class="c-name">我</p>' +
            '  <p class="c-text"></p>' +
            '  <div class="c-meta"><span>刚刚</span><span>本地</span></div>' +
            '</div>' +
            '<button class="c-like" type="button"><svg class="ico"><use href="#i-heart"/></svg><span>0</span></button>';
        item.querySelector(".c-text").textContent = text;
        bindCommentLike(item.querySelector(".c-like"));

        list.insertBefore(item, list.firstChild);
        list.scrollTop = 0;

        input.value = "";
        counter.textContent = "还可以输入 " + MAX + " 字";
        counter.style.color = "";
        toast("评论已发布");
    }

    if (sendBtn) sendBtn.addEventListener("click", post);
    if (input) {
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); post(); }
        });
    }

    /* ============ 6. 主页 Tab ============ */
    var ptabs = $("#ptabs");
    if (ptabs) {
        ptabs.addEventListener("click", function (e) {
            var tab = e.target.closest(".p-tab");
            if (!tab) return;
            e.preventDefault();

            $$(".p-tab", ptabs).forEach(function (t) { t.classList.remove("active"); });
            tab.classList.add("active");

            var panel = tab.getAttribute("data-panel");
            ["works", "likes", "favs"].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.style.display = id === panel ? "grid" : "none";
            });
            toast("切换到「" + tab.textContent.trim() + "」");
        });
    }

    /* ============ 7. 关注 ============ */
    var follow = $(".hero-follow");
    if (follow) {
        follow.addEventListener("click", function () {
            modal({
                title: "关注作者",
                body: "<p>登录后即可关注 @心动开机，第一时间收到更新提醒。</p>",
                confirmText: "去登录",
                onConfirm: function () { location.href = "login.html"; }
            });
        });
    }

    /* ============ 8. 搜索 ============ */
    var searchInput = $(".search input");
    var searchBtn = $(".search .search-btn");

    function doSearch() {
        if (!searchInput) return;
        var kw = searchInput.value.trim();
        if (!kw) { toast("输入关键词再搜吧"); searchInput.focus(); return; }
        if (!grid) { location.href = "index.html"; return; }

        var hits = 0;
        $$(".vcard", grid).forEach(function (card) {
            var h3 = card.querySelector("h3");
            var ok = h3 && h3.textContent.indexOf(kw) > -1;
            card.style.display = ok ? "" : "none";
            if (ok) hits++;
        });

        if (hits === 0) {
            toast("没有找到「" + kw + "」相关内容");
            $$(".vcard", grid).forEach(function (c) { c.style.display = ""; });
        } else {
            toast("找到 " + hits + " 个与「" + kw + "」相关的视频");
        }
    }

    if (searchBtn) searchBtn.addEventListener("click", doSearch);
    if (searchInput) {
        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); doSearch(); }
        });
    }

    /* ============ 9. 登录 ============ */
    var form = $("#loginForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var phone = $("#phone").value.trim();
            var pwd = $("#pwd").value.trim();
            if (!phone || !pwd) { toast("手机号和密码都要填哦"); return; }
            toast("登录成功，正在返回首页…");
            setTimeout(function () { location.href = "index.html"; }, 900);
        });
    }

    /* ============ 10. 侧栏导航：全部指向真实页面 ============ */
    var navMap = {
        "放映厅": "index.html?cat=movie",
        "短剧": "index.html?cat=drama",
        "小游戏": "index.html?cat=game"
    };
    $$(".nav-item").forEach(function (item) {
        var label = item.textContent.replace(/新|6/g, "").trim();
        if (navMap[label]) item.setAttribute("href", navMap[label]);
    });

    /* ============ 11. 顶栏功能 ============ */
    $$(".top-link").forEach(function (link) {
        var label = link.textContent.trim();
        if (label === "通知" || label === "消息") link.setAttribute("href", "message.html");
    });

    function rechargeModal() {
        modal({
            title: "充值钻石",
            body: '<p>选择充值金额（演示环境，不会真实扣款）：</p>' +
                  '<div style="display:flex;gap:10px;margin-top:12px">' +
                  '<button class="btn-soft" data-coin="60" style="flex:1;height:52px">¥6<br>60 钻</button>' +
                  '<button class="btn-soft" data-coin="300" style="flex:1;height:52px">¥30<br>300 钻</button>' +
                  '<button class="btn-soft" data-coin="980" style="flex:1;height:52px">¥98<br>980 钻</button>' +
                  '</div>',
            confirmText: "确认充值",
            onOpen: function (m) {
                m.querySelectorAll("[data-coin]").forEach(function (b) {
                    b.addEventListener("click", function () {
                        m.querySelectorAll("[data-coin]").forEach(function (x) { x.style.borderColor = "#343644"; });
                        b.style.borderColor = "#fe2c55";
                        m.dataset.coin = b.getAttribute("data-coin");
                    });
                });
            },
            onConfirm: function (m) {
                var coin = m.dataset.coin || "60";
                toast("充值成功，" + coin + " 颗钻石已到账");
            }
        });
    }

    function wallpaperModal() {
        var names = ["c1", "c2", "c3", "c5", "c7", "c9"];
        var html = names.map(function (n) {
            return '<img src="images/' + n + '.jpg" alt="" style="width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:8px;cursor:pointer">';
        }).join("");

        modal({
            title: "壁纸库",
            body: '<p>点一张预览，右键可保存：</p>' +
                  '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px">' + html + '</div>',
            confirmText: "关闭",
            onOpen: function (m) {
                m.querySelectorAll("img").forEach(function (img) {
                    img.addEventListener("click", function () { toast("已预览该壁纸"); });
                });
            }
        });
    }

    document.addEventListener("click", function (e) {
        var link = e.target.closest(".top-link");
        if (!link) return;
        var label = link.textContent.trim();

        if (label === "投稿") {
            e.preventDefault();
            modal({
                title: "发布作品",
                body: '<p>给作品起个标题：</p><input type="text" placeholder="例如：凌晨四点的海边">' +
                      '<p style="margin-top:12px">补充一句简介：</p><textarea rows="3" placeholder="记录这一刻…"></textarea>',
                confirmText: "提交",
                onConfirm: function (m) {
                    var title = m.querySelector("input").value.trim();
                    if (!title) { toast("标题不能为空"); return false; }
                    toast("《" + title + "》已提交，等待审核");
                }
            });
        } else if (label === "充钻石") {
            e.preventDefault();
            rechargeModal();
        } else if (label === "壁纸") {
            e.preventDefault();
            wallpaperModal();
        }
    });

    /* ============ 12. 更多 / 主页按钮 ============ */
    $$(".more").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            toast("已经到底啦，去顶部换个分类试试");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    $$(".profile-btns .btn-ghost").forEach(function (btn) {
        btn.addEventListener("click", function () {
            if (btn.textContent.indexOf("编辑") > -1) {
                modal({
                    title: "编辑资料",
                    body: '<p>昵称</p><input type="text" value="心动开机">' +
                          '<p style="margin-top:12px">简介</p><textarea rows="2">记录美好生活 · 每周三晚八点更新</textarea>',
                    confirmText: "保存",
                    onConfirm: function (m) {
                        var name = m.querySelector("input").value.trim() || "心动开机";
                        var bio = m.querySelector("textarea").value.trim();
                        var h1 = $(".profile-info h1");
                        if (h1) h1.firstChild.textContent = name + " ";
                        var p = $(".profile-info .bio");
                        if (p) p.textContent = bio;
                        toast("资料已保存");
                    }
                });
            } else {
                copyText(location.href);
            }
        });
    });

    /* ============ 13. 播放页“评论”按钮 ============ */
    $$(".actions .act").forEach(function (btn) {
        if (btn.id) return;
        btn.addEventListener("click", function () {
            if (input) { input.focus(); toast("来说两句吧"); }
        });
    });

    /* ============ 14. 真实视频：videos/v1.mp4 存在就自动接管封面 ============ */
    (function mountVideo() {
        var holder = document.querySelector(".hero") || document.querySelector(".player");
        if (!holder) return;
        var poster = holder.querySelector("img");
        var btn = holder.querySelector(".hero-play");
        if (!poster || !btn) return;

        var v = document.createElement("video");
        v.src = (window.DY_CURRENT && window.DY_CURRENT.src) || "images/vi.mp4";
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = "auto";
        v.style.display = "none";

        v.addEventListener("loadeddata", function () {
            if (!v.parentNode) holder.insertBefore(v, holder.firstChild);
            holder.classList.add("has-video");
            if (v.duration) { window.__videoTotal = v.duration; progress = 0; paint(); }
        });

        v.addEventListener("timeupdate", function () {
            if (!v.duration) return;
            if (bar) bar.style.width = (v.currentTime / v.duration * 100) + "%";
            if (timeLabel) timeLabel.textContent = fmt(v.currentTime) + " / " + fmt(v.duration);
        });
        v.addEventListener("error", function () { v.remove(); });

        var fresh = btn.cloneNode(true);
        btn.parentNode.replaceChild(fresh, btn);

        function resetBtn() {
            fresh.style.opacity = "";
            fresh.style.pointerEvents = "";
        }

        fresh.addEventListener("click", function (e) {
            e.stopPropagation();
            if (v.paused) {
                v.style.display = "block";
                poster.style.display = "none";
                v.play();
                fresh.style.opacity = "0";
                fresh.style.pointerEvents = "none";
                toast("开始播放");
            } else {
                v.pause();
                resetBtn();
            }
        });

        holder.addEventListener("click", function (e) {
            if (e.target.closest(".hero-play")) return;
            if (!v.paused) { v.pause(); resetBtn(); }
        });
    })();

    /* ============ 15. 首页分类预设（?cat=） ============ */
    (function presetCat() {
        var cat = new URLSearchParams(location.search).get("cat");
        if (!cat || !cats) return;
        var target = document.querySelector('.cat[data-cat="' + cat + '"]');
        if (target) target.click();
    })();

    /* ============ 16. 直播广场分类 ============ */
    (function livePage() {
        var chips = $("#chips");
        var liveGrid = $("#liveGrid");
        if (!chips || !liveGrid) return;

        chips.addEventListener("click", function (e) {
            var chip = e.target.closest(".chip");
            if (!chip) return;
            e.preventDefault();

            $$(".chip", chips).forEach(function (c) { c.classList.remove("active"); });
            chip.classList.add("active");

            var key = chip.getAttribute("data-live");
            var count = 0;
            $$(".live-card", liveGrid).forEach(function (card) {
                var ok = key === "all" || card.getAttribute("data-live") === key;
                card.style.display = ok ? "" : "none";
                if (ok) count++;
            });
            toast("「" + chip.textContent + "」共 " + count + " 个直播间");
        });
    })();

    /* ============ 17. 消息中心 ============ */
    (function messages() {
        var tabs = $("#msgTabs");
        var listEl = $("#msgList");
        var head = $("#chatHead");
        var body = $("#chatBody");
        var form = $("#chatForm");
        if (!tabs || !listEl) return;

        var data = {
            "张三三": { color: "#fe2c55", msgs: [["他", "那个转场你用的什么软件剪的？"], ["我", "剪映，自己调了下曲线"], ["他", "牛，回头教教我"]] },
            "李四": { color: "#25f4ee", msgs: [["他", "下周一起去拍夜街吗"], ["我", "可以啊，几点"], ["他", "晚上八点，老地方"]] },
            "抖音小助手": { color: "#7a5cff", msgs: [["他", "你的作品《重生日记》已通过审核，已进入推荐池。"]] },
            "阿澈": { color: "#ffb020", msgs: [["他", "那期空岛生存给你点赞了"], ["我", "谢谢！下次一起录"]] }
        };

        function paint(name) {
            var item = data[name];
            if (!item) return;
            head.textContent = name;
            body.innerHTML = item.msgs.map(function (m) {
                return '<div class="bubble' + (m[0] === "我" ? " me" : "") + '"></div>';
            }).join("");
            var nodes = body.querySelectorAll(".bubble");
            item.msgs.forEach(function (m, i) { nodes[i].textContent = m[1]; });
            body.scrollTop = body.scrollHeight;
        }

        listEl.addEventListener("click", function (e) {
            var it = e.target.closest(".msg-item");
            if (!it) return;
            $$(".msg-item", listEl).forEach(function (x) { x.classList.remove("active"); });
            it.classList.add("active");
            paint(it.getAttribute("data-name"));
        });

        if (form) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                var input = $("#chatInput");
                var text = input.value.trim();
                if (!text) return;

                var mine = document.createElement("div");
                mine.className = "bubble me";
                mine.textContent = text;
                body.appendChild(mine);
                input.value = "";
                body.scrollTop = body.scrollHeight;

                setTimeout(function () {
                    var reply = document.createElement("div");
                    reply.className = "bubble";
                    reply.textContent = "收到，稍后回你～";
                    body.appendChild(reply);
                    body.scrollTop = body.scrollHeight;
                }, 800);
            });
        }

        tabs.addEventListener("click", function (e) {
            var tab = e.target.closest(".msg-tab");
            if (!tab) return;
            $$(".msg-tab", tabs).forEach(function (t) { t.classList.remove("active"); });
            tab.classList.add("active");

            var kind = tab.getAttribute("data-tab");
            toast(kind === "chat" ? "私信" : kind === "notice" ? "系统通知" : "互动消息");
        });

        paint("张三三");
    })();

    /* ============ 18. 关注页 / 朋友页 ============ */
    document.querySelectorAll(".follow-btn2").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (btn.textContent.trim() === "我自己") { toast("这是你自己的主页"); return; }
            var wasInter = btn.textContent.trim() === "互相关注";
            var done = btn.classList.toggle("done");
            btn.textContent = done ? (wasInter ? "互相关注" : "已关注") : "关注";
            toast(done ? "已关注" : "已取消关注");
        });
    });

    document.querySelectorAll(".person button").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var done = btn.classList.toggle("done");
            btn.textContent = done ? "已关注" : "关注";
            toast(done ? "已关注该用户" : "已取消关注");
        });
    });

    document.querySelectorAll(".post-acts [data-act='like']").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var b = btn.querySelector("b");
            var on = btn.classList.toggle("on");
            if (on) {
                btn.setAttribute("data-raw", b.textContent);
                b.textContent = "已赞";
                toast("已点赞");
            } else {
                b.textContent = btn.getAttribute("data-raw") || b.textContent;
            }
        });
    });

    (function followTabs() {
        var tabs = document.getElementById("ftabs");
        var grid = document.getElementById("creators");
        if (!tabs || !grid) return;

        tabs.addEventListener("click", function (e) {
            var tab = e.target.closest(".page-tab");
            if (!tab) return;
            tabs.querySelectorAll(".page-tab").forEach(function (t) { t.classList.remove("active"); });
            tab.classList.add("active");

            var key = tab.getAttribute("data-tab");
            var n = 0;
            grid.querySelectorAll(".creator-card").forEach(function (card) {
                var live = card.getAttribute("data-live") === "1";
                var show = key === "all" || (key === "live" && live);
                card.style.display = show ? "" : "none";
                if (show) n++;
            });
            toast(key === "live" ? "直播中：" + n + " 位" : "共 " + n + " 位关注");
        });
    })();

    paint();
})();
