// A small original pixel accessory, anchored to the player's hand in world space.
// It follows facing and jumping without altering the player's collision box.
export function drawRainUmbrella(ctx: CanvasRenderingContext2D, x: number, bottom: number, facing: number) {
  ctx.save();
  ctx.translate(Math.round(x / 2) * 2, Math.round(bottom / 2) * 2);
  ctx.scale(facing < 0 ? -2 : 2, 2);
  const px = (x:number,y:number,w:number,h:number,color:string) => {ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  const ink='#172b3b', gold='#efb94f', light='#ffe5a0', shade='#ca823a';
  // Pole sits beside her face, with a hooked handle and a visible holding hand.
  px(8,-40,3,29,ink);px(9,-39,1,25,light);
  px(5,-14,6,4,ink);px(5,-13,4,2,'#edbb94');px(4,-15,3,2,'#b57d54');
  // Stepped canopy: dark silhouette, two fabric panels and a scalloped edge.
  px(8,-44,3,3,ink);px(2,-42,15,2,ink);px(-3,-40,25,2,ink);
  px(-7,-38,33,3,ink);px(-10,-35,39,4,ink);px(-12,-31,43,3,ink);
  px(-3,-39,25,2,gold);px(-7,-37,33,3,gold);px(-10,-34,39,4,gold);
  px(3,-41,13,2,light);px(4,-39,11,3,light);px(5,-36,9,4,light);
  px(-10,-30,10,2,shade);px(1,-30,16,2,shade);px(18,-30,11,2,shade);
  px(-12,-28,3,2,ink);px(-1,-29,3,2,ink);px(16,-29,3,2,ink);px(28,-28,3,2,ink);
  ctx.restore();
}
