// Operational flows adapted from the supplied FX Figma decision-loop reference
// and the approved case narratives. These are not measured usage funnels.
import type { Project } from './process';
export type FlowNode = { id:string; lines:string[]; x:number; y:number; kind?:'decision'|'end' };
export type FlowEdge = { from:string; to:string; label?:string; back?:boolean };
export type DecisionFlow = { nodes:FlowNode[]; edges:FlowEdge[]; height:number };
export const decisionFlows:Record<Project,DecisionFlow>={
 fx:{height:900,nodes:[
  {id:'start',lines:['Working order live'],x:440,y:12,kind:'end'},
  {id:'watch',lines:['Watch the canvas','Progress and price'],x:440,y:120},
  {id:'schedule',lines:['On schedule?'],x:440,y:250,kind:'decision'},
  {id:'state',lines:['Delayed, suspended','or outside limit'],x:80,y:250,kind:'decision'},
  {id:'wait',lines:['Reprice or','accept the wait'],x:80,y:420},
  {id:'benchmark',lines:['Average fill inside','the benchmarks?'],x:440,y:420,kind:'decision'},
  {id:'passive',lines:['Stay passive'],x:790,y:420},
  {id:'intervene',lines:['How to intervene?'],x:440,y:570,kind:'decision'},
  {id:'reprice',lines:['Reprice the limit'],x:30,y:710},
  {id:'stage',lines:['Stage an order'],x:290,y:710},
  {id:'fill',lines:['Fill now'],x:550,y:710},
  {id:'venue',lines:['Cross-filter venues'],x:810,y:710},
  {id:'review',lines:['Filled','Post-trade review'],x:440,y:820,kind:'end'},
 ],edges:[
  {from:'start',to:'watch'},{from:'watch',to:'schedule'},
  {from:'watch',to:'state',label:'Hatched band'},
  {from:'schedule',to:'watch',label:'On schedule',back:true},
  {from:'schedule',to:'benchmark',label:'Behind'},
  {from:'state',to:'wait'},{from:'wait',to:'watch',label:'Keep watching',back:true},
  {from:'benchmark',to:'passive',label:'Acceptable'},
  {from:'passive',to:'watch',label:'Keep working',back:true},
  {from:'benchmark',to:'intervene',label:'Adverse'},
  ...['reprice','stage','fill','venue'].map(to=>({from:'intervene',to})),
  ...['reprice','stage','fill','venue'].map(from=>({from,to:'review'})),
 ]},
 fusion:{height:700,nodes:[
  {id:'start',lines:['Open analytics'],x:440,y:12,kind:'end'},
  {id:'access',lines:['Entitlement-based view'],x:440,y:130,kind:'decision'},
  {id:'internal',lines:['Internal team'],x:160,y:250},
  {id:'client',lines:['External client'],x:720,y:250},
  {id:'cube',lines:['Select a data cube'],x:440,y:360},
  {id:'shape',lines:['Filter and slice'],x:440,y:470},
  {id:'analyse',lines:['Analyse returns,','attribution and risk'],x:160,y:580},
  {id:'report',lines:['Report in the','same surface'],x:720,y:580,kind:'end'},
 ],edges:[{from:'start',to:'access'},{from:'access',to:'internal'},{from:'access',to:'client'},{from:'internal',to:'cube'},{from:'client',to:'cube'},{from:'cube',to:'shape'},{from:'shape',to:'analyse'},{from:'analyse',to:'report'},{from:'analyse',to:'shape',label:'Refine the view',back:true}]},
 ai:{height:700,nodes:[
  {id:'prompt',lines:['Describe the screen'],x:440,y:12,kind:'end'},
  {id:'draft',lines:['Generate a draft','Official components'],x:440,y:130},
  {id:'review',lines:['The person decides'],x:440,y:270,kind:'decision'},
  {id:'compare',lines:['Compare systems'],x:100,y:440},
  {id:'tune',lines:['Tune density,','theme and charts'],x:440,y:440},
  {id:'export',lines:['Export React','Developer handover'],x:800,y:440,kind:'end'},
  {id:'judge',lines:['The model drafts','I decide'],x:440,y:600},
 ],edges:[{from:'prompt',to:'draft'},{from:'draft',to:'review'},{from:'review',to:'compare'},{from:'review',to:'tune'},{from:'review',to:'export',label:'Ready to hand over'},{from:'compare',to:'judge'},{from:'tune',to:'judge'},{from:'judge',to:'review',label:'Review again',back:true}]},
 winking:{height:810,nodes:[
  {id:'open',lines:['Open the app'],x:440,y:12,kind:'end'},
  {id:'board',lines:['A shared family board'],x:440,y:130,kind:'decision'},
  {id:'sample',lines:['First open','Sample Family'],x:100,y:270},
  {id:'family',lines:['Your own family'],x:440,y:270},
  {id:'adult',lines:['Second adult','joins by invitation'],x:800,y:270},
  {id:'child',lines:['Pick your child'],x:440,y:400},
  {id:'tick',lines:['Tap a routine','A star lands'],x:440,y:520},
  {id:'pet',lines:['The pet grows','Four weekly stages'],x:100,y:650},
  {id:'week',lines:['Weekly summary','New pet on Monday'],x:800,y:650,kind:'end'},
 ],edges:[{from:'open',to:'board'},...['sample','family','adult'].map(to=>({from:'board',to})),...['sample','family','adult'].map(from=>({from,to:'child'})),{from:'child',to:'tick'},{from:'tick',to:'pet'},{from:'pet',to:'week'},{from:'pet',to:'child',label:'Daily loop',back:true},{from:'week',to:'board',label:'Next week',back:true}]},
};
