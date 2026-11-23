/* Target callouts use the released mask, never image-based guesses. */
(function(root){
  'use strict';
  function decode(region){
    const binary=typeof atob==='function'?atob(region.occupancy):Buffer.from(region.occupancy,'base64').toString('binary');
    const n=region.grid,cells=new Uint8Array(n*n),sum=new Uint32Array((n+1)*(n+1)),boundary=[];
    for(let i=0;i<cells.length;i++)cells[i]=(binary.charCodeAt(i>>3)>>(i&7))&1;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const i=(y+1)*(n+1)+x+1;
      sum[i]=cells[y*n+x]+sum[i-1]+sum[i-n-1]-sum[i-n-2];
      if(cells[y*n+x]&&(x===0||y===0||x===n-1||y===n-1||!cells[y*n+x-1]||!cells[y*n+x+1]||!cells[(y-1)*n+x]||!cells[(y+1)*n+x]))boundary.push([(x+.5)/n,(y+.5)/n]);
    }
    return {n,cells,sum,points:region.anchors||boundary};
  }
  function occupied(mask,x,y,w,h,width,height,pad=0){
    const n=mask.n;
    const x0=Math.max(0,Math.floor((x-pad)/width*n)),y0=Math.max(0,Math.floor((y-pad)/height*n));
    const x1=Math.min(n,Math.ceil((x+w+pad)/width*n)),y1=Math.min(n,Math.ceil((y+h+pad)/height*n));
    const at=(x,y)=>mask.sum[y*(n+1)+x];
    return at(x1,y1)-at(x0,y1)-at(x1,y0)+at(x0,y0);
  }
  function place(mask,width,height,labelWidth,labelHeight){
    if(!mask.points.length||!width||!height)return null;
    const pad=4,edge=4,step=Math.max(3,Math.min(width,height)/80);
    let best=null,score=Infinity;
    for(let y=edge;y<=height-labelHeight-edge;y+=step){
      for(let x=edge;x<=width-labelWidth-edge;x+=step){
        if(occupied(mask,x,y,labelWidth,labelHeight,width,height,pad))continue;
        const cx=x+labelWidth/2,cy=y+labelHeight/2;
        for(const [nx,ny] of mask.points){
          const ax=nx*width,ay=ny*height;
          const cost=(cx-ax)**2+(cy-ay)**2;
          if(cost<score){score=cost;best={x,y,w:labelWidth,h:labelHeight,ax,ay,outside:false};}
        }
      }
    }
    if(best)return best;
    // If the target fills the image, place the text in a separate white margin.
    const anchor=mask.points.reduce((a,b)=>b[1]>a[1]?b:a);
    return {x:Math.max(0,Math.min(width-labelWidth,anchor[0]*width-labelWidth/2)),y:height+6,w:labelWidth,h:labelHeight,ax:anchor[0]*width,ay:anchor[1]*height,outside:true};
  }
  if(typeof module==='object'&&module.exports){module.exports={decode,occupied,place};return;}
  const cache=new Map(),tracked=new Map();
  const observer=new ResizeObserver(entries=>entries.forEach(entry=>layout(entry.target)));
  function layout(stage){
    const data=tracked.get(stage),img=stage.querySelector('img');
    if(!data||!img?.complete||!img.naturalWidth)return;
    const box=stage.getBoundingClientRect();if(box.width<1||box.height<1)return;
    const aspect=img.naturalWidth/img.naturalHeight;
    const width=Math.min(box.width,box.height*aspect),height=width/aspect;
    const offsetX=(box.width-width)/2,offsetY=(box.height-height)/2;
    const label=stage.querySelector('.target-label'),svg=stage.querySelector('.target-leader');
    label.textContent=stage.dataset.targetLabel;
    const labelBox=label.getBoundingClientRect();
    const result=place(data,width,height,labelBox.width,labelBox.height);
    if(!result)return;
    stage.classList.toggle('label-outside',result.outside);
    stage.style.setProperty('--label-clearance',result.outside?(labelBox.height+10)+'px':'0px');
    label.style.left=(offsetX+result.x)+'px';label.style.top=(offsetY+result.y)+'px';label.style.visibility='visible';
    svg.style.left=offsetX+'px';svg.style.top=offsetY+'px';svg.style.width=width+'px';svg.style.height=height+'px';
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const sx=Math.max(result.x,Math.min(result.x+result.w,result.ax)),sy=Math.max(result.y,Math.min(result.y+result.h,result.ay));
    svg.innerHTML=`<path class="leader-halo" d="M${sx},${sy} L${result.ax},${result.ay}"/><path d="M${sx},${sy} L${result.ax},${result.ay}"/><circle cx="${result.ax}" cy="${result.ay}" r="1.7"/>`;
    svg.style.visibility='visible';
    stage.dataset.labelPlacement=result.outside?'outside':'background';
    stage.dataset.labelOverlap=String(result.outside?0:occupied(data,result.x,result.y,result.w,result.h,width,height));
  }
  function sync(records){
    const byId=new Map(records.map(r=>[r.id,r]));
    observer.disconnect();tracked.clear();
    document.querySelectorAll('.image-stage[data-target-id]').forEach(stage=>{
      const record=byId.get(stage.dataset.targetId);if(!record?.target_region)return;
      const key=record.id+'|'+record.target_region.occupancy;
      if(!cache.has(key))cache.set(key,decode(record.target_region));
      tracked.set(stage,cache.get(key));observer.observe(stage);layout(stage);
    });
  }
  document.addEventListener('load',event=>{if(event.target.tagName==='IMG'){const stage=event.target.closest('.image-stage');if(stage)layout(stage);}},true);
  root.UAVTargetLabels={sync};
})(typeof window==='object'?window:globalThis);
