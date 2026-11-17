export type Matrix = number[][];
export type MorphOp = 'erosion'|'dilation'|'opening'|'closing'|'gradient';
export type KernelShape = 'square'|'cross';
export function validGrid(a:Matrix) {
 if(!a.length||!a[0].length||a.some(r=>r.length!==a[0].length||r.some(v=>v!==0&&v!==1)))throw Error('Use a rectangular 0/1 mask.');
}
export const squareMask:Matrix = [[0,0,0,0,0,0,0],[0,1,1,1,1,1,0],[0,1,1,1,1,1,0],[0,1,1,1,1,1,0],[0,1,1,1,1,1,0],[0,1,1,1,1,1,0],[0,0,0,0,0,0,0]];
export const noisyMask:Matrix = [[1,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,1,1,1,0,0],[0,0,1,1,1,0,0],[0,0,1,1,1,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
export const holeMask:Matrix = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,1,1,1,0,0],[0,0,1,0,1,0,0],[0,0,1,1,1,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
export const componentMask:Matrix = [[1,0,0,0,0,0,0],[0,1,0,0,0,0,0],[0,0,0,0,1,1,0],[0,0,0,0,1,1,0],[0,0,0,0,0,0,0],[0,1,1,1,0,0,0],[0,0,0,0,0,0,0]];
export function kernelOffsets(shape:KernelShape) {return Array.from({length:9},(_,i)=>({dx:i%3-1,dy:Math.floor(i/3)-1})).filter(p=>shape==='square'||p.dx===0||p.dy===0);}
export function neighbours(a:Matrix,x:number,y:number,shape:KernelShape,op:'erosion'|'dilation',zero=false) {
 return kernelOffsets(shape).map(({dx,dy})=>{const xx=x+dx,yy=y+dy,outside=yy<0||yy>=a.length||xx<0||xx>=a[0].length;return {dx,dy,outside,value:outside?(zero?0:op==='erosion'?1:0):a[yy][xx]};});
}
export function morph(a:Matrix,op:MorphOp,shape:KernelShape='square',zero=false):Matrix {
 validGrid(a);
 if(op==='opening')return morph(morph(a,'erosion',shape,zero),'dilation',shape,zero);
 if(op==='closing')return morph(morph(a,'dilation',shape,zero),'erosion',shape,zero);
 if(op==='gradient'){const d=morph(a,'dilation',shape,zero),e=morph(a,'erosion',shape,zero);return d.map((r,y)=>r.map((v,x)=>v-e[y][x]));}
 return a.map((r,y)=>r.map((_,x)=>{const values=neighbours(a,x,y,shape,op,zero).map(p=>p.value);return op==='erosion'?Math.min(...values):Math.max(...values);}));
}
export function components(a:Matrix,connectivity:4|8=8) {
 validGrid(a);const labels=a.map(r=>r.map(()=>0)),sizes:number[]=[0];let label=0;
 const offsets=[[-1,0],[1,0],[0,-1],[0,1],...(connectivity===8?[[-1,-1],[1,-1],[-1,1],[1,1]]:[])];
 for(let y=0;y<a.length;y++)for(let x=0;x<a[0].length;x++){
  if(!a[y][x]){sizes[0]++;continue;}if(labels[y][x])continue;
  label++;sizes[label]=0;const queue=[[x,y]];labels[y][x]=label;
  for(let i=0;i<queue.length;i++){const [xx,yy]=queue[i];sizes[label]++;for(const [dx,dy]of offsets){const nx=xx+dx,ny=yy+dy;if(a[ny]?.[nx]&&!labels[ny][nx]){labels[ny][nx]=label;queue.push([nx,ny]);}}}
 }
 return {labels,sizes,count:label};
}
export function removeSmall(a:Matrix,minimum:number,connectivity:4|8=8){
 if(!Number.isInteger(minimum)||minimum<1)throw Error('Minimum must be a positive integer.');
 const c=components(a,connectivity);return { ...c,output:c.labels.map(r=>r.map(v=>v>0&&c.sizes[v]>=minimum?1:0))};
}
export function applyMask(image:Matrix,mask:Matrix,bitwiseMistake=false):Matrix {
 validGrid(mask);if(image.length!==mask.length||image.some((r,i)=>r.length!==mask[i].length))throw Error('Image and mask shapes differ.');
 return image.map((r,y)=>r.map((v,x)=>bitwiseMistake?v&mask[y][x]:mask[y][x]?v:0));
}
