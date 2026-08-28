const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const W = 1536, H = 1024;


const CONFIG = {
  coder:   {x:150,y:610,w:220,h:260, hitX:110,hitY:625,hitW:170,hitH:200, cloudX:85,cloudY:790,cloudW:300,cloudH:100},
  gorba: {x:470,y:580,w:250,h:290, hitX:425,hitY:585,hitW:190,hitH:215, cloudX:390,cloudY:785,cloudW:350,cloudH:105},
  reader:  {x:950,y:600,w:240,h:270, hitX:925,hitY:615,hitW:185,hitH:205, cloudX:900,cloudY:790,cloudW:330,cloudH:100},
  planner: {x:1230,y:585,w:230,h:285, hitX:1210,hitY:600,hitW:185,hitH:215, cloudX:1190,cloudY:785,cloudW:330,cloudH:105}
};

const ASSET_CANDIDATES = {
  background:["assets/background.png","assets/background.jpg","assets/background.jpeg","assets/background.webp"],
  coder:["assets/characters/coder.png","assets/characters/coder.jpg","assets/characters/coder.jpeg","assets/characters/coder.webp"],
  gorba:["assets/characters/gorba.png","assets/characters/gorba.jpg","assets/characters/gorba.jpeg","assets/characters/gorba.webp"],
  reader:["assets/characters/reader.png","assets/characters/reader.jpg","assets/characters/reader.jpeg","assets/characters/reader.webp"],
  planner:["assets/characters/planner.png","assets/characters/planner.jpg","assets/characters/planner.jpeg","assets/characters/planner.webp"],
  letter:["assets/letter.png","assets/letter.jpg","assets/letter.jpeg","assets/letter.webp"],
  cloudCoder:["assets/clouds/cloud_coder.png","assets/clouds/cloud_coder.jpg","assets/clouds/cloud_coder.jpeg","assets/clouds/cloud_coder.webp"],
  cloudGorba:["assets/clouds/cloud_gorba.png","assets/clouds/cloud_gorba.jpg","assets/clouds/cloud_gorba.jpeg","assets/clouds/cloud_gorba.webp","assets/clouds/cloud_discuss.png"],
  cloudReader:["assets/clouds/cloud_reader.png","assets/clouds/cloud_reader.jpg","assets/clouds/cloud_reader.jpeg","assets/clouds/cloud_reader.webp"],
  cloudPlanner:["assets/clouds/cloud_planner.png","assets/clouds/cloud_planner.jpg","assets/clouds/cloud_planner.jpeg","assets/clouds/cloud_planner.webp"]
};

const characterData = {
  coder:{title:"MAGOS",color:"#27cfff",text:`while(alive):\n    story.write()\n    bugs.fix()\n    coffee.drink()\n    dream.big()\n`},
  gorba:{title:"GOORBA",color:"#d99cff",text:`Exactly 21 years ago, Haji Laklak showed up with a little delivery.
At first I was like,
“Ooooh, nice. Yummy things.”
Then I took a closer look and went,
“Oh. Wait. I can't eat this screechy little package.” 
So I kept you.
Tucked you safely under the trees,
somewhere between old stories.
As the Goorba who could've eat you… but didn’t.
You're welcome.`},
  reader:{title:"RIVEN",color:"#c9ef5a",text:`The best books keep a few things hidden between the lines.
maybe unreadable ones.
you turn a page,
then there's a whole new world.
a place you didn't know was there.
a chapter you didn't expect to love.
just keep coming back to them,
finding something new each time.
guess some books are worth taking your time with.
Page by page.`},
  planner:{title:"GERDEH",color:"#ff8c58",text:`Life full of chaos, isn't it?
So just tie the knots.
One thought.
One step.
One little dream.
Until the tangled threads
began to look like a pattern.
somehow,
without knowing exactly how you are weaving something beautiful.
Maybe that's what growing up is—just trusting the next knot.
So here's the life.
Keep weaving.`}
};

const images = {};
let letterActive = false;
let letterStart = 0;
let letterLanded = false;
let letterOpen = false;
let sceneStarted = false;

function loadFirst(name, candidates){
  return new Promise(resolve=>{
    let index=0;
    const tryNext=()=>{
      if(index>=candidates.length){ resolve(false); return; }
      const i=new Image();
      const src=candidates[index++];
      i.onload=()=>{images[name]=i;resolve(true)};
      i.onerror=tryNext;
      i.src=src + (src.includes("?") ? "" : "?v=2");
    };
    tryNext();
  });
}

Promise.all(Object.entries(ASSET_CANDIDATES).map(([n,p])=>loadFirst(n,p))).then(()=>requestAnimationFrame(render));

function drawBackground(){
  if(images.background) ctx.drawImage(images.background,0,0,W,H);
  else {ctx.fillStyle="#071026";ctx.fillRect(0,0,W,H);}
}

function drawCloud(key,t){
  const c=CONFIG[key];
  const img=images[{coder:"cloudCoder",gorba:"cloudGorba",reader:"cloudReader",planner:"cloudPlanner"}[key]];
  if(!img)return;
  const bob=Math.sin(t*.0017+c.x*.01)*2.5;
  ctx.save();
  ctx.globalAlpha=.88;
  ctx.drawImage(img,c.cloudX,c.cloudY+bob,c.cloudW,c.cloudH);
  ctx.restore();
}

function placeholder(c,t,type){
  const bob=Math.sin(t*.0017+c.x*.01)*2.5;
  const x=c.x,y=c.y+bob;
  ctx.save();
  ctx.shadowBlur=14;ctx.shadowColor=characterData[type].color;ctx.strokeStyle=characterData[type].color;
  ctx.lineWidth=5;ctx.lineCap="round";
  ctx.beginPath();ctx.arc(x+c.w/2,y+38,30,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+c.w/2,y+68);ctx.lineTo(x+c.w/2,y+160);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+c.w/2,y+160);ctx.lineTo(x+c.w/2-30,y+220);ctx.moveTo(x+c.w/2,y+160);ctx.lineTo(x+c.w/2+30,y+220);ctx.stroke();
  const a=Math.sin(t*.004)*8;
  ctx.beginPath();ctx.moveTo(x+c.w/2,y+88);ctx.lineTo(x+c.w/2-55,y+125+a);ctx.moveTo(x+c.w/2,y+88);ctx.lineTo(x+c.w/2+55,y+115-a);ctx.stroke();
  if(type==="reader"){ctx.strokeRect(x+c.w/2-45,y+108,90,55);ctx.beginPath();ctx.moveTo(x+c.w/2,y+108);ctx.lineTo(x+c.w/2,y+163);ctx.stroke()}
  if(type==="planner"){ctx.strokeRect(x+120,y+75,90,110)}
  if(type==="coder"){ctx.strokeRect(x-20,y+135,105,65)}
  ctx.restore();
}

function drawCharacter(key,t){
  const c=CONFIG[key], img=images[key];
  ctx.save();
  ctx.translate(0,Math.sin(t*.0017+c.x*.01)*2);
  if(img){
    const s=Math.min(c.w/img.width,c.h/img.height);
    const dw=img.width*s, dh=img.height*s;
    ctx.drawImage(img,c.x+(c.w-dw)/2,c.y+c.h-dh,dw,dh);
  }else placeholder(c,t,key);
  ctx.restore();
}

function drawLetter(t){
  if(!letterActive) return;

  const FLIGHT = 12500;
  const elapsed = Math.max(0, t - letterStart);
  const q = Math.min(elapsed / FLIGHT, 1);

  const START_X = 690;
  const START_Y = 75;
  const LAND_X = 835;   
  const LAND_Y = 805;

  if(q >= 1){
    letterActive = false;
    letterLanded = true;
    return;
  }

  /*
     Gravity-like acceleration. q² means the sheet starts gently and
     continuously gains downward speed.
  */
  const y = START_Y + (LAND_Y - START_Y) * q * q;

  const flutterEnvelope = Math.sin(Math.PI * q);
  const flutter = Math.sin(q * Math.PI * 4.8) * 70 * flutterEnvelope;
  const x = START_X + (LAND_X - START_X) * q + flutter;

  drawLetterImage(x, y, 0, 150, 110);
}

const LAND_X = 835;
const LAND_Y = 805;

function drawLetterImage(x,y,angle,maxW,maxH){
  const img=images.letter;
  if(!img)return;
  const scale=Math.min(maxW/img.width,maxH/img.height);
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.drawImage(img,-img.width*scale/2,-img.height*scale/2,img.width*scale,img.height*scale);
  ctx.restore();
}

function drawLandedLetter(){
  if(!letterLanded)return;
  drawLetterImage(LAND_X,LAND_Y,0,180,125);
}

function render(t){
  drawBackground();
  drawCloud("coder",t);drawCloud("gorba",t);drawCloud("reader",t);drawCloud("planner",t);
  drawCharacter("coder",t);drawCharacter("gorba",t);drawCharacter("reader",t);drawCharacter("planner",t);
  drawLetter(t);drawLandedLetter();
  requestAnimationFrame(render);
}

function openCharacter(key){
  const c=characterData[key],panel=document.getElementById("infoPanel");
  panel.style.borderColor=c.color;
  const iconMap={coder:"x.svg",gorba:"rostam.png",reader:"book.png",planner:"carpet.png"};
  const icon=document.getElementById("infoCloseIcon");
  const close=document.getElementById("closeInfo");
  icon.src=`assets/icons/${iconMap[key]}`;
  close.classList.remove("icon-2x","icon-character","phoenix-close","icon-2x-standard");
  if(key==="reader" || key==="planner") close.classList.add("icon-2x-standard");
  else if(key!=="coder") close.classList.add("icon-character");
  document.getElementById("infoContent").innerHTML=`<div style="color:${c.color};font-size:18px;margin-bottom:14px">${c.title}</div><pre style="white-space:pre-wrap;margin:0;line-height:1.65">${c.text}</pre>`;
  panel.classList.remove("hidden");
}

document.querySelectorAll(".hitbox").forEach(b=>b.onclick=()=>openCharacter(b.dataset.character));
document.getElementById("closeInfo").onclick=()=>document.getElementById("infoPanel").classList.add("hidden");
document.getElementById("closeLetter").onclick=()=>document.getElementById("letterPanel").classList.add("hidden");

canvas.addEventListener("click",e=>{
  if(!letterLanded)return;
  const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)*(W/r.width);
  const y=(e.clientY-r.top)*(H/r.height);
  const dx=(x-LAND_X)/110, dy=(y-LAND_Y)/75;
  if(dx*dx+dy*dy<=1){
    letterOpen=true;
    document.getElementById("letterPanel").classList.remove("hidden");
  }
});

document.getElementById("letterText").textContent=`Today, gravity was your postman.
The force that draws things together, brought you a letter.
From someone who wanted you to be happy.
"""
Stay curious.
Keep building.
And don’t forget to look up once in a while—
for the moments, and the stars.
HAPPY BIRTHDAY Madson:)
"""`;

document.getElementById("enterButton").addEventListener("click",()=>{
  if(sceneStarted) return;
  sceneStarted=true;
  const overlay=document.getElementById("introOverlay");
  overlay.classList.add("fade-out");
  const scene=document.getElementById("scene");
  scene.classList.remove("pre-reveal");
  scene.classList.add("reveal");
  setTimeout(()=>{
    letterActive=true;
    letterStart=performance.now();
  },5000);
});
