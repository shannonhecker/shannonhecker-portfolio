// Original pixel art for the bedtime finale. Coordinates are world pixels;
// every edge lands on the same two-pixel grid as the rest of the game.
export function drawScrollkeeper(ctx:CanvasRenderingContext2D,x:number,y:number,hp:number,clock:number,hurt:boolean){
 ctx.save();ctx.translate(Math.round(x/2)*2,Math.round(y/2)*2);
 if(hurt)ctx.globalAlpha=.55;
 const box=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 box(2,6,52,42,'#141c35');box(6,10,44,32,'#795690');box(10,14,36,24,'#292e50');
 box(6,0,8,12,'#141c35');box(42,0,8,12,'#141c35');box(8,0,4,6,'#eecb76');box(44,0,4,6,'#eecb76');
 box(0,24,6,12,'#141c35');box(50,24,6,12,'#141c35');
 box(12,22,10,6,'#f9d877');box(34,22,10,6,'#f9d877');box(12,20,6,2,'#ad6586');box(38,20,6,2,'#ad6586');
 box(22,32,12,2,'#f6b9c9');box(10,46,12,4,'#141c35');box(36,46,12,4,'#141c35');
 box(16+Math.floor(clock*3)%4*4,16,8,2,'#ad6586');
 for(let i=0;i<3;i++)box(10+i*14,-12,10,4,i<hp?'#f6b9c9':'#4b4d61');
 ctx.restore();
}

export function drawBedtimeCastle(ctx:CanvasRenderingContext2D,flagX:number,floorY:number,progress:number,clock:number,reduced:boolean){
 const box=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,w,h);};
 const x=flagX+46,y=floorY;
 // A small moonlit storybook castle with two stepped towers and a lit door.
 box(x-4,y-112,128,112,'#17243d');box(x,y-108,120,108,'#665a89');
 box(x-8,y-142,36,42,'#17243d');box(x+92,y-142,36,42,'#17243d');
 box(x-4,y-138,28,42,'#9489b3');box(x+96,y-138,28,42,'#9489b3');
 for(const tower of [x-8,x+92])for(let i=0;i<3;i++)box(tower+i*14,y-150,8,12,'#b1a5c6');
 for(let row=0;row<6;row++){box(x,y-96+row*16,120,2,'#403e63');for(let col=0;col<5;col++)box(x+((row%2)*12+col*24)%120,y-106+row*16,2,12,'#403e63');}
 box(x+42,y-62,36,62,'#17243d');box(x+48,y-56,24,56,progress>=1?'#f8d68b':'#344058');box(x+52,y-60,16,6,progress>=1?'#f8d68b':'#344058');
 for(const wx of [x+6,x+102]){box(wx,y-128,12,20,'#17243d');box(wx+4,y-124,4,12,'#f8d68b');}
 // A rose flag is pulled from the foot to the top of the pole.
 box(flagX+12,y-170,4,170,'#17243d');box(flagX+16,y-166,2,166,'#f3dca8');box(flagX+10,y-176,10,10,'#f8d68b');
 const fy=y-34-progress*124,wave=reduced?0:Math.floor(Math.sin(clock*5)*2)*2;
 box(flagX+18,fy,34,22,'#17243d');box(flagX+18,fy+2,30,18,'#cf7496');box(flagX+48,fy+4+wave,8,14,'#cf7496');
 box(flagX+30,fy+6,6,10,'#fff0c6');box(flagX+26,fy+10,14,4,'#fff0c6');
 box(flagX+4,y-6,28,6,'#9489b3');
 if(progress>=1&&!reduced){const colours=['#f8d68b','#f6b9c9','#90dce8'];for(let i=0;i<22;i++){const px=x-90+(i*37)%240,py=y-220+((clock*42+i*19)%180);box(px,py,4,4,colours[i%3]);}}
}

// Original starlight wand, held in front of the avatar with a short casting pose.
export function drawStarlightWand(ctx:CanvasRenderingContext2D,x:number,feet:number,face:number,casting:boolean){
 ctx.save();ctx.translate(Math.round(x/2)*2,Math.round((feet-20)/2)*2);ctx.scale(face,1);
 const box=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 const reach=casting?6:0;
 box(10,-4,14+reach,8,'#17243d');box(12,-2,12+reach,4,'#f7ceab');
 box(20+reach,-20,6,28,'#17243d');box(22+reach,-18,2,24,'#ae83b6');
 box(18+reach,-24,10,16,'#17243d');box(14+reach,-20,18,8,'#17243d');
 box(20+reach,-24,6,16,'#f9d877');box(14+reach,-18,18,4,'#f9d877');box(20+reach,-18,6,4,'#fff8d5');
 if(casting){box(34,-20,4,4,'#fff8d5');box(30,-30,4,4,'#f9d877');}
 ctx.restore();
}
export function drawStarBolt(ctx:CanvasRenderingContext2D,x:number,y:number,face:number){
 ctx.save();ctx.translate(Math.round(x/2)*2,Math.round(y/2)*2);ctx.scale(face,1);
 ctx.fillStyle='#17243d';ctx.fillRect(-4,-8,8,16);ctx.fillRect(-8,-4,16,8);
 ctx.fillStyle='#f9d877';ctx.fillRect(-2,-6,4,12);ctx.fillRect(-6,-2,12,4);
 ctx.fillStyle='#fff8d5';ctx.fillRect(-2,-2,4,4);
 ctx.fillStyle='#c9a96e';ctx.fillRect(-16,-2,6,4);ctx.fillRect(-24,0,4,2);ctx.restore();
}
