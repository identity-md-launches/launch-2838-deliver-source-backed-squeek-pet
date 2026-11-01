import{_ as e,a as t,c as n,f as r,g as i,h as a,i as o,m as s,n as c,o as l,p as u,s as d,t as f,u as p}from"./desktop-8DgdEAe7.js";function m(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var h=e=>String(Math.round(e*100)/100),g=([e,t])=>`${h(e)} ${h(t)}`;function _(e){let t=e.length;return e.map((n,r)=>{let i=e[(r-1+t)%t],a=e[(r+1)%t],o=e[(r+2)%t];return[n,[n[0]+(a[0]-i[0])/6,n[1]+(a[1]-i[1])/6],[a[0]-(o[0]-n[0])/6,a[1]-(o[1]-n[1])/6],a]})}function v(e,t=.5){let n=[];for(let[t,r,i,a]of _(e))for(let e=0;e<32;e++){let o=e/32,s=1-o,c=s*s*s,l=3*s*s*o,u=3*s*o*o,d=o*o*o;n.push([c*t[0]+l*r[0]+u*i[0]+d*a[0],c*t[1]+l*r[1]+u*i[1]+d*a[1]])}let r=[n[0]],i=0;for(let e=1;e<=n.length;e++){let a=n[e-1],o=n[e%n.length],s=Math.hypot(o[0]-a[0],o[1]-a[1]),c=a;for(;i+s>=t;){let e=(t-i)/s;c=[c[0]+(o[0]-c[0])*e,c[1]+(o[1]-c[1])*e],r.push(c),s-=t-i,i=0}i+=s}if(r.length>1){let[e,n]=[r[0],r[r.length-1]];Math.hypot(e[0]-n[0],e[1]-n[1])<t*.5&&r.pop()}return r}function y(e){let t=0;return e.forEach((n,r)=>{let i=e[(r+1)%e.length];t+=n[0]*i[1]-i[0]*n[1]}),t/2}function ee(e,[t,n]){let r=!1;for(let i=0,a=e.length-1;i<e.length;a=i++){let[o,s]=e[i],[c,l]=e[a];s>n!=l>n&&t<(c-o)*(n-s)/(l-s)+o&&(r=!r)}return r}var b=([e,t])=>{let n=Math.hypot(e,t)||1;return[e/n,t/n]};function te(e,t){let n=v(e,.5),r=n.length,i=y(n)>0?1:-1,a=e=>b([n[(e+1)%r][0]-n[(e-1+r)%r][0],n[(e+1)%r][1]-n[(e-1+r)%r][1]]),o=m(t.seed),[s,c]=t.spacing??[2.2,3.6],l=`M${g(n[0])}`;for(let e=0;e<r;){let u=Math.max(3,Math.round((s+o()*(c-s))/.5)),d=Math.min(r,e+u),f=Math.floor((e+d)/2)%r,p=a(f),m=[i*p[1],-i*p[0]],h=n[f],_=t.length(h,m)*(.4+.6*o()),v=n[e%r],y=n[d%r];if(_<.4){for(let t=e+2;t<d;t+=2)l+=`L${g(n[t%r])}`;l+=`L${g(y)}`}else{let e=t.flow(h),n=Math.max(-1,Math.min(1,e[0]*p[0]+e[1]*p[1]))*_*.85+(o()-.5)*_*.3,r=[h[0]+m[0]*_+p[0]*n,h[1]+m[1]*_+p[1]*n],i=[v[0]+m[0]*_*.5+p[0]*n*.3,v[1]+m[1]*_*.5+p[1]*n*.3],a=[y[0]+m[0]*_*.3,y[1]+m[1]*_*.3];l+=`Q${g(i)} ${g(r)}Q${g(a)} ${g(y)}`}e=d}return`${l}Z`}function ne(e,t){let n=v(e,.25),r=n.length,i=y(n)>0?1:-1,a=m(t.seed),o=t.spacing??.9,s=t.inset??1,c=``;for(let e=0;e<r;e+=Math.max(1,Math.round(o*(.5+a())/.25))){let o=n[e],l=b([n[(e+1)%r][0]-n[(e-1+r)%r][0],n[(e+1)%r][1]-n[(e-1+r)%r][1]]),u=[i*l[1],-i*l[0]],d=t.length(o,u)*(.45+.55*a());if(d<.3)continue;let f=t.flow(o),p=Math.max(-1.2,Math.min(1.2,f[0]*l[0]+f[1]*l[1]))*.9+(a()-.5)*.6,m=b([u[0]+l[0]*p,u[1]+l[1]*p]),h=s*(.6+.8*a()),_=[o[0]-u[0]*h,o[1]-u[1]*h],v=[o[0]+m[0]*d,o[1]+m[1]*d],y=(a()-.5)*.5*d,ee=[(_[0]+v[0])/2-m[1]*y,(_[1]+v[1])/2+m[0]*y];c+=`M${g(_)}Q${g(ee)} ${g(v)}`}return c}function x(e,t){let n=v(e,1),r=n.map(e=>e[0]),i=n.map(e=>e[1]),[a,o,s,c]=[Math.min(...r),Math.max(...r),Math.min(...i),Math.max(...i)],l=m(t.seed),u=``;for(let e=0,r=0;e<t.count&&r<t.count*40;r++){let r=[a+l()*(o-a),s+l()*(c-s)];if(!ee(n,r)||t.where&&!t.where(r))continue;let[i,d]=b(t.flow(r)),f=t.length[0]+l()*(t.length[1]-t.length[0]),p=[r[0]+i*f,r[1]+d*f];if(!ee(n,p))continue;let m=(l()-.5)*(t.curl??.5)*f,h=[(r[0]+p[0])/2-d*m,(r[1]+p[1])/2+i*m];u+=`M${g(r)}Q${g(h)} ${g(p)}`,e++}return u}var S=([e,t],[n,r]=[0,0])=>([i,a])=>{let[o,s]=b([i-e,a-t]);return b([o+n,s+r])},re=`#c98a52`,ie=`#fbf2e6`,ae=`#e2cdb6`,oe=`#f2b2ad`,se=`#d99893`,ce=`#120b09`,C=`#3b2417`,le=`#a8746a`,w={origin:[160,192],hip:[116,186],head:[180,152],tail:[99,162],legs:[[136,176],[190,176],[124,172],[182,176]]},ue=.85,T=[182,150],de=e=>Math.round(e*100)/100,E=([e,t])=>[de(T[0]+(e-T[0])*ue),de(T[1]+(t-T[1])*ue)],D={crown:E([200,92]),eyes:E([201,131]),head:E([199,112]),mark:E([216,80]),zzz:E([214,88]),mouth:E([238,152]),rear:[96,152],card:[204,179]},fe=[[92,160],[110,123],[150,115],E([164,89]),E([230,85]),E([242,112]),E([252,140]),E([228,168]),[200,193],[100,192]],pe=[[103,138],[121,124.5],[147,118.5],[172,121.5],[190,132],[198.5,149],[199,168],[191,183.5],[166,189.5],[136,190.5],[111,187.5],[98.5,176],[95,157]],me=[[201,94],[219,96.5],[233,106],[240.5,121],[241.5,137],[236,151],[224,161],[206,166],[188,163.5],[173,155],[164.5,140],[165.5,121],[174,105],[187,96.5]],he=[[171,136],[180,139],[185,148],[182,158],[172,164],[161,160],[157,150],[161,140]],ge=[[232,137],[240,140],[244,149],[240,157],[231,160],[224,155],[223,146],[226,139]],_e=[[193,138.5],[199,135.5],[205,134.5],[211,135.5],[218,138.5],[225.5,145],[226,155],[218,164.5],[205,168.5],[192,165.5],[184.5,157],[184.5,146]],ve=[[124,157],[134,160],[138,170],[134,181],[124,185],[113,181],[110,170],[114,160]],ye=[[92,161.5],[97,162],[98.5,166],[95,169],[90.5,167.5]],be=[147,152],xe=[177,146],Se=[226,145],Ce={c:[175,99],rx:12,ry:13,rot:-18,pivot:[180,110],inner:[177.2,101.8]},we={c:[227,97],rx:11,ry:12,rot:18,pivot:[221,107],inner:[225.2,99.6]},Te={c:[186,132],rx:4.6,ry:5},Ee={c:[217,131],rx:4.1,ry:4.7},De=[205,149],Oe=[[180,109],[194,99.5],[209,96.5],[222,99.5],[233,106.5],[241,116],[247,126],[251.5,133.5],[252,139.5],[248.5,145],[241.5,149.5],[230,155.5],[214,161.5],[196,163.5],[182,158],[174,143],[173.5,124]],ke=[[251,139],[248.5,145.5],[241.5,150.5],[230,157],[214,163],[196,164.5],[184.5,158.5],[183.5,151],[190,144.5],[200,141],[211,140],[222,138.6],[233,137.8],[243,138],[249.5,138.5]],Ae=[[213,146],[222,144.5],[230,148],[232.5,154],[228,159],[219,161],[210,157.5],[208,151.5]],je=[225,148],Me={c:[195,94.5],rx:11.5,ry:13.5,rot:-20,pivot:[201,106],inner:[197.6,96]},Ne={c:[208.5,92],rx:8.5,ry:10.5,rot:6,pivot:[207,103],inner:[209.8,93.5]},Pe={c:[226,122.8],rx:4.5,ry:5.1},Fe=[246,144],Ie=([e,t])=>{let[n,r]=[e-150,t-170],i=Math.hypot(n,r)||1;return[r/i-.35,-n/i+.55]},Le=S([205,142],[0,.15]),Re=S([176,144],[-.2,.5]),ze=S([228,143],[.2,.5]),Be=S([252,141],[0,-.05]),Ve=S([247,142],[0,.45]),He=S([228,146],[-.2,.4]),Ue=([e,t],[n,r])=>e>183&&t<166?0:1.6+1.6*Math.max(0,-n)+1.4*Math.max(0,r)+.4*Math.max(0,n),We=(e,[t,n])=>n>.35?0:1.4+.8*Math.max(0,-n)+.4*Math.abs(t),Ge=([e,t],[,n])=>e<188&&t>126?1.2:e>243?.45:1.3+.7*Math.max(0,-n),Ke=([e],[t,n])=>e>244?.5:n<-.3?1:1.5+.6*Math.max(0,n)+.5*Math.max(0,-t);function O(e,t,n,r,i=.45){return{fill:te(e,{length:(e,n)=>t(e,n)*i,flow:n,seed:r,spacing:[2.4,4]}),fuzz:ne(e,{length:t,flow:n,seed:r+1,spacing:.8}),wisps:ne(e,{length:(e,n)=>t(e,n)*1.6,flow:n,seed:r+2,spacing:3.4})}}var qe=O(pe,Ue,Ie,11),Je=O(me,We,Le,23),Ye=O(he,()=>2.1,Re,31),Xe=O(ge,()=>1.8,ze,37),Ze=O(_e,(e,[,t])=>t>.4?1.9:1.3,S([205,152]),41,.3),Qe=O(ve,(e,[,t])=>t>.15?2:0,Ie,43,.3),$e=O(ye,()=>1.3,()=>[-1,.3],47),et=O(Oe,Ge,Be,51),tt=O(ke,Ke,Ve,61,.35),nt=O(Ae,()=>1.5,He,71,.35),k=(e,t,n=!0)=>`<path d="${e.fill}" fill="${t}"/><path d="${e.fuzz}" stroke="${t}" stroke-width=".75" stroke-linecap="round"/>${n?`<path d="${e.wisps}" stroke="${t}" stroke-width=".5" stroke-linecap="round" opacity=".85"/>`:``}`,rt=(e,t,n,r)=>`<path d="${e}" stroke="${t}" stroke-width="${n}" stroke-linecap="round" opacity="${r}"/>`;function A(e,t,n,r=``){return`<g data-part="${e}"${t?` data-pivot="${g(t)}"`:``}${r?` ${r}`:``}>${n}</g>`}var j=([e,t],n,r,i,a=0)=>`<ellipse cx="${e}" cy="${t}" rx="${n}" ry="${r}"${a?` transform="rotate(${a} ${e} ${t})"`:``} ${i}/>`;function it(e,t,n,r,i,a,o,s,c=!1){let l=Math.hypot(t[0]-e[0],t[1]-e[1]),[u,d]=[(t[0]-e[0])/l,(t[1]-e[1])/l],f=[(e[0]+t[0])/2,(e[1]+t[1])/2],p=O(Array.from({length:12},(e,t)=>{let r=t/12*Math.PI*2,i=Math.cos(r)*(l/2+n*.3),a=n/2*Math.sin(r)*(Math.cos(r)>0?.82:1);return[f[0]+u*i-d*a,f[1]+d*i+u*a]}),()=>1.2,()=>[u,d],s),[m,h]=i,_=c?`<path d="M${g([m+a[0]*.25,h-a[1]*.2])}v${a[1]*.8}M${g([m+a[0]*.62,h-a[1]*.35])}v${a[1]*.8}" stroke="${se}" stroke-width=".55" stroke-linecap="round" opacity=".8"/>`:``;return`${k(p,r,!1)}
    ${j(i,a[0],a[1],`fill="${o}"`)}
    ${j([m-a[0]*.1,h-a[1]*.35],a[0]*.6,a[1]*.35,`fill="#fff" opacity=".35"`)}${_}`}function at(e,t,n=0){let[r,i]=e.c;return A(`ear`,e.pivot,`${j(e.c,e.rx,e.ry,`fill="url(#ham-ear-out)"`,e.rot)}
      ${j(e.inner,e.rx*.66*t,e.ry*.7,`fill="url(#ham-ear-in)"`,e.rot)}
      ${n?j(e.c,e.rx,e.ry,`fill="#5e4a3e" opacity="${n}"`,e.rot):``}
      <path d="M${g([r-e.rx*.75,i-e.ry*.35])}A${e.rx} ${e.ry} 0 0 1 ${g([r+e.rx*.75,i-e.ry*.38])}" transform="rotate(${e.rot} ${r} ${i})" stroke="#f6dccf" stroke-width=".9" stroke-linecap="round" opacity=".7"/>`)}function ot(e,t){let[n,r]=e.c;return A(`eye`,e.c,`${j(e.c,e.rx+.65,e.ry+.6,`fill="${C}"`)}${A(`pupil`,null,`${j(e.c,e.rx,e.ry,`fill="url(#ham-eye)"`)}
        ${j([n+e.rx*.3,r-e.ry*.34],1.3*t,1.45*t,`fill="#fff"`,-20)}
        <circle cx="${n-e.rx*.34}" cy="${r+e.ry*.42}" r="${.55*t}" fill="#fff" opacity=".65"/>`)}`)}function st([e,t],n){let r=e=>(e*n).toFixed(2);return`<path data-part="swirl" data-pivot="${e} ${t}" d="M${e} ${t}m-${r(1.1)} 0a${r(1.1)} ${r(1.1)} 0 1 1 ${r(2.2)} 0 ${r(2.2)} ${r(2.2)} 0 1 1-${r(4.4)} 0 ${r(3.3)} ${r(3.3)} 0 1 1 ${r(6.6)} 0 ${r(4.2)} ${r(4.2)} 0 1 1-${r(8.4)} 0" stroke="${C}" stroke-width="1.3" stroke-linecap="round"/>`}function ct(){let e=(e,t,n)=>`<radialGradient id="${e}"><stop offset="0" stop-color="${t}" stop-opacity="${n}"/><stop offset="1" stop-color="${t}" stop-opacity="0"/></radialGradient>`;return`
    <linearGradient id="ham-coat" gradientUnits="userSpaceOnUse" x1="0" y1="116" x2="0" y2="194">
      <stop offset="0" stop-color="#f6d3a8"/>
      <stop offset=".12" stop-color="#edb57d"/>
      <stop offset=".36" stop-color="#e5a668"/>
      <stop offset=".52" stop-color="#e9b483"/>
      <stop offset=".62" stop-color="#f2d6b7"/>
      <stop offset=".72" stop-color="#faefe2"/>
      <stop offset="1" stop-color="#ebd7c2"/>
    </linearGradient>
    <radialGradient id="ham-head" gradientUnits="userSpaceOnUse" cx="192" cy="108" r="62">
      <stop offset="0" stop-color="#f7d6ab"/>
      <stop offset=".35" stop-color="#efb980"/>
      <stop offset=".7" stop-color="#e6a86b"/>
      <stop offset="1" stop-color="#dc995c"/>
    </radialGradient>
    <linearGradient id="ham-cheek-near" gradientUnits="userSpaceOnUse" x1="165" y1="137" x2="178" y2="163">
      <stop offset="0" stop-color="#ebab6c"/>
      <stop offset=".42" stop-color="#f3cda3"/>
      <stop offset=".78" stop-color="#fbf1e6"/>
      <stop offset="1" stop-color="#f2e1ce"/>
    </linearGradient>
    <linearGradient id="ham-cheek-far" gradientUnits="userSpaceOnUse" x1="239" y1="137" x2="229" y2="160">
      <stop offset="0" stop-color="#e4a061"/>
      <stop offset=".42" stop-color="#f0c59a"/>
      <stop offset=".8" stop-color="#f9eee0"/>
      <stop offset="1" stop-color="#eddac6"/>
    </linearGradient>
    <radialGradient id="ham-muzzle" gradientUnits="userSpaceOnUse" cx="205" cy="152" r="22">
      <stop offset="0" stop-color="#fffdfa"/>
      <stop offset=".65" stop-color="#fdf6ee"/>
      <stop offset="1" stop-color="#f5e6d4"/>
    </radialGradient>
    <linearGradient id="ham-haunch" gradientUnits="userSpaceOnUse" x1="0" y1="157" x2="0" y2="188">
      <stop offset="0" stop-color="#e9b07a" stop-opacity="0"/>
      <stop offset=".36" stop-color="#efc196" stop-opacity=".4"/>
      <stop offset=".64" stop-color="#f9ecde"/>
      <stop offset="1" stop-color="#ebd8c4"/>
    </linearGradient>
    <linearGradient id="ham-tail" gradientUnits="userSpaceOnUse" x1="0" y1="160" x2="0" y2="170">
      <stop offset="0" stop-color="#eebf90"/>
      <stop offset="1" stop-color="#f6e4d2"/>
    </linearGradient>
    <linearGradient id="ham-ear-out" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c6afa4"/>
      <stop offset="1" stop-color="#97827a"/>
    </linearGradient>
    <radialGradient id="ham-ear-in" cx=".5" cy=".62" r=".62">
      <stop offset="0" stop-color="#c78b8a"/>
      <stop offset=".55" stop-color="#dcaaa6"/>
      <stop offset="1" stop-color="#ebc4be"/>
    </radialGradient>
    <radialGradient id="ham-eye" cx=".5" cy=".8" r=".75">
      <stop offset="0" stop-color="#55372a"/>
      <stop offset=".5" stop-color="#1d110c"/>
      <stop offset="1" stop-color="${ce}"/>
    </radialGradient>
    <linearGradient id="ham-nose" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8c9c9"/>
      <stop offset="1" stop-color="#de8e96"/>
    </linearGradient>
    <radialGradient id="ham-side-head" gradientUnits="userSpaceOnUse" cx="214" cy="106" r="58">
      <stop offset="0" stop-color="#f7d6ab"/>
      <stop offset=".35" stop-color="#efb980"/>
      <stop offset=".7" stop-color="#e6a86b"/>
      <stop offset="1" stop-color="#dc995c"/>
    </radialGradient>
    <linearGradient id="ham-side-jaw" gradientUnits="userSpaceOnUse" x1="0" y1="139" x2="0" y2="168">
      <stop offset="0" stop-color="#fbf0e4" stop-opacity="0"/>
      <stop offset=".22" stop-color="#fcf3e9" stop-opacity=".7"/>
      <stop offset=".4" stop-color="#fdf7f0"/>
      <stop offset=".76" stop-color="#fffbf6"/>
      <stop offset="1" stop-color="#efdfcd"/>
    </linearGradient>
    <radialGradient id="ham-side-cheek" gradientUnits="userSpaceOnUse" cx="220" cy="151" r="14">
      <stop offset="0" stop-color="#fffefb"/>
      <stop offset=".7" stop-color="#fffaf4"/>
      <stop offset="1" stop-color="#fdf6ee"/>
    </radialGradient>
    ${e(`ham-saddle`,`#a8642f`,.42)}
    ${e(`ham-ash`,`#8f664b`,.55)}
    ${e(`ham-glow`,`#fff6ea`,.95)}
    ${e(`ham-sheen`,`#ffffff`,.4)}
    ${e(`ham-shade`,`#7a4626`,.3)}
    <clipPath id="ham-coat-clip"><path d="${qe.fill}"/></clipPath>
    <clipPath id="ham-head-clip"><path d="${Je.fill}"/></clipPath>
    <clipPath id="ham-side-clip"><path d="${et.fill}"/></clipPath>`}function lt(e,t,n,r,i,a){return`${rt(x(e,{count:r,length:i,flow:t,seed:n,where:a}),`#fff`,.55,.16)}${rt(x(e,{count:Math.round(r*.6),length:i,flow:t,seed:n+1,where:a}),`#6e3a1c`,.55,.11)}`}function ut(){return A(`tummy`,be,`${k(qe,`url(#ham-coat)`)}
      <g clip-path="url(#ham-coat-clip)">
        ${j([152,127],42,13,`fill="url(#ham-saddle)"`,4)}
        ${j([134,122],30,5.5,`fill="url(#ham-sheen)"`,-8)}
        ${j([111,177],18,15,`fill="url(#ham-glow)"`)}
        ${j([191,167],15,24,`fill="url(#ham-glow)"`)}
        ${j([178,140],20,22,`fill="url(#ham-shade)"`)}
        ${j([150,195],52,9,`fill="url(#ham-shade)"`)}
        ${lt(pe,Ie,101,90,[3.5,6.5],e=>e[1]<158-(e[0]<125?6:0))}
        ${rt(x(pe,{count:40,length:[3,5],flow:Ie,seed:107,where:([,e])=>e>151&&e<169}),`#fff8ee`,.7,.55)}
      </g>
      ${k(Qe,`url(#ham-haunch)`)}
      ${lt(ve,Ie,301,14,[2.5,4],([,e])=>e<168)}`)}function dt(){let e=`${k(Je,`url(#ham-head)`)}
      <g clip-path="url(#ham-head-clip)">
        ${j([202,106],14,9.5,`fill="url(#ham-ash)"`)}
        ${j([203,127],6,10,`fill="url(#ham-glow)"`)}
        ${j([186,132],8.5,8.5,`fill="url(#ham-glow)"`)}
        ${j([217,131],7.5,8,`fill="url(#ham-glow)"`)}
        ${j([186,104],12,5,`fill="url(#ham-sheen)"`,-18)}
        ${j([238,132],9,22,`fill="url(#ham-shade)"`)}
        ${lt(me,Le,201,50,[2.5,4.5],([,e])=>e<126)}
      </g>`,t=(e,t,n,r,i)=>`${k(e,`url(#${n})`)}${lt(t,r,i,14,[2.2,3.6],([,e])=>e<150)}`,n=`M197 144.5Q183 139 170 137.5M196.5 146.5Q182 144.5 167.5 145M197 148.3Q183 150.5 169.5 154M198 150Q186 155 175 160.5M213 144.5Q229 139.5 249 137M213.5 146.5Q231 145 252 146M213 148.3Q229 151 249.5 155M212 150Q225 155.5 243 161`,r=`
      ${k(Ze,`url(#ham-muzzle)`)}
      <g id="eye-open" data-eye="open">${ot(Te,1)}${ot(Ee,.9)}</g>
      <path id="eye-closed" data-eye="closed" d="M180.6 132.4Q186 136 191.4 132.4M212.4 131.4Q217 134.6 221.6 131.4" stroke="${C}" stroke-width="1.5" stroke-linecap="round" opacity="0"/>
      <path id="eye-happy" data-eye="happy" d="M180.8 134.4Q186 128.2 191.2 134.4M212.6 133.4Q217 127.8 221.4 133.4" stroke="${C}" stroke-width="1.6" stroke-linecap="round" opacity="0"/>
      <g id="eye-grumpy" data-eye="grumpy" opacity="0">
        <path d="M180.8 130.2L191.4 133.6Q190.4 137.6 186 137.6Q181.2 137.4 180.8 130.2ZM222.2 129.2L212.4 132.6Q213.4 136.6 217 136.6Q221.8 136.4 222.2 129.2Z" fill="${ce}"/>
        <path d="M179.8 129.6L192 133.4M223.2 128.6L211.8 132.4" stroke="${C}" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="187.6" cy="135" r=".8" fill="#fff" opacity=".85"/><circle cx="218.2" cy="134.2" r=".7" fill="#fff" opacity=".85"/>
      </g>
      <g id="eye-swirl" data-eye="swirl" opacity="0">${st(Te.c,.92)}${st(Ee.c,.82)}</g>
      <path d="M199.7 138.8C201.4 137.1 208.6 137.1 210.3 138.8C211.4 140.2 208.6 144.1 206.7 145.2C205.7 145.8 204.3 145.8 203.3 145.2C201.4 144.1 198.6 140.2 199.7 138.8Z" fill="url(#ham-nose)"/>
      ${j([204.5,138.7],2.3,.95,`fill="#fff" opacity=".7"`)}
      <path d="M202 142.2q1 1.2 2.1.9M208 142.2q-1 1.2-2.1.9M205 145.7v1.8" stroke="${le}" stroke-width=".65" stroke-linecap="round"/>
      ${A(`mouth`,De,`${j([205,149.1],1.7,.5,`fill="#6d3f36" opacity=".85"`)}<path d="M201.6 147.4Q203.3 149.3 205 147.6 206.7 149.3 208.4 147.4" stroke="${le}" stroke-width=".85" stroke-linecap="round" stroke-linejoin="round"/>`)}
      <g stroke-linecap="round">
        <path d="${n}" stroke="#4a2f20" stroke-width=".9" opacity=".2"/>
        <path d="${n}" stroke="#fffaf2" stroke-width=".45" opacity=".9"/>
      </g>`;return A(`head`,w.head,`<g transform="translate(${g(T)}) scale(${ue}) translate(${g([-T[0],-T[1]])})">
      <g id="head-front">${at(we,.85)}${at(Ce,1)}${e}
      ${A(`pouch`,Se,t(Xe,ge,`ham-cheek-far`,ze,223))}
      ${A(`pouch`,xe,t(Ye,he,`ham-cheek-near`,Re,227))}
      ${r}</g>
      <g id="head-side" opacity="0" visibility="hidden">${ft()}</g>
    </g>`)}function ft(){let[e,t]=Pe.c,n=`${k(et,`url(#ham-side-head)`)}
      <g clip-path="url(#ham-side-clip)">
        ${j([211,104],17,8.5,`fill="url(#ham-ash)"`,8)}
        ${j([239,119],7,4,`fill="url(#ham-glow)" opacity=".55"`,40)}
        ${j(Pe.c,8,7.5,`fill="url(#ham-glow)"`)}
        ${j([203,101],11,3.6,`fill="url(#ham-sheen)"`,-8)}
        ${j([178,136],8,20,`fill="url(#ham-shade)" opacity=".4"`)}
        ${lt(Oe,Be,501,46,[2.5,4.5],([e,t])=>t<133&&e>184)}
      </g>`,r=`M245 140.2Q258 135.5 273 133M245.5 141.8Q260 140.2 276 141.2M245 143.3Q259 145.8 273 150.4M244 144.8Q254 150.4 264.5 158M243.5 139Q255 131 267 125`,i=`M${g([e-5.1,t-2.7])}L${g([e+5.5,t+.5])}Q${g([e+4.9,t+5.3])} ${g([e+.1,t+5.5])}Q${g([e-4.7,t+5.3])} ${g([e-5.1,t-2.7])}Z`;return`
      <path d="M248.5 140Q263 135 279 131M249 142Q263 142.5 278 146.5" stroke="#fffaf2" stroke-width=".4" stroke-linecap="round" opacity=".55"/>
      ${at(Ne,.75,.22)}${at(Me,1)}${n}
      ${k(tt,`url(#ham-side-jaw)`)}
      ${A(`pouch`,je,k(nt,`url(#ham-side-cheek)`))}
      ${j([244.5,141.5],6.5,5,`fill="url(#ham-glow)"`)}
      <g data-eye="open">${ot(Pe,1)}</g>
      <path data-eye="closed" d="M${g([e-4.9,t+.7])}Q${g([e,t+4.9])} ${g([e+4.9,t+.7])}" stroke="${C}" stroke-width="1.5" stroke-linecap="round" opacity="0"/>
      <path data-eye="happy" d="M${g([e-4.7,t+2.7])}Q${g([e,t-3.7])} ${g([e+4.7,t+2.7])}" stroke="${C}" stroke-width="1.6" stroke-linecap="round" opacity="0"/>
      <g data-eye="grumpy" opacity="0">
        <path d="${i}" fill="${ce}"/>
        <path d="M${g([e-6.1,t-3.6])}L${g([e+6.3,t+.1])}" stroke="${C}" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="${e+1.9}" cy="${t+3.1}" r=".8" fill="#fff" opacity=".85"/>
      </g>
      <g data-eye="swirl" opacity="0">${st(Pe.c,.92)}</g>
      ${j([248.2,137.8],3.2,3.9,`fill="url(#ham-nose)"`,-22)}
      ${j([247.7,135.8],1.4,.7,`fill="#fff" opacity=".7"`,-22)}
      <path d="M250.4 136.4q-1.8.4-2.2 2.5" stroke="#c4737c" stroke-width=".8" stroke-linecap="round"/>
      ${A(`mouth`,Fe,`<path d="M248.2 141.8Q248.2 143.6 247.3 144.5Q245.4 146.1 242.6 145.7" stroke="${le}" stroke-width=".7" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>${j([245,145.7],1.6,.38,`fill="#6d3f36" opacity=".45"`)}`)}
      <g stroke-linecap="round">
        <path d="${r}" stroke="#4a2f20" stroke-width=".9" opacity=".2"/>
        <path d="${r}" stroke="#fffaf2" stroke-width=".45" opacity=".9"/>
        <path d="M228 117Q234.5 108.5 242 104.2M230 118.2Q238.5 112 246.5 110" stroke="#fffaf2" stroke-width=".4" opacity=".45"/>
      </g>`}function pt(){return`
      <g id="ham-body">
        ${A(`leg-0`,w.legs[0],it([136,174],[139,185],8,re,[141,188.5],[6.2,2.9],se,401))}
        ${A(`leg-1`,w.legs[1],it([190,175],[192.5,184],6.5,ae,[194.5,187.4],[4.6,2.8],se,411))}
        ${A(`tail`,w.tail,k($e,`url(#ham-tail)`,!1))}
        ${ut()}
        ${dt()}
        <g id="question" opacity="0">
          <rect x="189" y="162" width="30" height="34" rx="9" fill="#fffdf8" stroke="#8e7cf3" stroke-width="2.2"/>
          <text x="204" y="188" text-anchor="middle" font-size="24" font-weight="800" fill="#6f5ce6" class="glyph">?</text>
        </g>
        ${A(`leg-2`,w.legs[2],it([127,179],[129.5,186],7.5,`#f6e8d8`,[130.5,189],[8.2,3.2],oe,421,!0))}
        ${A(`leg-3`,w.legs[3],`${it([182,174],[184.5,184],7.5,ie,[186.8,187.6],[5.2,3.2],oe,431,!0)}
            <use id="held-bean" href="#bean" x="176" y="171" width="26" height="26" opacity="0"/>`)}
      </g>`}var M={cx:96,cy:117,rim:74,tread:68},N={x:180,y:205},mt={x:250,y:205},ht=.62,P={wheel:{x:96,y:184,face:1},dish:{x:217,y:204,face:-1},nest:{x:247,y:201,face:-1}},gt=[[0,-10],[-7,-10],[7,-10],[-14,-10],[14,-10],[-3.5,-15.5],[3.5,-15.5],[-10.5,-15.5],[10.5,-15.5],[-3.5,-21],[3.5,-21],[0,-26.5]],_t=`#8a79e8`,F=`#7f95a6`,vt=`#c4b19c`,yt=e=>`<text id="z${e}" class="mark-text" font-size="${12+e*3}" x="0" y="0">Z</text>`,I=([e,t])=>`${e.toFixed(2)} ${t.toFixed(2)}`;function bt(e,t){let n=e*Math.PI/180;return[M.cx+t*Math.sin(n),M.cy-t*Math.cos(n)]}var xt=(e,t,n)=>`M${I(bt(e,n))}A${n} ${n} 0 0 1 ${I(bt(t,n))}`,L={outer:74,front:71.4,back:61.6,rim:59.8};function St(e){let[t,n]=[L.back+.8,L.front-.6],r=(t,n)=>[bt(e-n/t*(180/Math.PI),t),bt(e+n/t*(180/Math.PI),t)],[i,a]=r(t,1.2),[o,s]=r(n,1.85);return`M${I(i)}L${I(o)}L${I(s)}L${I(a)}Z`}function Ct(e,t){let[n,r]=[L.back+1.2,L.front-1],i=(n,r)=>bt(e+t*r/n*(180/Math.PI),n);return`M${I(i(n,1.2))}L${I(i(r,1.85))}`}var wt=(e,t=0)=>Array.from({length:18},(n,r)=>e(t+r*360/18)).join(``);function Tt(e){return wt(St,e)}function Et(){let{cx:e,cy:t}=M,n=e=>`
    <rect x="${e-3}" y="175" width="6" height="24" rx="1.4" fill="url(#acrylic)" stroke="${F}" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M${e-1.5} 177v20" stroke="#fff" stroke-opacity=".9" stroke-width=".9" stroke-linecap="round"/>
    <path d="M${e+1.6} 177.5v19" stroke="${F}" stroke-opacity=".25" stroke-width=".6" stroke-linecap="round"/>`;return`
  <g id="wheel">
    ${n(e-37)}${n(e+37)}
    <path d="M${e-50} 199.2c0-1.8 1.4-3 3.2-3h93.6c1.8 0 3.2 1.2 3.2 3v3.6c0 1.8-1.4 3-3.2 3h-93.6c-1.8 0-3.2-1.2-3.2-3Z" fill="url(#acrylic)" stroke="${F}" stroke-opacity=".6" stroke-width=".85"/>
    <path d="M${e-46} 197.9h92" stroke="#fff" stroke-opacity=".9" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M${e-47.5} 203.6h95" stroke="${F}" stroke-opacity=".28" stroke-width=".8" stroke-linecap="round"/>
    <circle cx="${e}" cy="${t}" r="${(L.front+L.back)/2}" stroke="url(#acrylic-band)" stroke-width="${L.front-L.back}"/>
    <circle cx="${e}" cy="${t}" r="${L.back}" stroke="${F}" stroke-opacity=".42" stroke-width=".9"/>
    <circle cx="${e}" cy="${t}" r="${L.rim}" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/>
    <circle cx="${e}" cy="${t}" r="${L.rim-1}" stroke="${F}" stroke-opacity=".3" stroke-width=".6"/>
    <g id="rotor">
      <g id="wheel-trails" opacity="0">
        <path d="${Tt(-4.4)}" fill="#fff" opacity=".3"/>
        <path d="${Tt(-8.4)}" fill="#fff" opacity=".18"/>
      </g>
      <g id="wheel-treads">
        <path d="${Tt(0)}" fill="#fff" fill-opacity=".42"/>
        <path d="${wt(e=>Ct(e,-.55))}" stroke="#fff" stroke-opacity=".95" stroke-width=".7" stroke-linecap="round"/>
        <path d="${wt(e=>Ct(e,.85))}" stroke="${F}" stroke-opacity=".56" stroke-width=".55" stroke-linecap="round"/>
      </g>
    </g>
    <circle id="wheel-blur" cx="${e}" cy="${t}" r="${(L.front+L.back)/2}" stroke="url(#acrylic-blur)" stroke-width="${L.front-L.back-1.2}" opacity="0"/>
  </g>`}function Dt(){let{cx:e,cy:t}=M;return`
  <g id="wheel-front">
    <circle cx="${e}" cy="${t}" r="${(L.outer+L.front)/2}" stroke="#fff" stroke-opacity=".42" stroke-width="${L.outer-L.front}"/>
    <circle cx="${e}" cy="${t}" r="${L.outer}" stroke="${F}" stroke-opacity=".62" stroke-width=".9"/>
    <circle cx="${e}" cy="${t}" r="${L.front}" stroke="${F}" stroke-opacity=".4" stroke-width=".7"/>
    <g stroke="#fff" stroke-linecap="round" fill="none">
      <path d="${xt(286,338,L.outer-1.3)}" stroke-width="1.6" opacity=".95"/>
      <path d="${xt(296,322,L.front+1)}" stroke-width=".9" opacity=".8"/>
      <path d="${xt(94,128,L.outer-1.3)}" stroke-width="1.3" opacity=".8"/>
      <path d="${xt(160,172,L.outer-1.3)}" stroke-width="1.1" opacity=".7"/>
      <path d="${xt(300,330,L.back+3)}" stroke-width="2.4" opacity=".28"/>
    </g>
  </g>`}var Ot=`
    <path d="M205 197a45 13.5 0 0 0 90 0c0-1.1-.2-2.2-.6-3.2L276 194.5a26 6.5 0 0 1-52 0l-18.4-.7c-.4 1-.6 2.1-.6 3.2Z" fill="url(#bed-rim)" stroke="${vt}" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M214.5 203.6c9 3.2 21.5 4.7 35.5 4.7" stroke="#fff" stroke-opacity=".75" stroke-width="1.6" stroke-linecap="round"/>`;function kt(){return`
  <g id="nest-back">
    <ellipse cx="250" cy="197" rx="45" ry="13.5" fill="url(#bed-rim)" stroke="${vt}" stroke-width="1.1"/>
    <ellipse cx="250" cy="194.5" rx="26" ry="6.5" fill="url(#bed-cushion)" stroke="${vt}" stroke-width="1"/>
    <path d="M224 194.5a26 6.5 0 0 1 52 0c-6-2.8-15.5-4-26-4s-20 1.2-26 4Z" fill="#d9c7b1" opacity=".55"/>
    <path d="M216 190.2c8.5-3.6 20.5-5.4 34-5.4s25.5 1.8 34 5.4" stroke="#fff" stroke-opacity=".85" stroke-width="2" stroke-linecap="round"/>
    ${Ot}
  </g>`}function At(){return`<svg class="scene" viewBox="0 0 300 214" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>${ct()}
    <radialGradient id="soft-shadow">
      <stop offset="0" stop-color="#2b2140" stop-opacity=".24"/>
      <stop offset=".65" stop-color="#2b2140" stop-opacity=".09"/>
      <stop offset="1" stop-color="#2b2140" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="acrylic" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".62"/>
      <stop offset=".5" stop-color="#e3edf4" stop-opacity=".3"/>
      <stop offset="1" stop-color="#cddbe6" stop-opacity=".42"/>
    </linearGradient>
    <radialGradient id="acrylic-band" gradientUnits="userSpaceOnUse" cx="${M.cx}" cy="${M.cy}" r="${L.front}">
      <stop offset="${(L.back/L.front).toFixed(3)}" stop-color="#dbe6ee" stop-opacity=".12"/>
      <stop offset="1" stop-color="#f4f8fb" stop-opacity=".26"/>
    </radialGradient>
    <radialGradient id="acrylic-blur" gradientUnits="userSpaceOnUse" cx="${M.cx}" cy="${M.cy}" r="${L.front}">
      <stop offset="${(L.back/L.front).toFixed(3)}" stop-color="#ffffff" stop-opacity=".22"/>
      <stop offset=".93" stop-color="#ffffff" stop-opacity=".5"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity=".3"/>
    </radialGradient>
    <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".6" stop-color="#f6f2ec"/>
      <stop offset="1" stop-color="#e2dad0"/>
    </linearGradient>
    <linearGradient id="bowl-inside" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6dfd6"/>
      <stop offset="1" stop-color="#fbf9f6"/>
    </linearGradient>
    <radialGradient id="bed-rim" gradientUnits="userSpaceOnUse" cx="250" cy="192" r="47" gradientTransform="translate(0 132) scale(1 .31)">
      <stop offset="0" stop-color="#fdf9f3"/>
      <stop offset=".72" stop-color="#f1e7da"/>
      <stop offset="1" stop-color="#dfcfbb"/>
    </radialGradient>
    <radialGradient id="bed-cushion" cx=".5" cy=".85" r=".85">
      <stop offset="0" stop-color="#fffdf9"/>
      <stop offset="1" stop-color="#f1e7db"/>
    </radialGradient>
    <radialGradient id="bean-glow">
      <stop offset="0" stop-color="#9eeaff" stop-opacity=".9"/>
      <stop offset=".55" stop-color="#38c2f2" stop-opacity=".28"/>
      <stop offset="1" stop-color="#38c2f2" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bean-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#83e2ff"/>
      <stop offset="1" stop-color="#24a8e2"/>
    </linearGradient>
    <radialGradient id="gold-glow">
      <stop offset="0" stop-color="#fff1b0" stop-opacity=".95"/>
      <stop offset=".5" stop-color="#ffd257" stop-opacity=".35"/>
      <stop offset="1" stop-color="#ffd257" stop-opacity="0"/>
    </radialGradient>
    <symbol id="bean" viewBox="-9 -9 18 18" overflow="visible">
      <circle class="bean-halo" r="8.5" fill="url(#bean-glow)"/>
      <ellipse rx="4.6" ry="3.5" fill="url(#bean-body)" stroke="#1a8cc6" stroke-width=".9"/>
      <ellipse cx="-1.5" cy="-1.3" rx="1.7" ry=".95" fill="#fff" opacity=".9"/>
    </symbol>
    <symbol id="gold-block" viewBox="-16 -16 32 32" overflow="visible">
      <circle r="16" fill="url(#gold-glow)"/>
      <path d="M0-11 10-5.5 0 0-10-5.5Z" fill="#ffe7a0"/>
      <path d="M-10-5.5 0 0v12l-10-5.5Z" fill="#f7bf3e"/>
      <path d="M10-5.5 0 0v12l10-5.5Z" fill="#e39c22"/>
      <path d="M0-11 10-5.5v12L0 12l-10-5.5v-12ZM-10-5.5 0 0l10-5.5M0 0v12" stroke="#c9861a" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M-5.5-6.8 0-9.8" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>
    </symbol>
    <symbol id="heart" viewBox="-8 -8 16 16" overflow="visible">
      <path d="M0 5.6C-2.2 4-7 .9-7-2.6A3.6 3.6 0 0 1 0-4.1 3.6 3.6 0 0 1 7-2.6C7 .9 2.2 4 0 5.6Z" fill="#ff7f98" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
      <ellipse cx="-3.4" cy="-2.2" rx="1.4" ry=".9" transform="rotate(-30 -3.4 -2.2)" fill="#fff" opacity=".8"/>
    </symbol>
    <symbol id="note" viewBox="-8 -8 16 16" overflow="visible">
      <path d="M1.5-6.5v9M1.5-6.5c2.2.8 4.2 2.3 3.5 5" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="-.8" cy="3" rx="2.8" ry="2.1" transform="rotate(-20 -.8 3)" fill="#fff"/>
      <path d="M1.5-6.5v9M1.5-6.5c2.2.8 4.2 2.3 3.5 5" stroke="${_t}" stroke-width="1.7" stroke-linecap="round"/>
      <ellipse cx="-.8" cy="3" rx="2.2" ry="1.6" transform="rotate(-20 -.8 3)" fill="${_t}"/>
    </symbol>
  </defs>

  <ellipse cx="${M.cx}" cy="206.5" rx="56" ry="4.2" fill="url(#soft-shadow)" opacity=".7"/>
  <ellipse cx="180" cy="206" rx="27" ry="3.8" fill="url(#soft-shadow)"/>
  <ellipse cx="250" cy="207" rx="54" ry="6" fill="url(#soft-shadow)"/>
  ${Et()}
  ${kt()}

  <g id="dish-back">
    <ellipse cx="180" cy="194.5" rx="21.5" ry="4.8" fill="url(#bowl-inside)" stroke="#b9ada0" stroke-width="1"/>
  </g>
  <g id="pile"></g>
  <g id="dish-front">
    <path d="M158.5 194.5c0 6.5 6.5 11 14.5 11h14c8 0 14.5-4.5 14.5-11-2.5 3-10.5 4.8-21.5 4.8s-19-1.8-21.5-4.8Z" fill="url(#bowl)" stroke="#b9ada0" stroke-width="1" stroke-linejoin="round"/>
    <path d="M163.6 199.8c1.3 2.2 3.4 3.6 6 4.2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M196.4 197.4c-.6 2-2 3.6-4 4.6" stroke="#a89a8c" stroke-opacity=".35" stroke-width="1" stroke-linecap="round"/>
  </g>
  <text id="overflow" class="mark-text overflow" x="${N.x+27}" y="${N.y-16}" font-size="10"></text>

  <g id="speed-lines" opacity="0" stroke-linecap="round">
    <path d="M0 0h14M-6 8h12M2 16h10" stroke="#fff" stroke-width="4.4"/>
    <path d="M0 0h14M-6 8h12M2 16h10" stroke="#b3a496" stroke-width="2.2"/>
  </g>

  <ellipse id="ham-shadow" cx="0" cy="0" rx="36" ry="4.2" fill="url(#soft-shadow)" opacity=".2"/>

  <g id="ham">
    <g transform="translate(-160 -192)">${pt()}
    </g>
  </g>

  ${Dt()}

  <g id="nest-front" opacity="0">${Ot}
  </g>

  <g id="flights"></g>

  <g id="zzz" opacity="0">${yt(0)}${yt(1)}${yt(2)}</g>
  <text id="mark" class="mark-text" font-size="20" x="0" y="0" opacity="0"></text>
  <g id="dots" opacity="0" fill="${_t}" stroke="#ffffff" stroke-width="1.6">
    <circle cx="-7" r="2.7"/><circle r="2.7"/><circle cx="7" r="2.7"/>
  </g>
  <use id="heart-mark" href="#heart" width="16" height="16" x="-8" y="-8" opacity="0"/>
  <use id="note-mark" href="#note" width="16" height="16" x="-8" y="-8" opacity="0"/>
  <g id="steam" opacity="0" stroke-linecap="round">
    <path d="M-6-2.5c2.6 0 3.6-1 3.6-3.6M2.5-6c0 2.6 1 3.6 3.6 3.6M6 2.5c-2.6 0-3.6 1-3.6 3.6M-2.5 6c0-2.6-1-3.6-3.6-3.6" stroke="#ffffff" stroke-width="4.6"/>
    <path d="M-6-2.5c2.6 0 3.6-1 3.6-3.6M2.5-6c0 2.6 1 3.6 3.6 3.6M6 2.5c-2.6 0-3.6 1-3.6 3.6M-2.5 6c0-2.6-1-3.6-3.6-3.6" stroke="#f0525e" stroke-width="2.4"/>
  </g>
  <g id="burp" opacity="0" fill="#d4f4ff" stroke="#38b6e8" stroke-width="1">
    <circle r="3.2"/><circle r="2.4"/><circle r="1.7"/>
  </g>

  <g id="celebration" opacity="0">
    <g id="sparkles" fill="#ffd257" stroke="#fff6d2" stroke-width=".8">
      <path d="M0-5 1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3Z"/>
      <path d="M0-4 1-1 4 0 1 1 0 4-1 1-4 0-1-1Z"/>
      <path d="M0-4.5 1.1-1.1 4.5 0 1.1 1.1 0 4.5-1.1 1.1-4.5 0-1.1-1.1Z"/>
      <path d="M0-3.5.9-.9 3.5 0 .9.9 0 3.5-.9.9-3.5 0-.9-.9Z"/>
    </g>
    <use href="#gold-block" width="32" height="32" x="-16" y="-16"/>
    <text id="celebration-text" class="mark-text gold" x="0" y="-19" font-size="12" text-anchor="middle"></text>
  </g>
</svg>`}function jt(e,t,n,r){return{x:e,y:t,face:n,scale:r,hop:0,squashX:1,squashY:1,lie:0,tilt:0,head:0,profile:0,ear:0,earScale:1,tail:0,legs:[0,0,0,0],tuck:1,eye:`open`,blink:0,pupilX:0,pupilY:0,pouch:0,bulge:0,chew:0,holdBean:!1,question:!1,swirl:0}}function R(e,t,n){let[r,i]=w.hip,a=e.tilt*Math.PI/180,o=r+(t-r)*Math.cos(a)-(n-i)*Math.sin(a),s=i+(t-r)*Math.sin(a)+(n-i)*Math.cos(a)+e.lie,[c,l]=w.origin;return{x:e.x+e.face*e.scale*e.squashX*(o-c),y:e.y+e.hop+e.scale*e.squashY*(s-l)}}var z=e=>Math.round(e*100)/100,B=(e,t,n)=>`translate(${e} ${t}) ${n} translate(${-e} ${-t})`,Mt=`http://www.w3.org/2000/svg`,Nt=(e,t,n)=>{let r=Math.min(1,Math.max(0,(n-e)/(t-e)));return r*r*(3-2*r)},Pt=class{constructor(e){this.el={},this.parts=new Map,this.eyes=new Map,this.pileBeans=[],this.flightBeans=[],this.cache=new WeakMap,this.lastWheel=null,this.spin=0,e.innerHTML=At(),this.svg=e.querySelector(`svg`);for(let e of this.svg.querySelectorAll(`[id]`))this.el[e.id]=e;for(let e of this.svg.querySelectorAll(`[data-part]`)){let[t=0,n=0]=(e.dataset.pivot??``).split(` `).map(Number),r=e.dataset.part;this.parts.set(r,[...this.parts.get(r)??[],{node:e,x:t,y:n}])}for(let e of this.svg.querySelectorAll(`[data-eye]`)){let t=e.dataset.eye;this.eyes.set(t,[...this.eyes.get(t)??[],e])}let t=this.el.pile;gt.forEach(([e,n])=>{let r=this.makeBean(N.x+e,N.y+n);t.appendChild(r),this.pileBeans.push(r)});for(let e=0;e<6;e++){let e=this.makeBean(0,0);this.el.flights.appendChild(e),this.flightBeans.push(e)}}makeBean(e,t){let n=document.createElementNS(Mt,`use`);return n.setAttribute(`href`,`#bean`),n.setAttribute(`width`,`18`),n.setAttribute(`height`,`18`),n.setAttribute(`x`,`-9`),n.setAttribute(`y`,`-9`),n.setAttribute(`transform`,`translate(${e} ${t})`),n}set(e,t,n){if(!e)return;let r=typeof n==`number`?String(z(n)):n,i=this.cache.get(e);i||this.cache.set(e,i=new Map),i.get(t)!==r&&(i.set(t,r),e.setAttribute(t,r))}part(e,t){for(let n of this.parts.get(e)??[])this.set(n.node,`transform`,t(n.x,n.y))}text(e,t){e&&e.textContent!==t&&(e.textContent=t)}apply(e){let t=e.pose,n=this.el;this.set(n.rotor,`transform`,`rotate(${z(e.wheelAngle%360)} ${M.cx} ${M.cy})`),this.applyWheelBlur(e.wheelAngle),this.set(n.ham,`transform`,`translate(${z(t.x)} ${z(t.y+t.hop)}) scale(${z(t.face*t.scale*t.squashX)} ${z(t.scale*t.squashY)})`),this.set(n[`ham-body`],`transform`,`translate(0 ${z(t.lie)}) rotate(${z(t.tilt)} ${w.hip[0]} ${w.hip[1]})`),t.legs.forEach((e,n)=>this.part(`leg-${n}`,(n,r)=>B(n,r,`rotate(${z(e)}) scale(1 ${z(t.tuck)})`)));let r=Nt(.32,.8,t.tuck);for(let e of[2,3])for(let t of this.parts.get(`leg-${e}`)??[])this.set(t.node,`opacity`,r);let i=1-.12*Math.sin(Math.PI*Math.min(1,Math.max(0,t.profile))),[a,o]=D.eyes,s=i<.999?` ${B(a,o,`scale(${z(i)} 1)`)}`:``;this.part(`head`,(e,n)=>`rotate(${z(t.head)} ${e} ${n})${s}`);let c=Nt(.38,.62,t.profile);this.set(n[`head-front`],`opacity`,1-c),this.set(n[`head-front`],`visibility`,c>=1?`hidden`:`visible`),this.set(n[`head-side`],`opacity`,c),this.set(n[`head-side`],`visibility`,c<=0?`hidden`:`visible`),this.part(`ear`,(e,n)=>B(e,n,`rotate(${z(t.ear)}) scale(${z(t.earScale)})`)),this.part(`tail`,(e,n)=>`rotate(${z(t.tail)} ${e} ${n})`),this.part(`pupil`,()=>`translate(${z(t.pupilX)} ${z(t.pupilY)})`);for(let[e,n]of this.eyes)for(let r of n)this.set(r,`opacity`,+(t.eye===e));this.part(`eye`,(e,n)=>B(e,n,`scale(1 ${z(Math.max(.08,1-t.blink))})`)),this.part(`swirl`,(e,n)=>`rotate(${z(t.swirl)} ${e} ${n})`),this.part(`pouch`,(e,n)=>B(e,n,`scale(${z(1+.4*t.pouch)})`)),this.part(`tummy`,(e,n)=>B(e,n,`scale(${z(1+.05*t.bulge)} ${z(1+.1*t.bulge)})`)),this.part(`mouth`,(e,n)=>B(e,n,`scale(1 ${z(1+1.4*t.chew)})`)),this.set(n[`held-bean`],`opacity`,+!!t.holdBean),this.set(n.question,`opacity`,+!!t.question);let[l,u]=D.card;this.set(n.question,`transform`,`rotate(${z(-t.tilt*.8)} ${l} ${u}) ${B(l,u,`scale(${t.face<0?-1:1} 1)`)}`);let d=t.y+Math.max(0,-t.hop)+1.5,f=Math.min(.6,Math.max(0,-t.hop)/40);this.set(n[`ham-shadow`],`transform`,`translate(${z(t.x)} ${z(d-Math.max(0,-t.hop))}) scale(${z(t.scale*1.6*(1-f))} 1)`),this.set(n[`ham-shadow`],`opacity`,.2*(1-f)),this.pileBeans.forEach((t,n)=>this.set(t,`visibility`,n<e.pile?`visible`:`hidden`)),this.text(n.overflow,e.overflow>0?`+${e.overflow}`:``),this.flightBeans.forEach((t,n)=>{let r=e.flights[n];this.set(t,`visibility`,r?`visible`:`hidden`),r&&this.set(t,`transform`,`translate(${z(r.x)} ${z(r.y)})`)}),this.set(n[`nest-front`],`opacity`,e.nestFront);let p=e.speedLines;if(this.set(n[`speed-lines`],`opacity`,p.opacity),p.opacity>0&&this.set(n[`speed-lines`],`transform`,`translate(${z(p.x+p.shift)} ${z(p.y)})`),this.set(n.zzz,`opacity`,e.zzz.opacity),e.zzz.opacity>0)for(let t=0;t<3;t++){let r=(e.zzz.t/2400+t/3)%1;this.set(n[`z${t}`],`transform`,`translate(${z(e.zzz.x+t*7+3*Math.sin(r*6))} ${z(e.zzz.y-t*8-r*12)})`),this.set(n[`z${t}`],`opacity`,Math.sin(Math.PI*r))}this.applyMark(e.mark);let m=e.burp;this.set(n.burp,`opacity`,m?1-m.t:0),m&&[...n.burp.children].forEach((e,t)=>{this.set(e,`cx`,m.x+4+t*4+m.t*6),this.set(e,`cy`,m.y-4-t*5-m.t*(14+t*6))});let h=e.celebration;this.set(n.celebration,`opacity`,h?Math.min(1,h.t*6,(1-h.t)*5):0),h&&(this.set(n.celebration,`transform`,`translate(${z(h.x)} ${z(h.y)})`),this.text(n[`celebration-text`],h.text),[...n.sparkles.children].forEach((e,t)=>{let n=h.t*5+t*Math.PI/2,r=21+4*Math.sin(h.t*18+t);this.set(e,`transform`,`translate(${z(Math.cos(n)*r)} ${z(Math.sin(n)*r*.7)}) scale(${z(.7+.4*Math.abs(Math.sin(h.t*14+t)))})`)}))}applyWheelBlur(e){let t=e%360,n=this.lastWheel===null?0:Math.abs((t-this.lastWheel+540)%360-180);this.lastWheel=t,this.spin+=(n/20-this.spin)*.35;let r=Nt(.26,.5,this.spin);this.set(this.el[`wheel-trails`],`opacity`,Nt(.04,.18,this.spin)*(1-r)),this.set(this.el[`wheel-treads`],`opacity`,1-.82*r),this.set(this.el[`wheel-blur`],`opacity`,r)}applyMark(e){let t=this.el,n=Math.min(1,e.t*8,(1-e.t)*4),r=e.t*10;this.set(t.mark,`opacity`,e.kind===`exclaim`?n:0),e.kind===`exclaim`&&(this.text(t.mark,`!`),this.set(t.mark,`x`,e.x),this.set(t.mark,`y`,e.y-r*.6)),this.set(t.dots,`opacity`,+(e.kind===`dots`)),e.kind===`dots`&&(this.set(t.dots,`transform`,`translate(${z(e.x)} ${z(e.y-4)})`),[...t.dots.children].forEach((t,n)=>this.set(t,`opacity`,.35+.65*Math.max(0,Math.sin(Math.PI*(e.t*3-n)))))),this.set(t[`heart-mark`],`opacity`,e.kind===`heart`?n:0),e.kind===`heart`&&this.set(t[`heart-mark`],`transform`,`translate(${z(e.x)} ${z(e.y-r*1.5)}) scale(${z(.8+e.t*.5)})`),this.set(t[`note-mark`],`opacity`,e.kind===`note`?n:0),e.kind===`note`&&this.set(t[`note-mark`],`transform`,`translate(${z(e.x+4*Math.sin(e.t*9))} ${z(e.y-r*1.6)})`),this.set(t.steam,`opacity`,e.kind===`steam`?n:0),e.kind===`steam`&&this.set(t.steam,`transform`,`translate(${z(e.x+8)} ${z(e.y+4)}) scale(${z(.85+.25*Math.abs(Math.sin(e.t*14)))})`)}},V=class extends Error{constructor(e,t){super(`${e}: ${t}`),this.path=e,this.name=`InvalidStatusError`}},Ft=class extends Error{constructor(e){super(`Unsupported /v1/status schemaVersion ${String(e)}`),this.schemaVersion=e,this.name=`UnsupportedSchemaError`}},It=[`IDLE`,`ACTIVE`,`COUNTER_FAULT`],Lt=[`hardware`,`simulated`,`replay`,`derived`],Rt=[`online`,`stale`],zt=/^(0|[1-9][0-9]*)$/;function Bt(e,t){if(typeof e!=`object`||!e||Array.isArray(e))throw new V(t,`expected an object`);return e}function Vt(e,t){if(typeof e!=`string`||e.length===0)throw new V(t,`expected a non-empty string`);return e}function Ht(e,t){if(typeof e!=`string`||!zt.test(e))throw new V(t,`expected a decimal string`);return BigInt(e)}function Ut(e,t){if(typeof e!=`number`||!Number.isSafeInteger(e)||e<0)throw new V(t,`expected a non-negative integer`);return e}function Wt(e,t){let n=Vt(e,t),r=Date.parse(n);if(!Number.isFinite(r))throw new V(t,`expected an ISO timestamp`);return r}function Gt(e,t,n){if(typeof e!=`string`||!t.includes(e))throw new V(n,`expected one of ${t.join(`, `)}`);return e}function Kt(e){if(e===null)return null;let t=Bt(e,`measurement`);return{freshness:Gt(t.freshness,Rt,`measurement.freshness`),observedAt:Wt(t.observedAt,`measurement.observedAt`),receivedAt:Wt(t.receivedAt,`measurement.receivedAt`),staleAfterSeconds:Ut(t.staleAfterSeconds,`measurement.staleAfterSeconds`),counterEpoch:Vt(t.counterEpoch,`measurement.counterEpoch`),cumulativeWorkUnits:Ht(t.cumulativeWorkUnits,`measurement.cumulativeWorkUnits`),provenance:Gt(t.provenance,Lt,`measurement.provenance`),coreStatus:Gt(t.coreStatus,It,`measurement.coreStatus`),rpm:Ut(t.rpmMilli,`measurement.rpmMilli`)/1e3,speedMmPerSecond:Ut(t.speedMmPerSecond,`measurement.speedMmPerSecond`),distanceMm:Ut(t.distanceMm,`measurement.distanceMm`)}}function qt(e){if(e==null)return null;let t=Bt(e,`builder`);if(t.status!==`available`)return null;let n=Bt(t.anchor,`builder.anchor`);return{blockHeight:Ht(n.blockHeight,`builder.anchor.blockHeight`),settledThroughRound:Ht(n.settledThroughRound,`builder.anchor.settledThroughRound`),confirmedAt:n.confirmedAt==null?null:Wt(n.confirmedAt,`builder.anchor.confirmedAt`),transactionHash:typeof n.transactionHash==`string`?n.transactionHash:null}}function Jt(e){let t=Bt(e,`$`);if(t.schemaVersion!==1)throw new Ft(t.schemaVersion);if(!(`measurement`in t))throw new V(`measurement`,`missing`);return{installationId:Vt(t.installationId,`installationId`),revision:Vt(t.revision,`revision`),generatedAt:Wt(t.generatedAt,`generatedAt`),measurement:Kt(t.measurement),settlement:qt(t.builder),source:`api`}}function Yt(e,t){return e.freshness===`stale`||t-e.receivedAt>e.staleAfterSeconds*1e3}var Xt=`https://api.squeekchain.com`,Zt=`/v1/status`;function Qt(e,t){if(!e)return null;let n=Number(e);if(Number.isFinite(n)&&n>=0)return n*1e3;let r=Date.parse(e);return Number.isFinite(r)?Math.max(0,r-t):null}function $t(e=(e,t)=>fetch(e,t),t=Xt){let n=null;return{get last(){return n},async fetchStatus(r=Date.now()){let i;try{i=await e(t+Zt,{cache:`no-store`,credentials:`omit`})}catch(e){return{ok:!1,failure:{kind:`network`,message:e instanceof Error?e.message:String(e)}}}if(i.status===429)return{ok:!1,failure:{kind:`rate_limited`,retryAfterMs:Qt(i.headers.get(`Retry-After`),r)??5e3}};if(!i.ok)return{ok:!1,failure:{kind:`http`,status:i.status,retryAfterMs:Qt(i.headers.get(`Retry-After`),r)}};let a;try{a=await i.json()}catch{return{ok:!1,failure:{kind:`invalid`,message:`Response was not JSON`}}}try{let e=Jt(a),t=n===null||n.revision!==e.revision;return n=e,{ok:!0,snapshot:e,changed:t}}catch(e){if(e instanceof Ft)return{ok:!1,failure:{kind:`unsupported_schema`,schemaVersion:e.schemaVersion}};if(e instanceof V)return{ok:!1,failure:{kind:`invalid`,message:e.message}};throw e}}}}var en=6e4,tn=`squeek-pet-demo`,nn=40000n,rn=4000n,an=8n;function on(e){let t=e/1e3;return t<8||t>=30?0:Math.round(t<11?(t-8)/3*62:74+14*Math.sin((t-11)/2.2)+6*Math.sin((t-11)/.9))}function sn(e){let t=0,n=Math.floor(e/1e3);for(let e=0;e<n;e++)t+=on(e*1e3)/18;return BigInt(Math.floor(t))}var cn=sn(en);function ln(e,t){let n=Math.max(0,t-e),r=BigInt(Math.floor(n/en)),i=n%en,a=i/1e3,o=on(i),s=a>=46&&a<53,c=r*an+(a>=40?an:0n);return{installationId:tn,revision:`demo-${Math.floor(n/1e3)}`,generatedAt:t,source:`demo`,measurement:{freshness:s?`stale`:`online`,observedAt:s?t-121500:t,receivedAt:s?t-121e3:t,staleAfterSeconds:120,counterEpoch:`demo-epoch`,cumulativeWorkUnits:nn+r*cn+sn(i),provenance:`simulated`,coreStatus:o>0?`ACTIVE`:`IDLE`,rpm:o,speedMmPerSecond:Math.round(o*14.6),distanceMm:Math.round(Number(r*cn+sn(i))*1300)},settlement:{blockHeight:rn+c,settledThroughRound:500n+r,confirmedAt:t,transactionHash:null}}}var un=1500,dn=4200,fn={unitsPerBean:10n,maxPile:12};function pn(e){return{mode:`loading`,modeSince:e,offlineReason:null,startedAt:e,snapshot:null,clockOffsetMs:0,lastSuccessAt:null,lastFailureAt:null,installationId:null,epoch:null,baseline:null,carry:0n,meal:0n,sessionWork:0n,beans:0,extraBeans:0,lastBiteAt:e,lastMeal:0n,settledHeight:null,celebration:null}}var mn=class{constructor(e,t=fn){this.state=pn(e),this.config={...t}}setConfig(e){this.config={...this.config,...e}}dispatch(e){let t=[],n=this.state;switch(e.type){case`snapshot`:{let r=e.snapshot;n.installationId!==null&&n.installationId!==r.installationId&&this.resetLedgers(),n.installationId=r.installationId,n.clockOffsetMs=r.generatedAt-e.at,n.snapshot=r,n.lastSuccessAt=e.at,this.updateLedger(r),this.updateSettlement(r,e.at,t),this.applyData(this.dataState(e.at),e.at,t);break}case`failure`:if(n.lastFailureAt=e.at,e.failure.kind===`unsupported_schema`){this.goOffline(`unsupported`,e.at,t);break}this.applyData(this.dataState(e.at),e.at,t);break;case`tick`:this.applyData(this.dataState(e.at),e.at,t)}return this.advance(e.at,t),t}dataState(e){let t=this.state;if(!t.snapshot)return e-t.startedAt>15e3?{kind:`offline`,reason:`unreachable`}:null;let n=t.snapshot.measurement;return n?Yt(n,e+t.clockOffsetMs)?{kind:`offline`,reason:t.lastFailureAt!==null&&(t.lastSuccessAt===null||t.lastFailureAt>t.lastSuccessAt)?`unreachable`:`stale`}:n.coreStatus===`COUNTER_FAULT`?{kind:`fault`}:n.coreStatus===`ACTIVE`?{kind:`active`}:{kind:`idle`}:{kind:`offline`,reason:`no_measurement`}}enter(e,t){this.state.mode!==e&&(this.state.mode=e,this.state.modeSince=t,e===`eating`&&(this.state.lastBiteAt=t,this.state.extraBeans=0),e!==`offline`&&(this.state.offlineReason=null))}goOffline(e,t,n){let r=this.state;r.mode!==`offline`&&r.mode!==`loading`&&n.push({type:`toast`,key:`offline`}),this.enter(`offline`,t),r.offlineReason=e}applyData(e,t,n){let r=this.state;if(e!==null&&(r.offlineReason!==`unsupported`||r.mode!==`offline`))switch(e.kind){case`offline`:this.goOffline(e.reason,t,n);return;case`fault`:r.mode!==`fault`&&n.push({type:`toast`,key:`fault`}),this.enter(`fault`,t);return;case`active`:switch(r.mode){case`loading`:n.push({type:`toast`,key:`runningNow`}),this.enter(`running`,t);return;case`offline`:case`fault`:n.push({type:`toast`,key:`backOnline`}),this.enter(`running`,t);return;case`sleeping`:case`eating`:{let e=this.isLabelled();n.push({type:`toast`,key:e?`startedRunningLabelled`:`startedRunning`}),n.push({type:`sound`,name:`squeek`}),this.enter(`waking`,t);return}case`stopping`:this.enter(`running`,t);return;default:return}case`idle`:switch(r.mode){case`loading`:this.enter(r.beans>0?`eating`:`sleeping`,t);return;case`offline`:case`fault`:n.push({type:`toast`,key:`backOnline`}),this.enter(r.beans>0?`eating`:`sleeping`,t);return;case`running`:case`waking`:this.enter(`stopping`,t);return;case`sleeping`:r.beans>0&&this.enter(`eating`,t);return;default:return}}}advance(e,t){let n=this.state;if(n.mode===`waking`&&e-n.modeSince>=1500&&this.enter(`running`,e),n.mode===`stopping`&&e-n.modeSince>=800&&(n.beans===0&&n.meal>0n&&(n.beans=1),n.extraBeans=0,this.enter(n.beans>0?`eating`:`sleeping`,e)),n.mode===`eating`){for(;n.beans>0&&e-n.lastBiteAt>=450;)--n.beans,n.lastBiteAt+=450,t.push({type:`sound`,name:`nom`});n.beans===0&&e-n.lastBiteAt>=450&&(n.meal>0n&&t.push({type:`toast`,key:`meal`,values:{n:n.meal.toString()}}),n.lastMeal=n.meal,n.meal=0n,n.carry=0n,this.enter(`sleeping`,e))}n.celebration&&e-n.celebration.startedAt>=4200&&(n.celebration=null)}isLabelled(){let e=this.state.snapshot;return e?.source===`demo`||(e?.measurement?.provenance??`hardware`)!==`hardware`}resetLedgers(){let e=this.state;e.epoch=null,e.baseline=null,e.carry=0n,e.meal=0n,e.sessionWork=0n,e.beans=0,e.extraBeans=0,e.settledHeight=null,e.celebration=null}updateLedger(e){let t=this.state,n=e.measurement;if(!n)return;if(t.baseline===null||t.epoch!==n.counterEpoch){t.epoch=n.counterEpoch,t.baseline=n.cumulativeWorkUnits;return}let r=n.cumulativeWorkUnits-t.baseline;if(t.baseline=n.cumulativeWorkUnits,r<=0n)return;t.meal+=r,t.sessionWork+=r;let i=t.carry+r,a=i/this.config.unitsPerBean;t.carry=i%this.config.unitsPerBean;let o=a>1000000n?1e6:Number(a),s=Math.max(0,this.config.maxPile-t.beans),c=Math.min(s,o);t.beans+=c,t.extraBeans+=o-c}updateSettlement(e,t,n){let r=this.state,i=e.settlement;if(i){if(r.settledHeight===null||i.blockHeight<r.settledHeight)r.settledHeight=i.blockHeight;else if(i.blockHeight>r.settledHeight){let e=i.blockHeight-r.settledHeight;r.settledHeight=i.blockHeight,r.celebration={blocks:e,height:i.blockHeight,transactionHash:i.transactionHash,startedAt:t},n.push({type:`toast`,key:`blocks`,values:{n:e.toString(),height:i.blockHeight.toString()}}),n.push({type:`sound`,name:`chime`})}}}},hn=6e4;function gn(e,t,n){if(e.ok)return t;let r=e.failure,i=Math.min(hn,t*2**Math.min(n,6));switch(r.kind){case`rate_limited`:return Math.max(t,r.retryAfterMs);case`http`:return Math.max(t,r.retryAfterMs??i);case`unsupported_schema`:return hn;default:return i}}function _n(e){let t=e.now??(()=>Date.now()),n=e.setTimer??((e,t)=>setTimeout(e,t)),r=e.clearTimer??(e=>clearTimeout(e)),i=null,a=!1,o=!1,s=0;async function c(){if(!a||o)return;o=!0,i=null;let n=await e.client.fetchStatus(t());o=!1,a&&(s=n.ok?0:s+1,e.onResult(n,t()),l(gn(n,e.intervalMs(),s-1)))}function l(e){i!==null&&r(i),i=n(()=>void c(),e)}return{start(){a||(a=!0,c())},stop(){a=!1,i!==null&&r(i),i=null},pollSoon(){a&&!o&&l(0)},get running(){return a}}}var vn=()=>({hover:!1,cursor:null,clickAt:-1/0,patAt:-1/0,grumpyAt:-1/0,treatAt:-1/0,wakeAt:-1/0}),yn=620,bn=140,xn=900,Sn=gt.length,H=(e,t,n)=>Math.min(n,Math.max(t,e)),U=(e,t,n)=>e+(t-e)*n,W=e=>.5-.5*Math.cos(Math.PI*H(e,0,1)),Cn=(e,t,n,r)=>r<=0?t:e+(t-e)*(1-Math.exp(-n/r)),G=Math.PI*2;function wn(e){switch(e){case`waking`:case`running`:return P.wheel;case`stopping`:case`eating`:case`offline`:case`fault`:return P.dish;default:return P.nest}}var Tn=class{constructor(e,t=Math.random){this.random=t,this.last=null,this.angle=0,this.omega=0,this.rpm=0,this.gait=0,this.profile=0,this.face=P.nest.face,this.landedAt=-1/0,this.prevMode=null,this.lastBeans=0,this.flights=[],this.belly=0,this.mealBites=0,this.burpAt=-1/0,this.zzz=0,this.nestFront=0,this.blinkAt=-1/0,this.twitchAt=-1/0;let n=P.nest;this.travel={from:{...n},to:n,start:-1/0,dur:1,height:0},this.nextBlink=e+2e3+t()*3e3,this.nextTwitch=e+5e3+t()*5e3}get displayedRpm(){return this.omega/6}frame(e,t,n,r=30){let i=this.last===null?0:H((t-this.last)/1e3,0,.25);this.last=t;let a=e.mode;a!==this.prevMode&&(this.prevMode===`eating`&&a===`sleeping`&&e.lastMeal>0n&&(this.burpAt=t),a===`eating`&&(this.mealBites=0),this.prevMode=a);let o=wn(a);if(o!==this.travel.to){let n=this.position(t),r=a===`waking`?Math.max(t,e.modeSince+900):t,i=Math.hypot(o.x-n.x,o.y-n.y),s=a===`waking`?un-900:H(280+i*2.4,320,640);this.travel={from:{...n,face:this.face},to:o,start:r,dur:s,height:12+i*.2}}let s=this.position(t),c=(t-this.travel.start)/this.travel.dur,l=c>0&&c<1;c>=1&&this.landedAt<this.travel.start&&(this.landedAt=this.travel.start+this.travel.dur);let u=this.travel.to===P.wheel&&c>=1,d=this.travel.to===P.nest&&(c>=1||this.travel.start===-1/0),f=this.travel.to.x-this.travel.from.x,p=l&&Math.abs(f)>4?Math.sign(f):c<=0?this.travel.from.face:this.travel.to.face;this.face=Cn(this.face,p,i,.06),Math.abs(this.face-p)<.01&&(this.face=p);let m=e.snapshot?.measurement?.rpm??0;this.rpm=Cn(this.rpm,a===`running`||a===`waking`?m:0,i,.8);let h=u&&(a===`running`||a===`waking`)?this.rpm*6:0;this.omega=Cn(this.omega,h,i,h>this.omega?.45:.9),this.angle=(this.angle+Math.min(this.omega,30*Math.max(r,1))*i)%360;let g=e.beans;if(a===`eating`&&g<this.lastBeans){let e=this.lastBeans-g;this.mealBites+=e,this.belly=Math.min(1,this.belly+e*.1)}if(g>this.lastBeans&&a!==`eating`){let e={x:s.x+16*this.face,y:s.y-14},n=this.flights.length?this.flights[this.flights.length-1].start:t-bn;for(let r=0;r<g-this.lastBeans&&this.flights.length<6;r++)this.flights.push({start:Math.max(t,n+bn*(r+1)),from:e})}this.lastBeans=g,this.flights=this.flights.filter(e=>t-e.start<yn),this.flights.length>g&&(this.flights.length=Math.max(0,g)),a!==`eating`&&(this.belly=Math.max(0,this.belly-i/14));let _=jt(s.x,s.y,this.face,ht),v=t-e.modeSince,y={kind:`none`,t:0};if(l)this.hopPose(_,c);else switch(a){case`running`:this.runPose(_,i);break;case`waking`:u?this.runPose(_,i):(this.wakePose(_,v),v>150&&v<900&&(y={kind:`exclaim`,t:(v-150)/750}));break;case`sleeping`:case`loading`:this.sleepPose(_,t),a===`loading`&&(_.eye=`open`,_.head=4+7*Math.sin(t/2800*G),_.ear=-4,y={kind:`dots`,t:t%1500/1500});break;case`eating`:this.sitPose(_),this.eatPose(_,e,t);break;case`offline`:this.sitPose(_),this.offlinePose(_,t);break;case`fault`:this.sitPose(_),_.eye=`swirl`,_.swirl=t/4%360,_.tilt+=3*Math.sin(t/1600*G),_.head+=4*Math.sin(t/900*G);break;case`stopping`:this.sitPose(_)}let ee=!l&&(a===`running`||a===`waking`&&u);this.profile=Cn(this.profile,+!!ee,i,.08),_.profile=this.profile;let b=t-this.landedAt;if(b>=0&&b<180&&!l){let e=1-b/180;_.squashY*=1-.12*e,_.squashX*=1+.08*e}_.bulge=Math.max(_.bulge,this.belly);let te=null,ne=e.celebration;if(ne&&t-ne.startedAt<4200){let e=t-ne.startedAt;e<1800&&(_.eye=`happy`),a!==`sleeping`&&!l&&e<1100&&(_.hop-=13*Math.abs(Math.sin(Math.PI*e/550)));let n=R(_,...D.crown);te={x:H(n.x,40,260),y:Math.max(26,n.y-16-14*W(e/1200)),t:e/dn,text:`+${ne.blocks.toString()}`}}let x=a===`sleeping`;if(t-n.grumpyAt<1800)_.eye=`grumpy`,_.pouch=Math.max(_.pouch,.8),_.head+=3*Math.sin(t/110*G),y={kind:`steam`,t:(t-n.grumpyAt)/1800};else if(t-n.patAt<1400)_.eye=`happy`,_.head+=6,y={kind:`heart`,t:(t-n.patAt)/1400};else if(t-n.clickAt<800)t-n.clickAt<150&&_.eye===`open`&&(_.blink=1),x&&(_.ear-=14*Math.sin(Math.PI*H((t-n.clickAt)/300,0,1))),y={kind:`note`,t:(t-n.clickAt)/800};else if(t-n.wakeAt<1500&&(a===`sleeping`||a===`loading`)){let e=t-n.wakeAt;this.wakePose(_,e),e>780&&(_.head+=9*Math.sin((e-780)/460*G),_.pupilX=1.2),y={kind:`exclaim`,t:e/1500}}else if(t-n.treatAt<1600&&!ee&&!l){let e=t-n.treatAt,r=H(e/1600,0,1);this.sitPose(_),_.eye=`happy`;let i=U(-78,14,W(H((r-.18)/.34,0,1)));_.legs[1]=i+4,_.legs[3]=i,_.head=28+6*Math.sin(Math.PI*H((r-.3)/.42,0,1)),_.holdBean=r>.24&&r<.68,_.chew=r>.42&&r<.9?Math.abs(Math.sin(e/55)):0,_.pouch=Math.max(_.pouch,.3),y={kind:`note`,t:r}}if(n.hover&&n.cursor&&_.eye===`open`){let e=R(_,...D.eyes),t=(n.cursor.x-e.x)*Math.sign(_.face||1),r=n.cursor.y-e.y,i=t>0?Math.atan2(r,t)*180/Math.PI:-r/6;_.head+=H(i*.35,-9,9),_.pupilX=H(t/30,-1.6,1.6),_.pupilY=H(r/30,-1.4,1.4)}t>=this.nextBlink&&(this.blinkAt=t,this.nextBlink=t+2400+this.random()*3600),_.eye===`open`&&t-this.blinkAt<140&&(_.blink=Math.max(_.blink,Math.sin(Math.PI*(t-this.blinkAt)/140))),t>=this.nextTwitch&&(this.twitchAt=t,this.nextTwitch=t+6e3+this.random()*6e3),x&&t-this.twitchAt<260&&(_.ear-=16*Math.sin(Math.PI*(t-this.twitchAt)/260));let S=t-n.grumpyAt<1800;this.zzz=Cn(this.zzz,x&&n.hover&&!S?1:0,i,.15),this.nestFront=Cn(this.nestFront,d&&!l&&(x||a===`loading`)?1:0,i,.12);let re=R(_,...D.mark),ie=R(_,...D.zzz),ae=R(_,...D.mouth),oe=R(_,...D.rear),se=+!!_.holdBean;return{pose:_,wheelAngle:this.angle,speedLines:{opacity:u&&a===`running`?H((this.rpm-55)/30,0,1):0,x:oe.x-22,y:oe.y-4,shift:-(this.gait*18%6)},pile:H(g-this.flights.length-se,0,Sn),overflow:e.extraBeans,flights:this.flights.filter(e=>t>=e.start).map(e=>this.flightPosition(e,t,g)),nestFront:this.nestFront,zzz:{opacity:this.zzz,x:ie.x,y:ie.y,t},mark:{...y,x:re.x,y:re.y},burp:t-this.burpAt<xn?{...ae,t:(t-this.burpAt)/xn}:null,celebration:te}}position(e){let t=this.travel,n=H((e-t.start)/t.dur,0,1),r=W(n);return{x:U(t.from.x,t.to.x,r),y:U(t.from.y,t.to.y,r)-t.height*4*n*(1-n)}}flightPosition(e,t,n){let[r,i]=gt[H(n-this.flights.length+this.flights.indexOf(e),0,Sn-1)],a=H((t-e.start)/yn,0,1),o=W(a);return{x:U(e.from.x,N.x+r,o),y:U(e.from.y,N.y+i,o)-120*a*(1-a)}}runPose(e,t){let n=this.rpm;this.gait+=(1.3+n*.032)*t;let r=this.gait%1,i=n<35?18:25,a=e=>i*Math.sin(G*(r+e));e.legs=[a(.5),a(.25),a(0),a(.75)],e.hop=-2.2*(.5-.5*Math.cos(2*G*r)),e.head=1.5*Math.sin(G*r),e.tail=7*Math.sin(G*r),e.ear=-2-2*Math.sin(G*r-.5),e.tilt=2}hopPose(e,t){e.legs=[34,-28,30,-32],e.tilt=U(-14,12,t),e.ear=-12,e.tail=-10}sleepPose(e,t){let n=Math.sin(t/3200*G);e.lie=5,e.tuck=.28,e.head=9,e.ear=-14,e.tail=-12,e.eye=`closed`,e.squashY=1+.028*n,e.squashX=1-.008*n}wakePose(e,t){let n=W(t/300);e.lie=5*(1-n),e.tuck=U(.28,1,n),e.head=9*(1-n),e.eye=t<120?`closed`:`open`;let r=W((t-300)/250);if(e.ear=U(-14,6,r),e.earScale=1+.12*r,t>550){let n=Math.sin((t-550)/70*G)*(1-W((t-550)/350));e.x+=2.2*n,e.tilt=3*n}}sitPose(e){e.tilt=-42,e.legs=[42,-50,42,-46],e.head=28,e.tail=10}eatPose(e,t,n){let r=H((n-t.lastBiteAt)/450,0,1),i;i=r<.3?-78:r<.55?U(-78,14,W((r-.3)/.25)):r<.7?14:U(14,-78,W((r-.7)/.3)),e.legs[1]=i+4,e.legs[3]=i,e.head=28+(r>.45&&r<.75?8*Math.sin(Math.PI*(r-.45)/.3):0),e.holdBean=t.beans>0&&r>=.6,e.chew=r<.35||t.beans===0?Math.abs(Math.sin(n/55)):0,e.pouch=H(.25+this.mealBites*.08,0,1)}offlinePose(e,t){e.question=!0,e.legs[1]=-26,e.legs[3]=2;let n=t%5600,r=n<1300?Math.sin(Math.PI*n/1300):0;e.head=32-18*r,e.pupilY=-1.2*r}},En=3800,Dn=6500,On=2;function K(e,t=``,n){let r=document.createElement(e);return t&&(r.className=t),n!==void 0&&(r.textContent=n),r}function kn(e){return e?K(`span`,`badge badge--${e.tone}`,e.text):null}function An(e,t){let n=K(`dl`,t);for(let t of e){let e=K(`div`,t.label?``:`row--wide`);t.label&&e.append(K(`dt`,``,t.label));let r=K(`dd`,``,t.value);t.note&&r.append(K(`small`,``,t.note)),e.append(r),n.append(e)}return n}var jn=class{constructor(e,t){this.actions=t,this.bubbleKey=``,this.panelKey=``,this.stack=K(`div`,`hud-stack`),this.bubble=K(`div`,`bubble`),this.bubble.hidden=!0,this.stack.append(this.bubble),this.panel=K(`section`,`panel`),this.panel.hidden=!0,this.tag=K(`div`,`pet-tag`),this.tag.hidden=!0,e.append(this.tag,this.stack,this.panel)}get panelOpen(){return!this.panel.hidden}setTag(e){this.tag.hidden=!e,e&&this.tag.textContent!==e&&(this.tag.textContent=e)}setBubble(e){if(!e){this.bubble.hidden=!0,this.bubbleKey=``;return}let t=JSON.stringify(e);if(this.bubble.hidden=!1,t===this.bubbleKey)return;this.bubbleKey=t;let n=K(`div`,`card-head`);n.append(K(`strong`,``,e.title));let r=kn(e.badge);r&&n.append(r);let i=[n,K(`div`,`bubble-status`,e.status)];e.rows.length&&i.push(An(e.rows,`rows`)),e.note&&i.push(K(`p`,`note`,e.note)),i.push(K(`p`,`foot`,e.foot)),this.bubble.replaceChildren(...i)}setPanel(e,t){if(!e){this.panel.hidden=!0,this.panelKey=``;return}let n=JSON.stringify([e,t]);if(this.panel.hidden=!1,n===this.panelKey)return;this.panelKey=n;let r=K(`div`,`card-head`);r.append(K(`strong`,``,e.title));let i=kn(e.badge);i&&r.append(i);let a=K(`button`,`close`,`×`);a.type=`button`,a.title=t.close,a.setAttribute(`aria-label`,t.close),a.addEventListener(`click`,()=>this.actions.closePanel()),r.append(a);let o=[r,An(e.rows,`rows rows--panel`)];if(e.tx){let t=e.tx,n=K(`button`,`link`,`${t.label} ↗`);n.type=`button`,n.addEventListener(`click`,()=>this.actions.openUrl(t.url)),o.push(n)}e.reading&&o.push(K(`p`,`foot`,e.reading)),o.push(K(`p`,`foot foot--tight`,e.source));let s=K(`div`,`buttons`),c=K(`button`,`button`,`${t.pulse} ↗`);c.type=`button`,c.addEventListener(`click`,()=>this.actions.openUrl(`https://squeekpulse.xyz/`));let l=K(`button`,`button button--quiet`,t.settings);l.type=`button`,l.addEventListener(`click`,()=>this.actions.openSettings()),s.append(c,l),o.push(s),this.panel.replaceChildren(...o)}toast(e){let t=K(`div`,`toast toast--${e.tone}`);if(t.append(K(`span`,``,e.text)),e.action){let n=e.action,r=K(`button`,`toast-action`,`${n.label} ↗`);r.type=`button`,r.addEventListener(`click`,()=>this.actions.openUrl(n.url)),t.append(r),t.dataset.interactive=`true`}this.stack.append(t);let n=this.stack.querySelectorAll(`.toast`);for(let e=0;e<n.length-On;e++)n[e].remove();window.setTimeout(()=>{t.classList.add(`toast--leaving`),window.setTimeout(()=>t.remove(),300)},e.action?Dn:En)}interactiveRects(){let e=[];return this.panel.hidden||e.push(this.panel.getBoundingClientRect()),this.stack.querySelectorAll(`.toast[data-interactive="true"]`).forEach(t=>e.push(t.getBoundingClientRect())),e}},Mn={pat:`♥`,feed:`●`,wake:`☀`},Nn={pat:`P`,feed:`F`,wake:`W`};function Pn(e,t,n){let r=document.createElement(`button`);r.type=`button`,r.className=`play-dock__button`,r.dataset.action=e,r.title=`${t} (${Nn[e]})`,r.setAttribute(`aria-label`,`${t} (${Nn[e]})`);let i=document.createElement(`span`);i.className=`play-dock__icon`,i.setAttribute(`aria-hidden`,`true`),i.textContent=Mn[e];let a=document.createElement(`span`);return a.textContent=t,r.append(i,a),r.addEventListener(`click`,n),r}function Fn(e,t){let n=document.createElement(`div`);n.className=`play-dock-wrap`;let r=document.createElement(`div`);r.className=`play-dock`,r.setAttribute(`role`,`group`),r.setAttribute(`aria-label`,e.label),r.append(Pn(`pat`,e.pat,t.pat),Pn(`feed`,e.feed,t.feed),Pn(`wake`,e.wake,t.wake));let i=document.createElement(`p`);return i.className=`play-dock__hint`,i.textContent=e.hint,n.append(r,i),n}var In=class{constructor(){this.enabled=!1,this.ctx=null}unlock(){if(this.enabled)try{this.ctx??=new AudioContext,this.ctx.state===`suspended`&&this.ctx.resume()}catch{this.ctx=null}}play(e){let t=this.ctx;if(!this.enabled||!t||t.state!==`running`)return;let n=t.currentTime;switch(e){case`squeek`:this.tone(t,`sine`,n,.07,1900,2700,.05),this.tone(t,`sine`,n+.09,.08,2300,3100,.045);break;case`nom`:this.tone(t,`triangle`,n,.06,260,170,.06);break;case`chime`:this.tone(t,`sine`,n,.6,1318.5,1318.5,.04),this.tone(t,`sine`,n+.1,.7,1975.5,1975.5,.035)}}tone(e,t,n,r,i,a,o){let s=e.createOscillator(),c=e.createGain();s.type=t,s.frequency.setValueAtTime(i,n),s.frequency.exponentialRampToValueAtTime(a,n+r),c.gain.setValueAtTime(1e-4,n),c.gain.exponentialRampToValueAtTime(o,n+.01),c.gain.exponentialRampToValueAtTime(1e-4,n+r),s.connect(c).connect(e.destination),s.start(n),s.stop(n+r+.02)}},Ln=new URLSearchParams(location.search),q=u();Ln.has(`demo`)&&(q={...q,demo:Ln.get(`demo`)!==`0`}),(Ln.get(`lang`)===`en`||Ln.get(`lang`)===`zh`)&&(q={...q,language:Ln.get(`lang`)});var Rn=document.getElementById(`pet`),zn=document.getElementById(`stage`),Bn=new Pt(zn),J=new In;J.enabled=q.sounds;var Y=vn(),X=(t,n)=>e(q.language,t,n),Vn=()=>({unitsPerBean:BigInt(q.unitsPerBean),maxPile:12}),Z=new mn(Date.now(),Vn()),Hn=new Tn(Date.now()),Un=null,Wn=!1,Q=new jn(Rn,{openUrl:e=>f.openUrl(e),openSettings:()=>f.openSettings(),closePanel:()=>pr(!1)});function Gn(e){for(let t of e)t.type===`sound`?J.play(t.name):q.toasts&&Q.toast(n(t,Z.state,q.language))}var Kn=_n({client:$t(),intervalMs:()=>p[q.performance].pollMs,onResult(e,t){q.demo||Gn(Z.dispatch(e.ok?{type:`snapshot`,snapshot:e.snapshot,at:t}:{type:`failure`,failure:e.failure,at:t}))}}),qn=null;function Jn(){Kn.stop(),qn!==null&&window.clearInterval(qn),qn=null;let e=Date.now();if(Z=new mn(e,Vn()),Hn=new Tn(e),q.demo){let t=e,n=()=>{let e=Date.now();Gn(Z.dispatch({type:`snapshot`,snapshot:ln(t,e),at:e}))};n(),qn=window.setInterval(n,1e3)}else Kn.start()}var Yn=0;function Xn(e=!1){let t=()=>{Yn=0;let e=s(q.scale);Rn.style.transform=`scale(${e.zoom})`,Rn.style.setProperty(`--stage`,String(e.stage)),f.resizePet(e.width,e.height)};e?t():Yn||=requestAnimationFrame(t)}function Zn(){f.setTrayLabels({toggle:X(`tray.toggle`),details:X(`menu.details`),demo:X(`menu.demo`),settings:X(`menu.settings`),quit:X(`menu.quit`),demoOn:q.demo})}function Qn(e,t){let n=q;q=e,t===`here`&&(i(e),f.broadcastSettings(e)),J.enabled=e.sounds,n.scale!==e.scale&&Xn(),n.alwaysOnTop!==e.alwaysOnTop&&f.setAlwaysOnTop(e.alwaysOnTop),n.unitsPerBean!==e.unitsPerBean&&Z.setConfig(Vn()),n.performance!==e.performance&&Kn.pollSoon(),n.demo!==e.demo&&Jn(),(n.language!==e.language||n.demo!==e.demo)&&Zn(),document.documentElement.lang=e.language===`zh`?`zh-CN`:`en`}var $n=e=>Qn(a({...q,...e}),`here`);f.onSettings(e=>{e&&typeof e==`object`&&Qn(a(e),`elsewhere`)}),f.onTrayAction(e=>{e===`details`&&pr(!0),e===`demo`&&$n({demo:!q.demo})});var er=(e,t,n)=>t>=e.x&&t<=e.x+e.w&&n>=e.y&&n<=e.y+e.h,tr=[],nr=-1/0,rr=-1/0,ir=null;function ar(e,t){let n=performance.now();ir={x:e,y:t};let r=tr.some(n=>er(n,e,t));r&&!Y.hover&&(nr=n),!r&&Y.hover&&(rr=n),Y.hover=r;let i=Bn.svg.getBoundingClientRect(),a=300/i.width;Y.cursor={x:(e-i.left)*a,y:(t-i.top)*a},ur(e,n)}function or(){Y.hover&&(rr=performance.now()),Y.hover=!1,Y.cursor=null,ir=null}var sr=0,cr=0,lr=[];function ur(e,t){if(!Un||$||!Y.cursor)return;let n=R(Un.pose,...D.head);if(!(Math.hypot(Y.cursor.x-n.x,Y.cursor.y-n.y)<26)){lr=[];return}let r=e-cr;if(cr=e,Math.abs(r)<1.5)return;let i=Math.sign(r);sr&&i!==sr&&lr.push(t),sr=i,lr=lr.filter(e=>t-e<1200),lr.length>=4&&Date.now()-Y.patAt>1500&&(Y.patAt=Date.now(),lr=[])}f.onCursor(e=>ar(e.x,e.y)),c||(window.addEventListener(`pointermove`,e=>ar(e.clientX,e.clientY)),document.addEventListener(`pointerleave`,or));var $=null,dr=[];zn.addEventListener(`pointerdown`,e=>{e.button===0&&tr.some(t=>er(t,e.clientX,e.clientY))&&(J.unlock(),$={x:e.clientX,y:e.clientY})}),window.addEventListener(`pointermove`,e=>{$&&e.buttons&1&&Math.hypot(e.clientX-$.x,e.clientY-$.y)>4&&($=null,f.startDrag())}),window.addEventListener(`pointerup`,()=>{if(!$)return;$=null;let e=Date.now();Y.clickAt=e,J.play(`squeek`),dr=[...dr.filter(t=>e-t<1600),e],dr.length>=4&&(Y.grumpyAt=e,dr=[])}),zn.addEventListener(`dblclick`,e=>{tr.some(t=>er(t,e.clientX,e.clientY))&&pr(!Wn)}),zn.addEventListener(`contextmenu`,e=>{e.preventDefault(),tr.some(t=>er(t,e.clientX,e.clientY))&&f.popupMenu(fr())}),window.addEventListener(`keydown`,e=>{e.key===`Escape`&&pr(!1)});function fr(){return[{text:X(`menu.details`),action:()=>pr(!0)},{text:X(`menu.size`),items:[...r.map(e=>({text:`${e}%`,checked:q.scale===e,action:()=>$n({scale:e})})),{item:`Separator`},{text:X(`menu.sizeCustom`),action:()=>f.openSettings()}]},{item:`Separator`},{text:X(`menu.sounds`),checked:q.sounds,action:()=>$n({sounds:!q.sounds})},{text:X(`menu.demo`),checked:q.demo,action:()=>$n({demo:!q.demo})},{item:`Separator`},{text:X(`menu.pulse`),action:()=>f.openUrl(o)},{text:X(`menu.settings`),action:()=>f.openSettings()},{item:`Separator`},{text:X(`menu.hide`),action:()=>f.hidePet()},{text:X(`menu.quit`),action:()=>f.quit()}]}function pr(e){Wn=e,br(Date.now(),!0)}function mr(){J.unlock(),Y.patAt=Date.now(),J.play(`squeek`)}function hr(){J.unlock(),Z.state.mode===`running`||Z.state.mode===`waking`?Q.toast({text:X(`play.busy`),tone:`plain`,action:null}):(Y.treatAt=Date.now(),J.play(`nom`))}function gr(){let e=Date.now();J.unlock(),Y.wakeAt=e,Z.state.mode===`sleeping`||Z.state.mode===`loading`?J.play(`squeek`):(Q.toast({text:X(`play.awake`),tone:`plain`,action:null}),Kn.pollSoon())}function _r(){document.body.classList.add(`web`);let e=document.createElement(`div`);e.className=`web-backdrop`,e.setAttribute(`aria-hidden`,`true`);let t=document.createElement(`header`);t.className=`web-head`;let n=document.createElement(`h1`);n.textContent=`Squeek Pet`;let r=document.createElement(`p`);r.textContent=X(`web.subtitle`),t.append(n,r);let i=Fn({label:X(`play.label`),pat:X(`play.pat`),feed:X(`play.feed`),wake:X(`play.wake`),hint:X(`web.hint`)},{pat:mr,feed:hr,wake:gr});document.body.append(e,t,i),window.addEventListener(`keydown`,e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;let t=e.target;if(t&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`||t.isContentEditable))return;let n=e.key.toLowerCase();n===`p`?mr():n===`f`?hr():n===`w`&&gr()})}var vr=0,yr=!1;function br(e,n=!1){let r=performance.now(),i=!Wn&&(Y.hover?r-nr>250:r-rr<400&&rr>nr);if(!n&&e-vr<500&&i===yr)return;vr=e,yr=i;let a=q.language,o=Z.state;Q.setTag(d(o,a)),Q.setPanel(Wn?l(o,e,a):null,{pulse:X(`panel.openPulse`),settings:X(`panel.settings`),close:X(`panel.close`)}),Q.setBubble(i?t(o,e,a):null)}var xr=``,Sr=0;function Cr(e,t){if(t-Sr<100)return;Sr=t;let n=Bn.svg.getBoundingClientRect(),r=n.width/300,i=(e,t,i,a)=>({x:n.left+e*r,y:n.top+t*r,w:i*r,h:a*r}),a=fe.map(([t,n])=>R(e.pose,t,n)),o=Math.min(...a.map(e=>e.x)),s=Math.max(...a.map(e=>e.x)),l=Math.min(...a.map(e=>e.y)),u=Math.max(...a.map(e=>e.y)),d=M.cy-M.rim-4;tr=[i(M.cx-M.rim-4,d,M.rim*2+8,210-d),i(154,182,mt.x+46-154,30),i(o-6,l-6,s-o+12,u-l+12)];let p=[...tr,...Q.interactiveRects().map(e=>({x:e.x,y:e.y,w:e.width,h:e.height}))].map(e=>({x:Math.floor(e.x),y:Math.floor(e.y),w:Math.ceil(e.w),h:Math.ceil(e.h)})),m=JSON.stringify(p);m!==xr&&(xr=m,f.setHitRegions(p)),ir&&c&&ar(ir.x,ir.y)}function wr(){let e=p[q.performance].fps,t=Z.state;return(t.mode===`sleeping`||t.mode===`offline`)&&!Y.hover&&!t.celebration&&!Wn?Math.min(e,12):e}var Tr=0;function Er(e){requestAnimationFrame(Er);let t=wr();if(e-Tr<1e3/t-2)return;Tr=e;let n=Date.now();Gn(Z.dispatch({type:`tick`,at:n})),Un=Hn.frame(Z.state,n,Y,t),Bn.apply(Un),br(n),Cr(Un,e)}window.setInterval(()=>{document.hidden&&Gn(Z.dispatch({type:`tick`,at:Date.now()}))},1e3),document.documentElement.lang=q.language===`zh`?`zh-CN`:`en`,Xn(!0),f.setAlwaysOnTop(q.alwaysOnTop),Zn(),Jn(),c||_r(),requestAnimationFrame(Er),c||Object.assign(window,{__squeekPet:{get state(){return Z.state},get frame(){return Un},get input(){return Y},hover(e,t){ar(e,t)},panel:pr,change:$n,play:{pat:mr,feed:hr,wake:gr}}});