// Chapter navigation and pointer-led avatar motion never capture keyboard input.
export {};
const root=document.documentElement;
const index=document.querySelector<HTMLElement>('.case-contents');
const nav=document.querySelector<HTMLElement>('.nav');
if(nav){
 let navHeight=0;
 new ResizeObserver(([entry])=>{
  const height=entry.borderBoxSize[0]?.blockSize??entry.contentRect.height;
  if(height!==navHeight){navHeight=height;root.style.setProperty('--global-nav-height',`${height}px`);}
 }).observe(nav);
}
if(index){
 const panel=index.querySelector<HTMLDialogElement>('.section-panel')!;
 const opener=index.querySelector<HTMLButtonElement>('.section-open')!;
 const closeButton=index.querySelector<HTMLButtonElement>('.section-close')!;
 let closing=false;
 const closePanel=async(animate=true)=>{
  if(!panel.open||closing)return;
  closing=true;
  if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   await panel.animate([{transform:'translateX(0)'},{transform:'translateX(100%)'}],{duration:180,easing:'ease-in',fill:'forwards'}).finished;
  }
  panel.close();panel.getAnimations().forEach(animation=>animation.cancel());
  closing=false;
 };
 opener.addEventListener('click',()=>{
  panel.showModal();opener.setAttribute('aria-expanded','true');
  root.classList.add('sections-open');window.dispatchEvent(new Event('portfolio-sections-mode'));closeButton.focus({preventScroll:true});
 });
 panel.addEventListener('close',()=>{
  root.classList.remove('sections-open');opener.setAttribute('aria-expanded','false');
  opener.focus({preventScroll:true});
 });
 closeButton.addEventListener('click',()=>void closePanel());
 panel.addEventListener('cancel',event=>{event.preventDefault();void closePanel();});
 panel.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const last=panel.querySelector<HTMLAnchorElement>('.all-projects')!;
  if(event.shiftKey&&document.activeElement===closeButton){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();closeButton.focus();}
 });
 panel.addEventListener('click',event=>{
  if((event.target as Element).closest('a'))void closePanel(false);
  const rect=panel.getBoundingClientRect();
  if(event.target===panel&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))void closePanel();
 });
 const links=Array.from(index.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
 const sections=links.map(a=>document.getElementById(a.hash.slice(1))).filter((e):e is HTMLElement=>!!e);
 let previous=scrollY,travel=0,frame=0;
 const update=()=>{
  const delta=scrollY-previous;previous=scrollY;
  travel=Math.sign(delta)===Math.sign(travel)?travel+delta:delta;
  const pastHeader=index.getBoundingClientRect().top<=((nav?.offsetHeight??80)+4);
  if(scrollY<180||nav?.contains(document.activeElement))root.classList.remove('nav-away');
  else if(pastHeader&&travel>35)root.classList.add('nav-away');
  else if(travel< -18)root.classList.remove('nav-away');
  let current=0;sections.forEach((el,i)=>{if(el.getBoundingClientRect().top<innerHeight*.4)current=i;});
  links.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
  const label=index.querySelector('.section-current');if(label)label.textContent=links[current]?.textContent??'';
  frame=0;
 };
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 nav?.addEventListener('focusin',()=>root.classList.remove('nav-away'));
 update();
 // The opener floats over the page; it steps aside once the footer arrives so it never covers the live links.
 const footer=document.querySelector('footer');
 if(footer)new IntersectionObserver(([entry])=>root.classList.toggle('footer-in-view',entry.isIntersecting)).observe(footer);
}
const companion=document.querySelector<HTMLElement>('.landing-companion');
if(companion){
 const avatar=companion.querySelector<HTMLElement>('[data-avatar]')!;
 const stage=companion.querySelector<HTMLElement>('.companion-stage')!;
 const toggle=companion.querySelector<HTMLButtonElement>('.companion-motion')!;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false,visible=false,x=0,y=0,targetX=0,targetY=0,frame=0,last=0;
 let greeted=false,greetingTimer=0,idleTimer=0,greetingActive=false;
 const finishGreeting=()=>{clearTimeout(greetingTimer);clearTimeout(idleTimer);greetingActive=false;delete companion.dataset.intro;delete companion.dataset.pose;};
 const greet=async()=>{
  if(greetingActive||!enabled())return;
  clearTimeout(idleTimer);greetingActive=true;
  await Promise.all(Array.from(companion.querySelectorAll<HTMLImageElement>('.greeting-frame')).map(image=>image.decode().catch(()=>{})));
  if(!enabled()){greetingActive=false;return;}
  const first=!greeted;greeted=true;
  const copyAnimation=document.querySelector('.hero-story>h1')?.getAnimations()[0];
  // Animation.currentTime stops at the final keyframe. Timeline time keeps
  // advancing, so slow image decoding cannot replay a delay after the copy.
  const elapsed=first&&copyAnimation?.startTime!=null
    ?Math.max(0,Number(document.timeline.currentTime??0)-Number(copyAnimation.startTime)):0;
  companion.style.setProperty('--intro-elapsed',`${elapsed}ms`);
  companion.dataset.entered='true';
  if(first)companion.dataset.intro='true';
  const sequence:[string,number][]=[['rest',first?Math.max(0,720-elapsed):80],['lift',100],['wave',1800],['lift',160],['rest',250]];
  const next=()=>{if(!enabled()){finishGreeting();return;}const step=sequence.shift();if(!step){finishGreeting();idleTimer=window.setTimeout(()=>void greet(),10000);return;}companion.dataset.pose=step[0];greetingTimer=window.setTimeout(next,step[1]);};
  next();
 };
 const enabled=()=>!paused&&!reduced.matches&&visible&&!document.hidden;
 const render=()=>{avatar.style.setProperty('--avatar-x',`${x.toFixed(2)}px`);avatar.style.setProperty('--avatar-y',`${y.toFixed(2)}px`);};
 const tick=(time:number)=>{
  frame=0;if(!enabled())return;
  const ease=1-Math.exp(-Math.min(40,time-(last||time))/120);last=time;
  x+=(targetX-x)*ease;y+=(targetY-y)*ease;render();
  if(Math.abs(targetX-x)+Math.abs(targetY-y)>.04)frame=requestAnimationFrame(tick);
 };
 const schedule=()=>{if(enabled()&&!frame){last=0;frame=requestAnimationFrame(tick);}};
 const sync=()=>{
  const stopped=!enabled();companion.dataset.paused=String(stopped);
  toggle.disabled=reduced.matches;
  toggle.setAttribute('aria-pressed',String(paused||reduced.matches));
  toggle.textContent=reduced.matches?'Reduced motion':paused?'Resume motion':'Pause motion';
  if(paused||reduced.matches)companion.dataset.entered='true';
  if(stopped){finishGreeting();cancelAnimationFrame(frame);frame=0;x=0;y=0;targetX=0;targetY=0;render();}else {schedule();void greet();}
 };
 stage.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!enabled())return;
  const r=stage.getBoundingClientRect();targetX=Math.max(-8,Math.min(8,((e.clientX-r.left)/r.width-.5)*16));
  companion.dataset.greeting='true';schedule();
 });
 stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')void greet();});
 stage.addEventListener('pointerdown',()=>void greet());
 stage.addEventListener('pointerleave',()=>{targetX=0;companion.dataset.greeting='false';schedule();});
 toggle.addEventListener('click',()=>{paused=!paused;sync();});
 reduced.addEventListener('change',sync);
 document.addEventListener('visibilitychange',sync);
 addEventListener('scroll',()=>{if(!enabled())return;targetY=Math.max(-12,Math.min(0,-scrollY*.025));schedule();},{passive:true});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.25;companion.dataset.visible=String(visible);sync();},{threshold:[0,.25]}).observe(companion);
 sync();
}
