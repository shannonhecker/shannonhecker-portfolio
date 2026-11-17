const root=document.documentElement;
const toggle=document.querySelector<HTMLButtonElement>('.theme-toggle');
const update=()=>{
 const dark=root.dataset.theme==='dark';
 toggle?.setAttribute('aria-checked',String(dark));
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#171b22':'#ffffff');
};
toggle?.addEventListener('click',()=>{
 const choice=root.dataset.theme==='dark'?'light':'dark';
 root.dataset.theme=choice;
 root.dataset.appearance=choice;
 try{localStorage.setItem('portfolio-theme',choice);}catch{}
 update();
});
update();
export {};
