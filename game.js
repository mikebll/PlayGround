const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
let W,H,DPR,started=false,timeLeft=120,score=0,combo=1,comboTimer=0,landed=0,bails=0;
let keys={},jumpHeld=false,grind=false,spin=0;
const rider={x:0,y:0,z:0,vx:0,vz:0,vy:0,angle:0,air:false,flip:0};
let bestLine=0,lineScore=0,lastTrick='',trickName='',trickTimer=0;
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}addEventListener('resize',resize);resize();
function rnd(a,b){return a+Math.random()*(b-a)}
function rot(v,a){let c=Math.cos(a),s=Math.sin(a);return {x:v.x*c-v.z*s,z:v.x*s+v.z*c}}
function project(x,y,z,cx,cy,scale){let p=rot({x:x-rider.x,z:z-rider.z},-rider.angle);let forward=p.z;let px=p.x;let ground=H*.62-forward*scale*.23;let perspective=scale/(1+Math.max(0,forward)*.012);return {x:W*.5+(px)*perspective,y:ground-y*perspective,ok:forward>-15}}
function poly(a,b,c,d,color){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;ctx.stroke()}
function box(cx,cy,cz,w,h,d,color,top){let e=[];e.push(project(cx-w/2,cy+h/2,cz-d/2,0,0,1));e.push(project(cx+w/2,cy+h/2,cz-d/2,0,0,1));e.push(project(cx+w/2,cy+h/2,cz+d/2,0,0,1));e.push(project(cx-w/2,cy+h/2,cz+d/2,0,0,1));if(e.some(q=>!q.ok))return;let b=[];for(let i=0;i<4;i++)b.push(project([[cx-w/2,cx+w/2,cx+w/2,cx-w/2][i],cy-h/2,[[cz-d/2,cz-d/2,cz+d/2,cz+d/2][i]]][0],cy-h/2,[[cz-d/2,cz-d/2,cz+d/2,cz+d/2][i]],0,0,1));poly(e[0],e[1],b[1],b[0],color);poly(e[1],e[2],b[2],b[1],color);poly(e[2],e[3],b[3],b[2],top||'#d5d5d8')}
function quad3(x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4,color){let a=project(x1,y1,z1),b=project(x2,y2,z2),c=project(x3,y3,z3),d=project(x4,y4,z4);if(!a.ok&&!b.ok&&!c.ok&&!d.ok)return;poly(a,b,c,d,color)}
function ramp(x,z,w,h,l){let y0=0;quad3(x-w/2,0,z-l/2,x-w/2,h,z+l/2,x+w/2,h,z+l/2,x+w/2,0,z-l/2,'#333941');quad3(x-w/2,h,z+l/2,x-w/2,h,z+l/2+0.1,x+w/2,h,z+l/2+0.1,x+w/2,h,z+l/2,'#d7dadd')}
function lineRamp(){return null}
function addScore(n,name){score+=n*combo;lineScore+=n*combo;comboTimer=5;if(!rider.air) combo=Math.min(combo+1,99);landed++;showTrick(name,n)}
function showTrick(name,n){trickName=name;trickTimer=.8;const el=document.getElementById('trick');el.innerHTML=name+`<small>+${n*combo}</small>`;el.classList.add('show')}
function jump(){if(!rider.air){rider.vy=9.2;rider.air=true;spin=0;trickName='';}}
function update(dt){if(!started)return;timeLeft-=dt;if(timeLeft<=0){timeLeft=0;endGame();return}let acc=keys['w']||keys['arrowup']?18:keys['s']||keys['arrowdown']?-12:0;rider.vx+=(acc*Math.cos(rider.angle))*dt;rider.vz+=(acc*Math.sin(rider.angle))*dt;let steer=(keys['a']||keys['arrowleft']?-1:0)+(keys['d']||keys['arrowright']?1:0);rider.angle+=steer*dt*1.55*(.5+Math.min(rider.vx+rider.vz,20)/30);rider.vx*=Math.pow(.985,dt*60);rider.vz*=Math.pow(.985,dt*60);rider.vx=Math.max(-10,Math.min(rider.vx,16));rider.vz=Math.max(-10,Math.min(rider.vz,16));rider.x+=rider.vx*dt;rider.z+=rider.vz*dt;rider.x=Math.max(-32,Math.min(rider.x,32));rider.z=Math.max(-50,Math.min(rider.z,55));if(rider.air){rider.vy-=22*dt;rider.y+=rider.vy*dt;rider.flip+=dt*(keys['q']?-.8:keys['e']?.8:0)+dt*.15;if(rider.y<=0){rider.y=0;rider.air=false;if(rider.vy<-4.5){bails++;combo=1;lineScore=0;showTrick('BAIL',0)}else{let name='OLLIE';let pts=100;if(keys['q']||keys['e']){name='KICKFLIP';pts=350} else if(keys['shift']){name='INDY AIR';pts=250}addScore(pts,name)}}}else if(rider.y<0)rider.y=0;if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0&&lineScore>0){if(lineScore>bestLine)bestLine=lineScore;lineScore=0;combo=1}}if(trickTimer>0){trickTimer-=dt;if(trickTimer<=0)document.getElementById('trick').classList.remove('show')}spin+=(keys['q']?-1:keys['e']?1:0)*dt*3;
 let el=document.getElementById('score');el.textContent=String(Math.floor(score)).padStart(6,'0');document.getElementById('combo').textContent='x'+combo;let m=Math.ceil(timeLeft/60),s=Math.ceil(timeLeft%60);let st=document.getElementById('timeNum');st.textContent=m+':'+String(s).padStart(2,'0');st.classList.toggle('red',timeLeft<20)}
function endGame(){if(started){started=false;document.getElementById('final').textContent=String(Math.floor(score)).padStart(6,'0');document.getElementById('resultText').textContent=`${landed} tricks landed · ${bails} bails · Best line ${bestLine}`;document.getElementById('result').classList.remove('hidden')}}
function draw(){ctx.clearRect(0,0,W,H);let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#151a29');sky.addColorStop(.58,'#252b3a');sky.addColorStop(.59,'#a6a8aa');sky.addColorStop(1,'#777b7e');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);ctx.fillStyle='#111827';ctx.fillRect(0,0,W,H*.12);ctx.fillStyle='rgba(186,255,0,.12)';ctx.fillRect(0,H*.11,W,2);
// skyline
ctx.fillStyle='#151822';for(let i=-5;i<18;i++){let x=i*90-rider.z*2%90;ctx.fillRect(x,H*.14+((i*7)%5)*8,58,210);ctx.fillStyle='#202638';ctx.fillRect(x+8,H*.18,3,3);ctx.fillRect(x+28,H*.23,3,3);ctx.fillStyle='#151822'}
// ground plane
let gy=H*.62;ctx.fillStyle='#686c70';ctx.fillRect(0,gy,W,H-gy);ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;for(let z=-50;z<60;z+=8){let a=project(-45,0,z),b=project(45,0,z);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}for(let x=-40;x<50;x+=10){let a=project(x,0,-55),b=project(x,0,60);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}ctx.fillStyle='#baff00';ctx.fillRect(W*.5-260,H*.62-4,520,4);
// park objects sorted depth
ramp(-18,-25,10,4,18);ramp(18,-20,10,4,18);ramp(0,18,12,4,20);
// rails
for(let x of [-10,10]){let z1=5,z2=42;let a=project(x,1.2,z1),b=project(x,1.2,z2);ctx.strokeStyle='#d8dde2';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.strokeStyle='#6e747b';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(a.x,a.y-7);ctx.lineTo(b.x,b.y-7);ctx.stroke();ctx.strokeStyle='#24282d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y-7);ctx.lineTo(b.x,b.y-7);ctx.stroke();}
// quarterpipe blocks
box(-30,0,-5,12,5,14,'#30343b','#d2d6da');box(30,0,-5,12,5,14,'#30343b','#d2d6da');box(-27,0,32,16,3,8,'#30343b','#b4bac0');box(27,0,32,16,3,8,'#30343b','#b4bac0');
// rider shadow
let sh=project(rider.x,0,rider.z);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(sh.x,sh.y,18-Math.min(rider.y*2,10),6-Math.min(rider.y*.2,3),0,0,7);ctx.fill();
// rider board and body
let rp=project(rider.x,rider.y+.55,rider.z);let scale=3.6;ctx.save();ctx.translate(rp.x,rp.y);ctx.rotate(rider.angle+spin*.08);ctx.scale(Math.max(.7,scale-rider.y*.08),1);ctx.fillStyle='#baff00';ctx.fillRect(-18,-3,36,6);ctx.fillStyle='#111';ctx.fillRect(-13,3,5,4);ctx.fillRect(8,3,5,4);ctx.restore();ctx.save();ctx.translate(rp.x,rp.y-20-rider.y*scale);ctx.rotate(rider.flip*.35);ctx.fillStyle='#ecf0ef';ctx.fillRect(-8,-28,16,30);ctx.fillStyle='#ff3858';ctx.fillRect(-10,-8,20,9);ctx.fillStyle='#12151a';ctx.beginPath();ctx.arc(0,-35,7,0,7);ctx.fill();ctx.fillStyle='#baff00';ctx.fillRect(-11,-34,22,4);ctx.restore();
ctx.fillStyle='rgba(255,255,255,.04)';ctx.fillRect(0,H*.84,W,H*.16);
}
let last=performance.now();function loop(now){let dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
function start(){started=true;timeLeft=120;score=0;combo=1;comboTimer=0;landed=0;bails=0;bestLine=0;lineScore=0;rider.x=0;rider.z=-35;rider.y=0;rider.vx=0;rider.vz=0;rider.angle=0;document.getElementById('start').classList.add('hidden');document.getElementById('result').classList.add('hidden')}
document.getElementById('play').onclick=start;document.getElementById('again').onclick=start;
addEventListener('keydown',e=>{let k=e.key.toLowerCase();keys[k]=true;if(k===' '||k==='arrowup'||k==='w')jump()});addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});
document.querySelectorAll('.touch').forEach(t=>{let down=e=>{e.prevent.prevent?.();e.preventDefault();let k=t.dataset.key;if(k==='jump')jump();else if(k==='left')keys.a=true;else if(k==='right')keys.d=true;else if(k==='grind')keys.shift=true};let up=()=>{let k=t.dataset.key;if(k==='left')keys.a=false;if(k==='right')keys.d=false;if(k==='grind')keys.shift=false};t.addEventListener('pointerdown',down);t.addEventListener('pointerup',up);t.addEventListener('pointercancel',up)});
