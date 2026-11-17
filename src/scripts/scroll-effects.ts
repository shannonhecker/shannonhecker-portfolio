import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let initialized = false;
export function initScrollEffects() {
  if (initialized) return;
  initialized = true;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add({ desktop:'(min-width: 901px) and (hover: hover) and (pointer: fine)', motion:'(prefers-reduced-motion: no-preference)' }, context => {
    if (!context.conditions?.motion) return;
    const desktop=!!context.conditions.desktop;
    const marked:HTMLElement[]=[];
    const scrub=desktop?.55:.2;
    const enter=(trigger:Element)=>({trigger,start:'top 96%',end:'top 58%',scrub});

    // Inner layers keep the load entrance and scroll response independent.
    // Start at the top of the document: the hero must react to the first swipe.
    const story=document.querySelector<HTMLElement>('.hero-story');
    if(story){
      story.dataset.scrollMotion='true';marked.push(story);
      const timeline=gsap.timeline({scrollTrigger:{trigger:story,start:0,end:'bottom 12%',scrub:desktop?.65:.25}});
      timeline.to(story.querySelectorAll('.hero-word'),{yPercent:desktop?-68:-28,stagger:.02,duration:1,ease:'none'},0)
        .to(story.querySelector('.hero-copy-depth'),{y:desktop?-64:-24,duration:1.25,ease:'none'},0);
    }

    // The artwork leads, followed by its title and description. A single
    // timeline follows native scrolling in both directions without pinning.
    document.querySelectorAll<HTMLElement>('#work .row').forEach((row,index)=>{
      const artwork=row.querySelector(':scope > picture, :scope > .project-preview');
      if(!artwork)return;
      row.dataset.scrollMotion='true';marked.push(row);
      // Drift only. Scaling a multi-megabyte vector image redraws it on every step and stalls scrolling.
      gsap.fromTo(artwork,{y:desktop?(index%2?88:56):20},{y:0,ease:'none',scrollTrigger:{...enter(row),end:'top 30%'}});
      // Captions sit below a tall image. Their own trigger keeps their motion
      // visible instead of completing while they are still below the screen.
      const title=row.querySelector('h3');
      if(title){
        const timeline=gsap.timeline({scrollTrigger:enter(title)});
        // Titles rise into place but never fade: a heading stays readable throughout.
        timeline.fromTo(row.querySelectorAll(':scope > .n, :scope > h3'),{y:desktop?40:14},{y:0,duration:.7,ease:'none'},0);
        timeline.fromTo(row.querySelector(':scope > .meta'),{y:desktop?28:10},{y:0,duration:.7,ease:'none'},.15);
      }
    });

    // Move the heading as one unit so words keep their shared baseline.
    document.querySelectorAll<HTMLElement>('.split').forEach(heading=>{
      const words=heading.querySelectorAll('.wd');if(!words.length)return;
      // A heading already on screen has had its entrance. Hiding it to animate again reads as a flash.
      const seen=heading.classList.contains('in')||heading.getBoundingClientRect().top<innerHeight*.92;
      heading.dataset.scrollMotion='true';marked.push(heading);
      if(seen)return;
      gsap.fromTo(heading,{y:12,opacity:0},
        {y:0,opacity:1,duration:.5,ease:'power2.out',scrollTrigger:{trigger:heading,start:'top 92%',once:true}});
    });
    document.querySelectorAll<HTMLElement>('.work-title, .process-heading h3').forEach(heading=>{
      gsap.fromTo(heading,{y:desktop?32:12,clipPath:'inset(0% 0% 100% 0%)'},
        {y:0,clipPath:'inset(0% 0% 0% 0%)',ease:'none',immediateRender:false,scrollTrigger:enter(heading)});
    });

    if(desktop){
      // Product evidence stays fixed to native scrolling so dense UI remains sharp.
      // Separate scene layers drift at different speeds as the intro leaves.
      const companion=document.querySelector('.landing-companion');
      if(companion){
        const timeline=gsap.timeline({scrollTrigger:{trigger:companion,start:0,end:'bottom top',scrub:.65}});
        timeline.to('.companion-stage',{y:-88,ease:'none'},0)
          .to('.companion-object.object-one',{y:-64,rotation:-12,ease:'none'},0)
          .to('.companion-object.object-two',{y:72,rotation:18,ease:'none'},0);
      }
      document.querySelectorAll<HTMLElement>('.journey-route').forEach(route=>{
        gsap.fromTo(route.children,{y:36},{y:0,stagger:.12,ease:'none',immediateRender:false,scrollTrigger:{trigger:route,start:'top 94%',end:'top 45%',scrub:.6}});
      });
    }
    // Keyboard focus always exposes the complete linked tile immediately.
    // Focusing a link also scrolls it into view, which would hand the tile
    // straight back to its scrubbed scroll tweens, so those pause while the
    // tile holds focus and pick up from the live scroll position on blur.
    const rowTriggers=(row:Element)=>ScrollTrigger.getAll().filter(trigger=>trigger.trigger&&row.contains(trigger.trigger));
    const leavesRow=(event:FocusEvent)=>{
      const row=(event.target as Element).closest('#work .row');
      return row&&!row.contains(event.relatedTarget as Node|null)?row:null;
    };
    const revealFocus=(event:FocusEvent)=>{
      const row=leavesRow(event);if(!row)return;
      rowTriggers(row).forEach(trigger=>trigger.disable(false));
      gsap.set(row.querySelectorAll(':scope > *'),{y:0,scale:1,opacity:1});
    };
    const restoreMotion=(event:FocusEvent)=>{const row=leavesRow(event);if(row)rowTriggers(row).forEach(trigger=>trigger.enable());};
    document.addEventListener('focusin',revealFocus);document.addEventListener('focusout',restoreMotion);
    return ()=>{marked.forEach(el=>delete el.dataset.scrollMotion);document.removeEventListener('focusin',revealFocus);document.removeEventListener('focusout',restoreMotion);};
  });
}
