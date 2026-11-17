import { illustrated } from './illustrated';
// A seated pose, assembled from the same static head/torso and original bent
// limbs. Riding never advances the walking frames, including in mid-air.
export function drawRider(ctx:CanvasRenderingContext2D,x:number,bottom:number,face:number){
 const image=illustrated('hero-kaohsiung-1');if(!image)return false;
 ctx.save();ctx.translate(Math.round(x/2)*2,Math.round(bottom/2)*2);if(face<0)ctx.scale(-1,1);
 const box=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 ctx.drawImage(image,0,0,34,31,-22,-64,44,40);
 // Navy shorts, bent knees, white shoes and the arm reaching the handlebar.
 box(-6,-27,20,8,'#142239');box(-4,-25,16,4,'#34445f');
 box(8,-21,8,13,'#142239');box(10,-21,4,11,'#eabb99');box(8,-10,14,5,'#142239');box(10,-9,10,2,'#fff7e9');
 box(3,-37,16,6,'#142239');box(3,-36,14,3,'#f1c3a2');box(15,-36,6,5,'#f1c3a2');
 // The same coral half helmet used elsewhere in the harbour chapter.
 box(-14,-62,26,6,'#172239');box(-12,-66,20,6,'#172239');box(-10,-64,16,5,'#d9787d');box(-12,-60,22,3,'#f0a69b');
 ctx.restore();return true;
}
