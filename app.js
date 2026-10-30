const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,pick=a=>a[ri(0,a.length-1)],shuffle=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const sup=n=>n===1?'':String(n).replace(/[0-9-]/g,c=>({'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'})[c]);
const sign=n=>n<0?`− ${-n}`:`+ ${n}`,factor=r=>r===0?'x':r>0?`(x − ${r})`:`(x + ${-r})`;
const linfac=(b,r)=>r===0?(b===1?'x':`(${b}x)`):`(${b===1?'':b}x ${r>0?'− '+r:'+ '+(-r)})`;
const interval=(a,b,left='(',right=')')=>`${left}${a}, ${b}${right}`;
function norm(v){
  let s=String(v??'').trim().toLowerCase().replaceAll('−','-').replaceAll('–','-').replace(/\s+/g,'').replaceAll('∞','infinity');
  if(['allrealnumbers','allreals','realnumbers','allrealx'].includes(s))return'(-infinity,infinity)';
  return s.replace(/union|or|∪/g,'u').replace(/([\)\]])[,;]([\(\[])/g,'$1u$2').replace(/U/g,'u');
}
const KEY='polyQuestV4',old=JSON.parse(localStorage.getItem('polyQuestV3')||localStorage.getItem('polyQuestV2Final')||'{}');
const fresh={name:old.name||'Scholar',xp:old.xp||0,stages:{},missed:[],boss:[],recent:{},streak:0};
let state={...fresh,...JSON.parse(localStorage.getItem(KEY)||'{}')};
const typed=(prompt,math,answer,hint,accept=[],paper='',intervalEntry=false)=>({kind:'typed',prompt,math,answer:String(answer),accept:[String(answer),...accept],hint,paper,intervalEntry});
const fields=(prompt,math,items,hint,paper='')=>({kind:'fields',prompt,math,items,hint,paper});
function choice(prompt,math,correct,wrong,hint,given='',paper=''){
  const seen=new Set(),all=[{text:correct,ok:true},...wrong.map(text=>({text,ok:false}))].filter(o=>{let k=norm(o.text);if(seen.has(k))return false;seen.add(k);return true});
  return{kind:'choice',prompt,math,options:shuffle(all),hint,given,paper};
}
const signedTerm=(coef,power,first=false)=>{
  if(!coef)return'';
  const abs=Math.abs(coef),body=power===0?String(abs):`${abs===1?'':abs}x${sup(power)}`;
  if(first)return coef<0?`−${body}`:body;
  return coef<0?` − ${body}`:` + ${body}`;
};
const polynomial=terms=>terms.filter(t=>t[0]).sort((a,b)=>b[1]-a[1]).map((t,i)=>signedTerm(t[0],t[1],i===0)).join('');
const counts=n=>{let a=[];for(let k=n;k>=0;k-=2)a.push(k);return a.length===1?String(a[0]):a.join(' or ')};
const polyText=coeffs=>{const d=coeffs.length-1;return coeffs.map((c,i)=>[c,d-i]).filter(x=>x[0]).map((x,i)=>signedTerm(x[0],x[1],i===0)).join('')||'0'};
const signChanges=coeffs=>{let s=coeffs.filter(Boolean).map(Math.sign),n=0;for(let i=1;i<s.length;i++)if(s[i]!==s[i-1])n++;return n};
const negX=coeffs=>{const d=coeffs.length-1;return coeffs.map((c,i)=>((d-i)%2?-c:c))};
const polyMul=(a,b)=>{let out=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>out[i+j]+=x*y));return out};
function syntheticDivide(coeffs,c){let bottom=[coeffs[0]],products=[];for(let i=1;i<coeffs.length;i++){let p=bottom[i-1]*c;products.push(p);bottom.push(coeffs[i]+p)}return{bottom,products,quotient:bottom.slice(0,-1),remainder:bottom.at(-1)}}
function syntheticTable(coeffs,c,label){let d=syntheticDivide(coeffs,c);return`<div class="syntheticBlock"><small>${label}</small><table class="syntheticTable"><tr><th rowspan="3">${c}</th>${coeffs.map(x=>`<td>${x}</td>`).join('')}</tr><tr>${['',...d.products].map(x=>`<td>${x}</td>`).join('')}</tr><tr>${d.bottom.map(x=>`<td>${x}</td>`).join('')}</tr></table></div>`}
const quotientText=coeffs=>polyText(coeffs);
const visibleForm=(d,k,c)=>`f(x) = ${signedTerm(k,d,true)}${signedTerm(pick([-4,-2,2,5]),Math.max(1,d-2))}${signedTerm(c,0)}`;
const makeFactored=()=>{
  const kinds=pick([
    [{deg:1,m:ri(1,4),b:1,r:ri(-6,6)},{deg:1,m:ri(1,3),b:1,r:ri(-6,6)}],
    [{deg:1,m:ri(2,3),b:ri(2,4),r:ri(-5,5)},{deg:1,m:ri(1,2),b:ri(1,3),r:ri(-5,5)}],
    [{deg:2,m:ri(1,2),b:1,c:ri(1,7)},{deg:1,m:ri(1,3),b:1,r:ri(-6,6)}],
    [{deg:1,m:ri(1,2),b:1,r:ri(-6,6)},{deg:1,m:1,b:1,r:ri(-6,6)},{deg:1,m:1,b:1,r:ri(-6,6)}],
    [{deg:2,m:1,b:ri(1,3),c:ri(1,6)},{deg:2,m:1,b:ri(1,2),c:ri(1,6)}]
  ]);
  const outside=pick([-3,-2,1,2,3]),parts=kinds.map(f=>f.deg===1?`${linfac(f.b,f.r)}${sup(f.m)}`:`(${f.b===1?'':f.b}x² + ${f.c})${sup(f.m)}`);
  return{outside,parts,kinds,degree:kinds.reduce((s,f)=>s+f.deg*f.m,0),lc:outside*kinds.reduce((p,f)=>p*Math.pow(f.b,f.m),1),text:`${outside===1?'':outside===-1?'−':outside}${parts.join('')}`};
};
const stages=[
{id:'degree',icon:'n',title:'Degree Detector',desc:'Add the degree contribution of every factor.',bridge:'Factor degree × exponent; then add.',gen:()=>{let f=makeFactored();return typed('What is the degree of this polynomial?',`f(x) = ${f.text}`,f.degree,'Add each factor’s degree times its exponent.');}},
{id:'lc',icon:'a',title:'Leading Coefficient',desc:'Use every leading coefficient, including powered factors.',bridge:'A coefficient inside a power is raised to that power too.',gen:()=>{let f=makeFactored();return typed('Find the leading coefficient without expanding.',`g(x) = ${f.text}`,f.lc,'Multiply the outside coefficient by each factor’s powered leading coefficient.');}},
{id:'domainrange',icon:'↔',title:'Domain & Range',desc:'Use degree, LC, and the complete extrema list.',bridge:'Odd degree has all-real range. For even degree, compare the relevant extrema y-values.',gen:()=>{
  const odd=Math.random()<.35,d=odd?pick([3,5,7]):pick([4,6]),lc=pick([-4,-2,2,5]);
  let extrema,range;
  if(odd){extrema='relative maximum (−2, 7); relative minimum (3, −5)';range='(−∞, ∞)';}
  else if(lc>0){let y1=ri(-12,-4),y2=ri(-3,6);extrema=`relative minima (−3, ${y1}) and (2, ${y2}); relative maximum (0, ${y2+ri(3,8)})`;range=`[${Math.min(y1,y2)}, ∞)`;}
  else{let y1=ri(3,9),y2=ri(10,18);extrema=`relative maxima (−2, ${y1}) and (3, ${y2}); relative minimum (1, ${y1-ri(4,9)})`;range=`(−∞, ${Math.max(y1,y2)}]`;}
  const question=fields('State the domain and range.',`Degree: ${d} · Leading coefficient: ${lc}`,[{label:'Domain',answer:'(−∞, ∞)',accept:['all real numbers','all reals','(-infinity,infinity)'],interval:true},{label:'Range',answer:range,accept:odd?['all real numbers','all reals','(-infinity,infinity)']:[range.replaceAll('∞','infinity')],interval:true}],'Use end behavior first; then use the correct extrema y-value.');
  question.given=`Complete list of relative extrema: ${extrema}.`;return question;
}},
{id:'end',icon:'↗',title:'End Behavior',desc:'Write both ends in formal notation.',bridge:'Parity decides same/opposite; LC sign decides the right end.',gen:()=>{
  const d=pick([2,3,4,5,6,7]),lc=pick([-5,-2,2,4]),odd=d%2,neg=lc<0;
  const left=odd?(neg?'∞':'−∞'):(neg?'−∞':'∞'),right=neg?'−∞':'∞';
  const correct=`As x → −∞, f(x) → ${left}; as x → ∞, f(x) → ${right}`;
  const combos=[['∞','∞'],['−∞','−∞'],['−∞','∞'],['∞','−∞']].map(v=>`As x → −∞, f(x) → ${v[0]}; as x → ∞, f(x) → ${v[1]}`);
  const mode=pick(['data','term','factored']),math=mode==='data'?`Degree: ${d} · Leading coefficient: ${lc}`:mode==='term'?`f(x) = ${signedTerm(lc,d,true)} + lower-degree terms`:`f(x) = ${lc}${factor(ri(-5,5))}${sup(d%3+1)}${factor(ri(-5,5))}${sup(d-(d%3+1))}`;
  return choice('Choose the complete end behavior.',math,correct,combos.filter(x=>x!==correct),'Classify the degree as odd/even, then use the leading-coefficient sign.');
}},
{id:'constant',icon:'y',title:'Constant & y-intercept',desc:'Connect the constant term, f(0), and the point.',bridge:'The constant is a number; the y-intercept is (0, number).',gen:()=>{
  const mode=ri(0,3),k=pick([-3,-2,2,3]),a=ri(1,5),b=ri(1,5),v=k*(-a)*b;
  if(mode===0){let c=pick([-9,-5,0,4,8]);return fields('Identify both values.',visibleForm(ri(3,6),pick([-4,2,5]),c),[{label:'Constant term',answer:c},{label:'y-intercept',answer:`(0, ${c})`,accept:[`(0,${c})`]}],'The y-intercept turns f(0) into a point.');}
  if(mode===1)return typed('Type the constant term.',`f(x) = ${k}${factor(a)}${factor(-b)}`,v,'Substitute x = 0 and multiply the constant parts.');
  if(mode===2)return typed('Type the y-intercept as an ordered pair.',`f(x) = ${k}${factor(a)}²${factor(-b)}`,`(0, ${k*a*a*b})`,'Evaluate f(0), then write (0, f(0)).');
  return fields('Identify both values.',`f(x) = x${factor(a)}(x² + ${b})`,[{label:'Constant term',answer:'0'},{label:'y-intercept',answer:'(0, 0)',accept:['(0,0)']}],'A factor of x makes f(0)=0.');
}},
{id:'zeros',icon:'0',title:'Zeros & x-intercepts',desc:'Separate x-values from ordered pairs.',bridge:'A zero is r. An x-intercept is (r, 0).',gen:()=>{let a=ri(1,7),b=ri(1,7);while(a===b)b=ri(1,7);return choice('Which statement is correct?',`f(x) = ${factor(a)}${factor(-b)}`,`zeros ${a}, −${b}; x-intercepts (${a}, 0), (−${b}, 0)`,[`zeros (${a}, 0), (−${b}, 0); x-intercepts ${a}, −${b}`,`zeros −${a}, ${b}; x-intercepts (−${a}, 0), (${b}, 0)`,`zeros ${a}, −${b}; y-intercepts (${a}, 0), (−${b}, 0)`],'Set each factor equal to zero, then turn each zero r into (r, 0).');}},
{id:'multaxis',icon:'m↕',title:'Multiplicity & x-Axis Behavior',desc:'Read the exponent, then predict cross or bounce.',bridge:'Odd multiplicity crosses; even multiplicity bounces.',gen:()=>{
  const r=ri(-6,6),m=ri(1,6),behavior=m%2?'crosses/goes through the x-axis':'bounces/touches and turns at the x-axis';
  return fields(`Analyze the zero x = ${r}.`,`f(x) = ${factor(r)}${sup(m)}${factor(ri(7,10))}`,[{label:'Multiplicity',answer:m},{label:'Behavior',answer:behavior,kind:'select',options:['crosses/goes through the x-axis','bounces/touches and turns at the x-axis']}],'Read the exponent first; odd crosses and even bounces.');
}},
{id:'incdec',icon:'⇅',title:'Increasing & Decreasing',desc:'Use extrema x-values as interval boundaries.',bridge:'Intervals use x-values, not extrema y-values.',gen:()=>{
  const n=ri(2,4),xs=shuffle([-8,-6,-4,-2,1,3,5,7]).slice(0,n).sort((a,b)=>a-b),riseFirst=Math.random()>.5,bounds=['−∞',...xs,'∞'],inc=[],dec=[];
  const extrema=xs.map((x,i)=>`${(i%2===0?riseFirst:!riseFirst)?'local maximum':'local minimum'} at x = ${x}`);
  for(let i=0;i<bounds.length-1;i++){let seg=`(${bounds[i]}, ${bounds[i+1]})`,rising=i%2===0?riseFirst:!riseFirst;(rising?inc:dec).push(seg)}
  return fields('State both interval types.',extrema.join('; '),[{label:'Increasing',answer:inc.join(' ∪ '),interval:true},{label:'Decreasing',answer:dec.join(' ∪ '),interval:true}],'Use the ordered extrema x-values and alternate rising and falling.');}},
{id:'sign',icon:'±',title:'Positive & Negative',desc:'Build a sign chart from zeros and multiplicities.',bridge:'Zeros are excluded. Odd multiplicity flips sign; even stays.',gen:()=>{
  const n=ri(2,4),roots=shuffle([-7,-5,-3,-1,1,2,4,6]).slice(0,n).sort((a,b)=>a-b),mults=roots.map(()=>ri(1,2));while(mults.reduce((a,b)=>a+b,0)>6)mults[ri(0,n-1)]=1;const k=pick([-3,-2,1,2,4]);
  const expr=`${k===1?'':k}${roots.map((r,i)=>factor(r)+sup(mults[i])).join('')}`,bounds=['−∞',...roots,'∞'],positive=[],negative=[];
  for(let i=0;i<bounds.length-1;i++){let test=i===0?roots[0]-1:i===roots.length?roots.at(-1)+1:(roots[i-1]+roots[i])/2,val=k;roots.forEach((r,j)=>val*=Math.pow(test-r,mults[j]));(val>0?positive:negative).push(`(${bounds[i]}, ${bounds[i+1]})`)}
  return fields('State where the function is positive and negative.',`f(x) = ${expr}`,[{label:'Positive',answer:positive.join(' ∪ ')||'none',interval:true},{label:'Negative',answer:negative.join(' ∪ ')||'none',interval:true}],'Test one x-value in each interval; odd multiplicity changes sign and even multiplicity does not.','Paper step: Make a sign chart and exclude the zeros.');}},
{id:'turns',icon:'W',title:'Possible Turning Points',desc:'Find the degree, then subtract one.',bridge:'Maximum possible does not mean actual.',gen:()=>{let f=makeFactored();return typed('What is the maximum possible number of turning points?',`p(x) = ${f.text}`,f.degree-1,'Find the degree of the product, then subtract 1.');}},
{id:'standard',icon:'Σ',title:'Standard-Form Analysis',desc:'Read four features directly from standard form.',bridge:'Degree, LC, constant, and y-intercept are visible.',gen:()=>{let d=ri(3,7),k=pick([-5,-3,2,4]),c=pick([-9,-7,-2,3,8]);return fields('Record the information immediately visible.',visibleForm(d,k,c),[{label:'Degree',answer:d},{label:'Leading coefficient',answer:k},{label:'Constant term',answer:c},{label:'y-intercept',answer:`(0, ${c})`,accept:[`(0,${c})`]}],'Read the first and last terms; remember the intercept is a point.');}},
{id:'remainder',icon:'R',title:'Remainder & Factor Theorems',desc:'Connect P(c), remainder, zero, and factor.',bridge:'Remainder is P(c). A zero remainder makes (x−c) a factor.',gen:()=>{
  const c=pick([-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]),r=pick([0,0,ri(1,9),-ri(1,9)]),div=factor(c);
  const correct=r===0?`P(${c}) = 0, so ${div} is a factor.`:`P(${c}) = ${r}, so ${div} is not a factor.`;
  const wrong=r===0?[`P(${-c}) = 0, so ${div} is a factor.`,`P(${c}) = 0, so ${div} is not a factor.`,`P(${-c}) = 0, so ${factor(-c)} is a factor.`]:[`P(${-c}) = ${r}, so ${div} is not a factor.`,`P(${c}) = 0, so ${div} is a factor.`,`P(${c}) = ${r}, so ${div} is a factor.`];
  return choice('What does this synthetic-division result mean?',`Divisor: ${div} · remainder: ${r}`,correct,wrong,'The remainder equals P(c); only remainder 0 proves a factor.','', 'Paper step: Connect the box value, divisor, and remainder.');
}},
{id:'synthetic',icon:'÷',title:'Synthetic Results',desc:'Read chained divisions and rebuild factored form.',bridge:'Each zero-remainder division recovers one factor; attach the final quotient.',gen:()=>{
  const chain=Math.random()>.35?2:1,c1=pick([-4,-3,-2,1,2,3,4]),c2=Math.random()<.25?c1:pick([-4,-3,-2,1,2,3,4]),complete=Math.random()>.5,u=pick([-4,-2,1,3]),v=pick([-3,-1,2,4]);
  const final=complete?[1,-(u+v),u*v]:[1,ri(-4,4),pick([2,3,5,7])],cs=chain===2?[c1,c2]:[c1],start=cs.reduceRight((p,c)=>polyMul([1,-c],p),final);let cur=start,tables='';
  cs.forEach((c,i)=>{tables+=syntheticTable(cur,c,`Division ${i+1}`);cur=syntheticDivide(cur,c).quotient});
  const recovered=cs.map(factor),correctFactors=complete?[...recovered,factor(u),factor(v)]:[...recovered,`(${quotientText(final)})`],correct=`P(x) = ${correctFactors.join('')}`;
  const wrong=[`P(x) = ${cs.map(c=>factor(-c)).join('')}(${quotientText(final)})`,`P(x) = ${recovered.join('')}(${quotientText(start.slice(0,-cs.length))})`,`P(x) = ${recovered.slice(0,-1).join('')}(${quotientText(final)})`];
  let out=choice('Use the completed synthetic division to write P(x) in factored form.','',correct,wrong,'Each box value c creates factor (x − c); then attach the final quotient.','', 'Paper step: Record each recovered factor and the final quotient.');out.mathHtml=tables;return out;
}},
{id:'rrt',icon:'p/q',title:'Rational Root Theorem',desc:'List every reduced ±p/q candidate.',bridge:'p divides the constant; q divides the LC.',gen:()=>{
  const v=pick([{f:'2x³ + 3x² − 8x − 3',a:'±1, ±3, ±1/2, ±3/2',w:['±1, ±3','±1, ±2','±1, ±2, ±1/3, ±2/3','1, 3, 1/2, 3/2']},{f:'3x³ − 5x² + 2x + 4',a:'±1, ±2, ±4, ±1/3, ±2/3, ±4/3',w:['±1, ±2, ±4','±1, ±3','±1, ±3, ±1/2, ±3/2, ±1/4, ±3/4','1, 2, 4, 1/3, 2/3, 4/3']},{f:'4x³ + x² − 6x − 2',a:'±1, ±2, ±1/2, ±1/4',w:['±1, ±2','±1, ±2, ±4','±1, ±4, ±1/2, ±2/1','1, 2, 1/2, 1/4']}]);
  return choice('Which is the complete list of possible rational zeros?',v.f,v.a,v.w,'Build ±p/q, reduce every fraction, and remove duplicates.','', 'Paper step: List p, list q, then form ±p/q.');
}},
{id:'descartes',icon:'±x',title:'Descartes’ Rule of Signs',desc:'Analyze both f(x) and f(−x).',bridge:'For negative roots, simplify f(−x) first.',gen:()=>{
  const degree=ri(3,6),coeffs=Array.from({length:degree+1},(_,i)=>i===0?pick([-4,-3,-2,1,2,3,4]):i===degree?pick([-8,-5,-3,2,4,7]):pick([-5,-3,-2,0,0,1,2,4,5])),neg=negX(coeffs),v={f:polyText(coeffs),fx:signChanges(coeffs),neg:polyText(neg),fn:signChanges(neg)};
  const mode=pick(['pos','neg','both','form']);
  if(mode==='form')return choice('Which is f(−x)?',v.f,v.neg,[v.f,v.neg.replaceAll('+','TEMP').replaceAll('−','+').replaceAll('TEMP','−'),`−(${v.f})`],'Odd-powered terms change sign; even-powered terms do not.');
  if(mode==='both')return fields('Give every possible count.',v.f,[{label:'Positive real zeros',answer:counts(v.fx)},{label:'Negative real zeros',answer:counts(v.fn)}],'Count changes in f(x), then simplify and count changes in f(−x).','Paper step: Write f(−x) before counting negative-root possibilities.');
  const n=mode==='pos'?v.fx:v.fn;
  return choice(`How many ${mode==='pos'?'positive':'negative'} real zeros are possible?`,mode==='pos'?v.f:`f(x) = ${v.f}\nf(−x) = ${v.neg}`,counts(n),['4 or 2 or 0','3 or 1','2 or 0','1','0'].filter(x=>x!==counts(n)).slice(0,4),'Count sign changes, then decrease by even integers.');
}},
{id:'fta',icon:'nℂ',title:'Fundamental Theorem',desc:'Find degree from the equation, then count roots.',bridge:'Degree n means exactly n complex roots counting multiplicity.',gen:()=>{
  if(Math.random()<.5){let d=ri(4,9),k=pick([-4,2,5]);return typed('How many complex roots are there, counting multiplicity?',visibleForm(d,k,ri(-8,8)),d,'Identify the highest exponent; the total equals the degree.');}
  let f=makeFactored();return typed('How many complex roots are there, counting multiplicity?',`P(x) = ${f.text}`,f.degree,'Add factor degrees with multiplicity; the total equals the polynomial degree.');
}},
{id:'conjugate',icon:'ℂ',title:'Conjugate Roots',desc:'Complete nonreal pairs for real coefficients.',bridge:'Keep the real part; reverse the imaginary sign.',gen:()=>{let a=pick([-5,-3,-2,0,1,4]),b=pick([1,2,3,5]);let shown=`${a} ${b<0?'−':'+'} ${Math.abs(b)}i`,ans=`${a} − ${b}i`;return typed('A polynomial with real coefficients has this root. Type the root that must also occur.',shown,ans,'Change only the sign of the imaginary part.',[ans.replaceAll(' ','')]);}},
{id:'quadratic',icon:'x²',title:'Quadratic Factoring',desc:'Factor the quadratic that remains.',bridge:'Use product and sum; include GCF or nonmonic cases.',gen:()=>{
  const mode=ri(0,2),a=ri(1,7),b=ri(1,7);
  if(mode===0)return choice('Factor completely.',`x² − ${a+b}x + ${a*b}`,`(x − ${a})(x − ${b})`,[`(x + ${a})(x + ${b})`,`(x − ${a*b})(x + 1)`,'prime'],'Check the product and middle-term sum.');
  if(mode===1){let m=pick([2,3]),p=ri(1,4),q=ri(1,5);return choice('Factor completely.',`${m}x² + ${m*p+m*q}x + ${m*p*q}`,`${m}(x + ${p})(x + ${q})`,[`(${m}x + ${p})(x + ${q})`,`${m}(x − ${p})(x − ${q})`,'prime'],'Factor the GCF first, then the trinomial.');}
  let p=pick([2,3]),q=pick([2,4,5]),r=ri(1,4),s=ri(1,5);return choice('Factor completely.',`${p*q}x² + ${p*s+q*r}x + ${r*s}`,`(${p}x + ${r})(${q}x + ${s})`,[`(${p}x − ${r})(${q}x − ${s})`,`(${p*q}x + ${r})(x + ${s})`,'prime'],'Find two binomials whose outer and inner products make the middle term.');
}}
];

let current=null,q=null,attempt=1,challenge=1,reviewMode=false,optionalPractice=false,hintUsed=false;
const sd=id=>state.stages[id]||{correct:0,seen:0,mastered:false};
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderMap();}
function renderMap(){
  const mastered=stages.filter(s=>sd(s.id).mastered).length,p=Math.round(mastered/stages.length*100);
  $('#studentName').textContent=state.name;$('#welcomeName').textContent=state.name.toUpperCase();$('#xp').textContent=state.xp;$('#masteryTop').textContent=p+'%';$('#masteryRingText').textContent=p+'%';$('#masteryRing').style.setProperty('--pct',p*3.6+'deg');$('#reviewCount').textContent=state.missed.length;
  $('#missionGrid').innerHTML=stages.map((s,i)=>{let d=sd(s.id),n=Math.min(3,d.correct);return `<button class="missionCard ${d.mastered?'mastered':''}" data-stage="${s.id}"><span class="stars">${'★'.repeat(n)}${'☆'.repeat(3-n)}</span><b class="icon">${s.icon}</b><small>MISSION ${String(i+1).padStart(2,'0')}</small><h3>${s.title}</h3><p>${s.desc}</p><i><em style="width:${n/3*100}%"></em></i><footer>${n} mastered <span>3 total</span></footer></button>`}).join('');
  $$('[data-stage]').forEach(b=>b.onclick=()=>start(b.dataset.stage,false));
}
function show(v){$$('.view').forEach(x=>x.classList.remove('active'));$(v).classList.add('active');scrollTo({top:0,behavior:'smooth'});}
function start(id,review=false,practice=false){
  current=stages.find(s=>s.id===id);reviewMode=review;optionalPractice=practice||sd(id).mastered;challenge=1;
  $('#missionNo').textContent=review?'TARGETED REVIEW':`MISSION ${String(stages.indexOf(current)+1).padStart(2,'0')}`;$('#missionTitle').textContent=current.title;$('#missionDesc').textContent=current.desc;$('#bridge').textContent=current.bridge+' A star requires a correct first attempt without a hint.';show('#playView');newQ();
}
function freshQuestion(){
  let candidate,signature;
  for(let i=0;i<8;i++){candidate=current.gen();signature=candidate.prompt+'|'+candidate.math;if(signature!==state.recent[current.id])break;}
  state.recent[current.id]=signature;return candidate;
}
function renderAnswer(question,target='#answerArea'){
  const el=$(target);
  const pad=i=>`<div class="notationPad" data-for="${i}"><small>Interval symbols</small>${['−∞','∞','(',')','[',']','∪'].map(s=>`<button type="button" data-symbol="${s}">${s}</button>`).join('')}<em>Example: (−∞, −2) ∪ (4, ∞)</em></div>`;
  if(question.kind==='typed')el.innerHTML=`<label class="typeLabel">Your answer<input class="typedAnswer" data-field="0" autocomplete="off" placeholder="Type your answer"></label>${question.intervalEntry?pad(0):''}`;
  else if(question.kind==='choice')el.innerHTML=question.options.map((o,i)=>`<label class="option"><input type="radio" name="${target==='#answerArea'?'ans':'bossAns'}" value="${i}"><span>${o.html||o.text}</span></label>`).join('');
  else el.innerHTML=question.items.map((it,i)=>it.kind==='select'?`<label class="typeLabel">${it.label}<select data-field="${i}"><option value="">Choose…</option>${it.options.map(o=>`<option>${o}</option>`).join('')}</select></label>`:`<div><label class="typeLabel">${it.label}<input data-field="${i}" autocomplete="off" placeholder="Type your answer"></label>${it.interval?pad(i):''}</div>`).join('');
  el.querySelectorAll('.notationPad button').forEach(b=>b.onclick=()=>{let input=el.querySelector(`[data-field="${b.closest('.notationPad').dataset.for}"]`),p=input.selectionStart??input.value.length;input.value=input.value.slice(0,p)+b.dataset.symbol+input.value.slice(input.selectionEnd??p);input.focus();input.setSelectionRange(p+b.dataset.symbol.length,p+b.dataset.symbol.length)});
}
function newQ(){
  q=freshQuestion();attempt=1;hintUsed=false;$('#attemptLabel').textContent=`${optionalPractice?'OPTIONAL PRACTICE':'CHALLENGE '+challenge} · ATTEMPT 1`;$('#prompt').textContent=q.prompt;if(q.mathHtml)$('#math').innerHTML=q.mathHtml;else $('#math').textContent=q.math;$('#math').classList.toggle('syntheticMath',!!q.mathHtml);$('#given').textContent=q.given||'';$('#given').classList.toggle('hidden',!q.given);$('#paperStep').textContent=q.paper||'';$('#paperStep').classList.toggle('hidden',!q.paper);$('#feedback').className='feedback hidden';$('#nextBtn').classList.add('hidden');$('#checkBtn').classList.remove('hidden');renderAnswer(q);updateStage();setTimeout(()=>$('#answerArea input, #answerArea select')?.focus(),0);
}
function fieldOk(it,value){return [it.answer,...(it.accept||[])].some(a=>norm(a)===norm(value));}
function questionOk(question,target='#answerArea'){
  const root=$(target);
  if(question.kind==='typed')return question.accept.some(a=>norm(a)===norm(root.querySelector('.typedAnswer').value));
  if(question.kind==='choice'){let x=root.querySelector('input[type=radio]:checked');return !!x&&question.options[+x.value].ok;}
  return question.items.every((it,i)=>fieldOk(it,root.querySelector(`[data-field="${i}"]`).value));
}
function wrongFields(question,target='#answerArea'){if(question.kind!=='fields')return[];const root=$(target);return question.items.filter((it,i)=>!fieldOk(it,root.querySelector(`[data-field="${i}"]`).value)).map(it=>it.label)}
function hasAnswer(question,target='#answerArea'){
  const root=$(target);
  if(question.kind==='typed')return root.querySelector('.typedAnswer').value.trim();
  if(question.kind==='choice')return root.querySelector('input[type=radio]:checked');
  return question.items.every((it,i)=>root.querySelector(`[data-field="${i}"]`).value.trim());
}
function fb(text,kind,target='#feedback'){let e=$(target);e.textContent=text;e.className='feedback '+kind;}
function updateStage(){let n=Math.min(3,sd(current.id).correct);$('#stageMastered').textContent=n;$('#stageBar').style.width=n/3*100+'%';}
$('#checkBtn').onclick=()=>{
  if(!hasAnswer(q)){fb('Complete every answer first.','hint');return;}
  let good=questionOk(q),d=sd(current.id);d.seen++;
  if(good){
    const wasMastered=d.mastered,earnedStar=attempt===1&&!hintUsed&&!optionalPractice&&!reviewMode;if(earnedStar)d.correct=Math.min(3,d.correct+1);d.mastered=d.correct>=3;state.xp+=earnedStar?20:10;state.stages[current.id]=d;
    if(reviewMode)state.missed=state.missed.filter(m=>m.stage!==current.id);
    fb(earnedStar?'Correct on the first attempt — star earned! +20 XP':'Corrected! No star for this question; the next new question is another chance. +10 XP','good');$('#checkBtn').classList.add('hidden');
    if(d.mastered&&!wasMastered&&!optionalPractice&&!reviewMode){save();updateStage();setTimeout(openMastery,350);return;}
    $('#nextBtn').classList.remove('hidden');
  }else{
    const wrong=wrongFields(q);attempt++;state.missed.push({stage:current.id,skill:current.title,attempts:attempt-1,at:Date.now()});state.missed=state.missed.slice(-50);fb(`Not yet${wrong.length?` — recheck ${wrong.join(' and ')}`:''}. ${q.hint}`,'bad');$('#attemptLabel').textContent=`${optionalPractice?'OPTIONAL PRACTICE':'CHALLENGE '+challenge} · ATTEMPT ${attempt}`;
  }
  save();updateStage();
};
$('#hintBtn').onclick=()=>{hintUsed=true;fb(q.hint+' You can still correct this question, but the next new question will be your next chance to earn a star.','hint')};$('#nextBtn').onclick=()=>{challenge++;newQ();};
function openMastery(){
  $('#masteryTitle').textContent=`${current.title} mastered!`;$('#masteryXp').textContent='Three stars earned. Choose where to go next.';
  const i=stages.indexOf(current);$('#masteryNext').textContent=i<stages.length-1?'Next mission →':'Go to final mission →';$('#masteryDialog').showModal();
}
$('#masteryMap').onclick=()=>{$('#masteryDialog').close();show('#mapView');};
$('#masteryPractice').onclick=()=>{$('#masteryDialog').close();optionalPractice=true;challenge++;newQ();};
$('#masteryNext').onclick=()=>{let i=stages.indexOf(current);$('#masteryDialog').close();if(i<stages.length-1)start(stages[i+1].id);else{$('#bossBtn').click();}};

function graphSvg(fn,marks=[]){
  const w=320,h=190,xMin=-5.5,xMax=6.5,yMin=-60,yMax=60,X=x=>(x-xMin)/(xMax-xMin)*w,Y=y=>h-(Math.max(yMin,Math.min(yMax,y))-yMin)/(yMax-yMin)*h;
  let pts=[];for(let i=0;i<=180;i++){let x=xMin+(xMax-xMin)*i/180;pts.push(`${i?'L':'M'}${X(x).toFixed(1)},${Y(fn(x)).toFixed(1)}`)}
  return `<div class="graphChoice"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Candidate polynomial graph"><line x1="0" y1="${Y(0)}" x2="${w}" y2="${Y(0)}"/><line x1="${X(0)}" y1="0" x2="${X(0)}" y2="${h}"/><path d="${pts.join(' ')}"/>${marks.map(m=>`<g><circle cx="${X(m.x)}" cy="${Y(m.y)}" r="4"/><text x="${X(m.x)+5}" y="${Y(m.y)-6}">${m.t}</text></g>`).join('')}</svg></div>`;
}
const fBoss=x=>-Math.pow(x+2,2)*(x-1)*(x-4),bossMarks=[{x:-2,y:0,t:'−2'},{x:1,y:0,t:'1'},{x:4,y:0,t:'4'},{x:2.92,y:50.2,t:'max'}];
const graphCorrect=graphSvg(fBoss,bossMarks),graphWrongEnd=graphSvg(x=>Math.pow(x+2,2)*(x-1)*(x-4),bossMarks),graphWrongMult=graphSvg(x=>-5*(x+2)*(x-1)*(x-4),[{x:-2,y:0,t:'−2'},{x:1,y:0,t:'1'},{x:4,y:0,t:'4'}]),graphWrongZero=graphSvg(x=>-Math.pow(x+1,2)*(x-1)*(x-4),[{x:-1,y:0,t:'−1'},{x:1,y:0,t:'1'},{x:4,y:0,t:'4'}]);

const bossSteps=[
  {section:'1. Structure',label:'Degree',q:'What is the degree?',a:'4',hint:'Add the factor exponents: 2 + 1 + 1.'},
  {section:'1. Structure',label:'Leading coefficient',q:'What is the leading coefficient?',a:'-1',accept:['−1'],hint:'Use the outside negative and each factor’s leading term.'},
  {section:'1. Structure',label:'Domain',q:'State the domain.',a:'(−∞, ∞)',accept:['all real numbers','(-infinity,infinity)'],hint:'Every polynomial is defined for every real x.'},
  {section:'1. Structure',label:'Maximum turns',q:'What is the maximum possible number of turning points?',a:'3',hint:'Degree minus one.'},
  {section:'2. Intercepts',label:'Constant term',q:'What is the constant term?',a:'-16',accept:['−16'],hint:'Evaluate f(0).'},
  {section:'2. Intercepts',label:'y-intercept',q:'Type the y-intercept as an ordered pair.',a:'(0, −16)',accept:['(0,-16)'],hint:'The point is (0, f(0)).'},
  {section:'2. Intercepts',label:'Zeros',q:'List the real zeros from least to greatest.',a:'-2, 1, 4',accept:['−2,1,4'],hint:'Set each factor equal to zero.'},
  {section:'2. Intercepts',label:'x-intercepts',q:'List the x-intercepts.',a:'(−2, 0), (1, 0), (4, 0)',accept:['(-2,0),(1,0),(4,0)'],hint:'Turn each zero r into the point (r, 0).'},
  {section:'2. Intercepts',label:'Multiplicity at −2',q:'Give the multiplicity and behavior at x = −2.',kind:'fields',items:[{label:'Multiplicity',answer:'2'},{label:'Behavior',answer:'bounces/touches and turns at the x-axis',kind:'select',options:['crosses/goes through the x-axis','bounces/touches and turns at the x-axis']}],hint:'Read the exponent on (x + 2); even multiplicity bounces.'},
  {section:'2. Intercepts',label:'Behavior at 1 and 4',q:'Give each multiplicity and behavior.',kind:'fields',items:[{label:'Multiplicity at 1',answer:'1'},{label:'Behavior at 1',answer:'crosses/goes through the x-axis',kind:'select',options:['crosses/goes through the x-axis','bounces/touches and turns at the x-axis']},{label:'Multiplicity at 4',answer:'1'},{label:'Behavior at 4',answer:'crosses/goes through the x-axis',kind:'select',options:['crosses/goes through the x-axis','bounces/touches and turns at the x-axis']}],hint:'Both factors have exponent 1, so both zeros cross.'},
  {section:'3. End & Range',label:'Left end',q:'Complete: As x → −∞, f(x) → ___',a:'−∞',accept:['-infinity'],hint:'Even degree and negative LC means both ends fall.'},
  {section:'3. End & Range',label:'Right end',q:'Complete: As x → ∞, f(x) → ___',a:'−∞',accept:['-infinity'],hint:'The right end follows the negative leading coefficient.'},
  {section:'3. End & Range',label:'Global extremum',q:'Which listed point is the global extremum?',a:'global maximum (2.92, 50.20)',accept:['(2.92,50.20)','maximum (2.92,50.20)'],hint:'Both ends fall, so compare the relative maxima.'},
  {section:'3. End & Range',label:'Range',q:'State the range.',a:'(−∞, 50.20]',accept:['(-infinity,50.20]','(-infinity,50.2]'],hint:'Use the global maximum’s y-value and include it.',interval:true},
  {section:'4. Intervals',label:'Increasing',q:'State all increasing intervals.',a:'(−∞, −2) ∪ (−0.17, 2.92)',accept:['(-infinity,-2)u(-0.17,2.92)'],hint:'Use the x-values where the graph rises toward a maximum.',interval:true},
  {section:'4. Intervals',label:'Decreasing',q:'State all decreasing intervals.',a:'(−2, −0.17) ∪ (2.92, ∞)',accept:['(-2,-0.17)u(2.92,infinity)'],hint:'Use the x-values where the graph falls.',interval:true},
  {section:'4. Intervals',label:'Positive',q:'Where is f(x) positive?',a:'(1, 4)',hint:'Positive means above the x-axis; zeros are excluded.',paper:'Paper step: Use the zeros to make a sign chart.',interval:true},
  {section:'4. Intervals',label:'Negative',q:'Where is f(x) negative?',a:'(−∞, −2) ∪ (−2, 1) ∪ (4, ∞)',accept:['(-infinity,-2)u(-2,1)u(4,infinity)'],hint:'The even-multiplicity zero −2 splits the interval but does not change the sign.',paper:'Paper step: Use the zeros to make a sign chart.',interval:true},
  {section:'5. Graph Plan',label:'Graph match',q:'Which graph matches your complete analysis?',kind:'graph',correct:graphCorrect,wrong:[graphWrongEnd,graphWrongMult,graphWrongZero],hint:'Compare end behavior, intercepts, and whether the graph bounces at x = −2.'}
];
let bi=0,bq=null;
function bossSections(){return [...new Set(bossSteps.map(x=>x.section))];}
function renderBoss(){
  const step=bossSteps[bi],sections=bossSections();
  $('#bossNav').innerHTML=sections.map(sec=>{let inds=bossSteps.map((x,i)=>x.section===sec?i:-1).filter(i=>i>=0),done=inds.every(i=>state.boss[i]);return`<button class="${inds.includes(bi)?'active':''} ${done?'done':''}" data-bi="${inds.find(i=>!state.boss[i])??inds[0]}">${sec} ${done?'★':''}</button>`;}).join('');
  $$('[data-bi]').forEach(x=>x.onclick=()=>{bi=+x.dataset.bi;renderBoss();});
  if(step.kind==='choice'||step.kind==='graph')bq=choice(step.q,'f(x) = −(x + 2)²(x − 1)(x − 4)',step.correct,step.wrong,step.hint);
  else if(step.kind==='fields')bq=fields(step.q,'f(x) = −(x + 2)²(x − 1)(x − 4)',step.items,step.hint);
  else bq=typed(step.q,'f(x) = −(x + 2)²(x − 1)(x − 4)',step.a,step.hint,step.accept||[],step.paper||'',!!step.interval);
  $('#bossPrompt').innerHTML=`<p class="kicker">CHECKPOINT ${bi+1} OF ${bossSteps.length}</p><h2>${step.label}</h2><p>${step.q}</p>`;
  $('#bossPaperStep').textContent=bq.paper||'';$('#bossPaperStep').classList.toggle('hidden',!bq.paper);renderAnswer(bq,'#bossAnswers');$('#bossFeedback').className='feedback hidden';$('#bossCheck').classList.remove('hidden');$('#bossNext').classList.add('hidden');$('#bossCheck').textContent='Check checkpoint';
}
$('#bossBtn').onclick=()=>{bi=bossSteps.findIndex((_,i)=>!state.boss[i]);if(bi<0)bi=0;renderBoss();show('#bossView');};
$('#bossCheck').onclick=()=>{
  if(!hasAnswer(bq,'#bossAnswers')){fb('Complete the answer first.','hint','#bossFeedback');return;}
  if(questionOk(bq,'#bossAnswers')){if(!state.boss[bi])state.xp+=15;state.boss[bi]=true;fb('Correct. Checkpoint complete!','good','#bossFeedback');$('#bossCheck').classList.add('hidden');$('#bossNext').classList.remove('hidden');$('#bossNext').textContent=bi===bossSteps.length-1?'Finish analysis →':'Next checkpoint →';save();}
  else{const wrong=wrongFields(bq,'#bossAnswers');fb(`Not yet${wrong.length?` — recheck ${wrong.join(' and ')}`:''}. ${bq.hint}`,'bad','#bossFeedback');}
};
$('#bossHint').onclick=()=>fb(bq.hint,'hint','#bossFeedback');
$('#bossNext').onclick=()=>{
  let next=bossSteps.findIndex((_,i)=>i>bi&&!state.boss[i]);if(next<0)next=bossSteps.findIndex((_,i)=>!state.boss[i]);
  if(next<0){$('#analysisSummary').innerHTML=bossSteps.map(x=>{let answer=x.a||x.correct||(x.items?x.items.map(i=>`${i.label}: ${i.answer}`).join(' · '):'Verified graph match');return`<div><b>${x.label}</b><span>${answer}</span></div>`}).join('');$('#finalDialog').showModal();return;}
  bi=next;renderBoss();$('.bossChallenge').scrollIntoView({behavior:'smooth',block:'start'});
};
$('#bossBack').onclick=$('#mapBack').onclick=$('#brandHome').onclick=()=>show('#mapView');
$('#finalMap').onclick=()=>{$('#finalDialog').close();show('#mapView');};
$('#finalAgain').onclick=()=>{$('#finalDialog').close();bi=0;renderBoss();};
$('#finalReview').onclick=()=>{$('#finalDialog').close();if(state.missed.length)start(pick(state.missed).stage,true);else show('#mapView');};
$('#reviewBtn').onclick=()=>{if(!state.missed.length){alert('No missed skills are waiting.');return;}start(pick(state.missed).stage,true);};
$('#profileBtn').onclick=()=>{$('#nameInput').value=state.name;$('#profileDialog').showModal();};
$('#saveName').onclick=e=>{e.preventDefault();state.name=$('#nameInput').value.trim()||'Scholar';save();$('#profileDialog').close();};
$('#resetBtn').onclick=()=>{if(confirm('Reset all Version 4 progress saved in this browser?')){state=structuredClone(fresh);save();}};
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&$('#playView').classList.contains('active')&&!$('#checkBtn').classList.contains('hidden'))$('#checkBtn').click();});
renderMap();
