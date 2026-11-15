// A precise hotspot follows the pointer; the character catches up beside it.
// Native cursors are restored for selection, controls that need them and the game.
export {};
const root=document.documentElement;
const allowed=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
const toggle=document.querySelector<HTMLButtonElement>('[data-avatar-cursor-toggle]');
let enabled=true;
try{enabled=localStorage.getItem('portfolio-avatar-cursor')!=='off';}catch{}
const era:Record<string,string>={fx:'desk',fusion:'tower','winking-star':'bedtime',uoaui:'ai'};
const outfit=era[root.dataset.project??'']??'lingtung';
const cursor=document.createElement('div');
cursor.className='avatar-cursor';cursor.setAttribute('aria-hidden','true');cursor.dataset.outfit=outfit;
const hotspot=document.createElement('i');hotspot.className='avatar-cursor-hotspot';
const follower=document.createElement('span');follower.className='avatar-cursor-follower';
cursor.append(hotspot,follower);
let images:HTMLImageElement[]=[],ready=false,loading=false,active=false,frame=0,last=0;
let mx=0,my=0,x=0,y=0,direction=1,movedAt=0,hovered=false;
const nativeTarget=(el:Element|null)=>!!el?.closest('input,textarea,select,[contenteditable],video,canvas,dialog,.play.is-full');
function hide(){active=false;root.classList.remove('avatar-cursor-active');cursor.dataset.visible='false';cancelAnimationFrame(frame);frame=0;}
function sync(){
 if(toggle){toggle.hidden=!allowed.matches;toggle.setAttribute('aria-pressed',String(enabled));toggle.textContent=enabled?'Avatar cursor on':'Avatar cursor off';}
 if(!enabled||!allowed.matches)hide();
}
async function load(){
 if(ready||loading)return;loading=true;
 try{
  images=await Promise.all([1,2,3,4].map(async n=>{const img=new Image(34,48);img.alt='';img.src=`/game/eras/${outfit}/${n}.png`;await img.decode();return img;}));
  images.forEach(img=>follower.append(img));document.body.append(cursor);ready=true;
 }catch{hide();}finally{loading=false;}
}
function tick(time:number){
 frame=0;if(!active||document.hidden)return;
 const dt=Math.min(40,time-(last||time));last=time;
 const ease=1-Math.exp(-dt/65);x+=(mx-x)*ease;y+=(my-y)*ease;
 const moving=time-movedAt<150||Math.abs(mx-x)+Math.abs(my-y)>.5;
 const pose=moving?Math.floor(time/110)%4:0;
 images.forEach((img,i)=>img.hidden=i!==pose);
 hotspot.style.transform=`translate3d(${mx}px,${my}px,0)`;
 const offset=mx>innerWidth-65?-44:12;
 follower.style.transform=`translate3d(${x+offset}px,${Math.min(innerHeight-52,Math.max(4,y-12))}px,0)`;
 follower.style.setProperty('--cursor-facing',String(direction));
 cursor.dataset.moving=String(moving);cursor.dataset.hover=String(hovered);
 if(moving)frame=requestAnimationFrame(tick);
}
document.addEventListener('pointermove',event=>{
 if(root.classList.contains('sections-open')||event.pointerType!=='mouse'||!enabled||!allowed.matches||nativeTarget(event.target as Element)||window.getSelection()?.toString()){hide();return;}
 if(!ready){void load();return;}
 const dx=event.clientX-mx;if(Math.abs(dx)>2)direction=dx>0?1:-1;
 mx=event.clientX;my=event.clientY;movedAt=performance.now();
 hovered=!!(event.target as Element).closest('a,button,summary,[role=button]');
 if(!active){x=mx;y=my;last=0;active=true;root.classList.add('avatar-cursor-active');cursor.dataset.visible='true';}
 if(!frame)frame=requestAnimationFrame(tick);
},{passive:true});
document.addEventListener('pointerdown',()=>{cursor.dataset.pressed='true';},{passive:true});
document.addEventListener('pointerup',()=>{cursor.dataset.pressed='false';},{passive:true});
document.addEventListener('pointerout',e=>{if(!e.relatedTarget)hide();});
document.addEventListener('keydown',hide);
document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();});
window.addEventListener('blur',hide);window.addEventListener('pageswap',hide);
allowed.addEventListener('change',sync);
toggle?.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('portfolio-avatar-cursor',enabled?'on':'off');}catch{}sync();});
sync();

// Entering the game can happen without another pointermove. Restore its cursor now.
addEventListener('portfolio-game-mode',hide);

addEventListener('portfolio-sections-mode',hide);
