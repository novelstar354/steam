// =====================
// Steam Lite JS 完全版
// 実績ポップアップ + ダウンロード保存対応
// =====================

const GAMES = [
  {
    id: "game1",
    title: "風神録",
    desc: "弾幕シューティング",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAycOq5BxpzLitBIHMmgDiFTQRf0nCPJ1ilg&s",
    path: "games/game1/game1.html",
    version: "1.0",
    dlc: ["Extra Stage","Hardcore Mode"],
    achievements: ["初プレイ","10分プレイ","ボス撃破"]
  },
  {
    id: "game2",
    title: "パズルバブルズ",
    desc: "パズルゲーム",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs6TyR7wNrvYZWqi1ZClmxp46xMTCcuSU7gw&s",
    path: "games/game2/game2.html",
    version: "1.0",
    dlc: ["Extra Pack"],
    achievements: ["初プレイ","全クリア"]
  },

 {
    id: "game3",
    title: "SLOT MACHINE",
    desc: "ギャンブル体験",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXpgl9VrjKZLmPonXHSLJ8uLyNOPi7chR_Mtt0SCVJTx5-OI3J9WMJv_aO&s=10",
    path: "games/game3/game3.html",
    version: "1.0",
    dlc: ["Extra Pack"],
    achievements: ["初プレイ","全クリア"]
  },
{
    id: "game4",
    title: "wordls",
    desc: "英単語パズル",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5Xs3Am9a3KmIBOEeVAM6zCD2w8d3qZ36XDw&s",
    path: "games/game/game.html",
    version: "1.0",
    dlc: ["Extra Pack"],
    achievements: ["初プレイ","全クリア"]
  },


    
];
/*
使うときはid,img,pathを変えること。

   {
    id: "game",
    title: "",
    desc: "",
    img: "",
    path: "games/game/game.html",
    version: "1.0",
    dlc: ["Extra Pack"],
    achievements: ["初プレイ","全クリア"]
  },
  
*/
/* =================
   データ操作
================= */
function db(key,val){
  if(val!==undefined)localStorage.setItem(key,JSON.stringify(val));
  return JSON.parse(localStorage.getItem(key)||"null");
}

function owned(){return db("owned")||[]}
function reviews(){return db("reviews")||{}}
function playtime(){return db("playtime")||{}}
function unlocked(){return db("achv")||{}}
function download(){return db("download")||{}}

/* =================
   実績ポップアップ
================= */
function showPopup(msg){
  const div=document.createElement("div");
  div.className="achv-popup";
  div.style.position="fixed";
  div.style.bottom="20px";
  div.style.right="20px";
  div.style.background="#171a21";
  div.style.color="#66c0f4";
  div.style.padding="10px 16px";
  div.style.borderRadius="6px";
  div.style.boxShadow="0 0 10px #000";
  div.style.fontWeight="bold";
  div.style.zIndex="100000";
  div.textContent = "🏆 " + msg;
  document.body.appendChild(div);
  setTimeout(()=>{div.remove()},3000);
}

/* =================
   購入 / 実績
================= */
function buy(id){
  let o=owned();
  if(!o.includes(id)){
    o.push(id);
    db("owned",o);
    alert("購入しました！");
  }
}

function unlock(id,name){
  let u=unlocked();
  u[id]=u[id]||[];
  if(!u[id].includes(name)){
    u[id].push(name);
    db("achv",u);
    showPopup(name); // ポップアップ表示
  }
}

/* =================
   レビュー
================= */
function addReview(id,text){
  if(!text) return;
  let r=reviews();
  r[id]=r[id]||[];
  r[id].push(text);
  db("reviews",r);
  location.reload();
}

/* =================
   プレイ時間
================= */
function startGame(id){
  sessionStorage.setItem("playing",id);
  sessionStorage.setItem("start",Date.now());
  const game=GAMES.find(g=>g.id===id);
  location.href=game.path;
}

function endGame(){
  const id=sessionStorage.getItem("playing");
  if(!id) return;

  const start=+sessionStorage.getItem("start");
  const pt=Math.floor((Date.now()-start)/1000);

  let p=playtime();
  p[id]=(p[id]||0)+pt;
  db("playtime",p);
}

window.addEventListener("beforeunload",endGame);

/* =================
   ダウンロード演出 + 保存
================= */
function fakeDownload(id){
  const bar=document.getElementById("bar_"+id);
  const btn=document.getElementById("btn_"+id);
  if(!bar||!btn) return;

  let d = download();
  let p = d[id] || 0; // 保存から復帰
  bar.style.width = p+"%";
  btn.disabled = true;

  const t = setInterval(()=>{
    p += 5;
    if(p > 100) p = 100;
    bar.style.width = p + "%";
    d[id] = p;
    db("download", d); // 保存

    if(p>=100){
      clearInterval(t);
      buy(id);
      btn.disabled = false;
      btn.textContent = "▶ プレイ";
      btn.onclick = ()=>startGame(id);
    }
  },100);
}

/* =================
   Deck UI生成
================= */
function createStoreDeck(container){
  GAMES.forEach(g=>{
    const c=document.createElement("div");
    c.className="deck-card";
    c.innerHTML = `
      <img src="${g.img}">
      <h3>${g.title}</h3>
      <p>${g.desc}</p>
      <button id="btn_${g.id}" class="bigbtn">ダウンロード</button>
      <div class="progress">
        <div class="bar" id="bar_${g.id}"></div>
      </div>
    `;
    container.appendChild(c);

    // イベント登録
    const btn=document.getElementById("btn_"+g.id);
    btn.addEventListener("click", ()=>fakeDownload(g.id));

    // 保存済み進行状況復帰
    const d = download();
    if(d[g.id]){
      const bar = document.getElementById("bar_"+g.id);
      bar.style.width = d[g.id]+"%";
      if(d[g.id]>=100){
        btn.textContent="▶ プレイ";
        btn.onclick = ()=>startGame(g.id);
        btn.disabled = false;
      }
    }
  });
}

function createLibraryDeck(container){
  const o = owned();
  GAMES.forEach(g=>{
    if(o.includes(g.id)){
      const pt = playtime()[g.id]||0;
      const ach = unlocked()[g.id]||[];
      const rev = reviews()[g.id]||[];

      const c=document.createElement("div");
      c.className="deck-card";
      c.innerHTML=`
        <img src="${g.img}">
        <h3>${g.title}</h3>
        <div>プレイ時間: ${pt}秒</div>
        <div>実績: ${ach.length}/${g.achievements.length}</div>
        <button class="bigbtn" onclick="startGame('${g.id}')">▶ プレイ</button>

        <h4>DLC</h4>
        ${g.dlc.map(d=>`<div>${d}</div>`).join("")}

        <h4>レビュー</h4>
        ${rev.map(r=>`<div>📝 ${r}</div>`).join("")}
        <textarea id="r_${g.id}"></textarea>
        <button onclick="addReview('${g.id}',document.getElementById('r_${g.id}').value)">投稿</button>
      `;
      container.appendChild(c);
    }
  });
}

/* =================
   Steam起動画面
================= */
function showAppBoot(){
  const div=document.createElement("div");
  div.className="appboot";
  div.innerHTML=`<div class="ring"></div>STEAM`;
  document.body.appendChild(div);
  setTimeout(()=>{div.remove();},2800);
}

window.addEventListener("load",showAppBoot);
