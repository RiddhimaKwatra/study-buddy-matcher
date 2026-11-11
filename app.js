(() => {
'use strict';
const KEY = 'sbm_v1';
const SKILLS = ['Frontend','Backend','UI/UX Design','ML / Data','Mobile','Presenting','Hardware / IoT'];
const CORE = ['Frontend','Backend','UI/UX Design','ML / Data','Presenting'];
const COURSES = ['CSE','ECE','Mechanical','Design','MBA'];
const GOALS = ['Hackathon','Study partner','Course project'];
const INTERESTS = ['Web app','AI / ML','Mobile app','Game','IoT','Social good'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const PARTS = [['M','Morning'],['A','Afternoon'],['E','Evening']];

const mk = (id,name,course,year,goal,interest,skills,slots) => ({id,name,course,year,goal,interest,skills:skills.split(','),slots:slots.split(' ')});
const STUDENTS = [
  mk('s1','Simran Kaur','Design',2,'Hackathon','Web app','UI/UX Design,Presenting','Mon-E Wed-E Sat-M Sat-A Sun-A'),
  mk('s2','Harpreet Singh','CSE',3,'Hackathon','AI / ML','ML / Data,Backend','Tue-E Thu-E Sat-A Sat-E Sun-A'),
  mk('s3','Ananya Gupta','CSE',2,'Hackathon','Web app','Frontend,UI/UX Design','Mon-E Tue-E Sat-A Sun-M Sun-A'),
  mk('s4','Rohan Verma','ECE',3,'Hackathon','IoT','Hardware / IoT,Backend','Wed-E Fri-E Sat-M Sat-A'),
  mk('s5','Priya Nair','MBA',1,'Course project','Social good','Presenting','Mon-A Wed-A Fri-A Sat-A'),
  mk('s6','Karan Mehta','CSE',4,'Hackathon','Mobile app','Mobile,Frontend','Tue-E Fri-E Sat-E Sun-E Sun-A'),
  mk('s7','Neha Bansal','CSE',2,'Study partner','AI / ML','ML / Data','Mon-E Tue-E Wed-E Thu-E'),
  mk('s8','Arjun Malik','Mechanical',3,'Course project','IoT','Hardware / IoT','Mon-A Thu-A Sat-M Sun-M'),
  mk('s9','Ishita Sood','Design',3,'Hackathon','Mobile app','UI/UX Design,Mobile','Tue-E Wed-E Sat-A Sun-A Sun-E'),
  mk('s10','Dev Malhotra','CSE',2,'Hackathon','Game','Frontend,Backend','Mon-E Thu-E Sat-A Sat-E Sun-A'),
  mk('s11','Tanvi Arora','ECE',2,'Study partner','Web app','Backend,Presenting','Mon-E Wed-E Fri-E Sun-A'),
  mk('s12','Gurpreet Dhillon','CSE',4,'Hackathon','Social good','Backend,ML / Data,Presenting','Sat-M Sat-A Sat-E Sun-M Sun-A'),
  mk('s13','Meera Joshi','Design',1,'Course project','Web app','UI/UX Design','Tue-A Thu-A Sat-A Sun-A'),
  mk('s14','Yash Kapoor','CSE',3,'Hackathon','AI / ML','ML / Data,Frontend','Tue-E Thu-E Sat-A Sun-A Sun-E')
];

const fresh = () => ({me:null,team:[],sent:[],theme:null,req:CORE.slice()});
function load(){try{const j=JSON.parse(localStorage.getItem(KEY));if(j&&typeof j==='object')return Object.assign(fresh(),j)}catch(e){}return fresh()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let S = load(), view = 'profile', filt = {goal:'',skill:''};
let draft = S.me ? JSON.parse(JSON.stringify(S.me)) : {name:'',course:'CSE',year:2,goal:'Hackathon',interest:'Web app',skills:[],slots:[]};

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials = n => n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const slotName = s => { const [d,p] = s.split('-'); return d + ' ' + PARTS.find(x=>x[0]===p)[1].toLowerCase(); };
let tt; function toast(m){const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(tt);tt=setTimeout(()=>t.classList.add('hidden'),2200)}

/* ---------- matching algorithm ---------- */
function score(a, b){
  const A = new Set(a.skills), B = new Set(b.skills), U = new Set([...A, ...B]);
  const gain = [...B].filter(x => !A.has(x));
  const lose = [...A].filter(x => !B.has(x));
  const comp = U.size ? (gain.length + lose.length) / U.size : 0;          // complementary skills, 40
  const ov = a.slots.filter(s => b.slots.includes(s));
  const m = Math.min(a.slots.length, b.slots.length);
  const av = m ? Math.min(1, ov.length / m) : 0;                           // shared free time, 30
  const sameC = a.course === b.course, sameG = a.goal === b.goal;
  const ctx = (sameC ? 12 : 0) + (sameG ? 8 : 0);                          // course + goal, 20
  const sameI = a.interest === b.interest;                                 // interest, 10
  const parts = {skills: comp*40, time: av*30, course: ctx, interest: sameI?10:0};
  const total = Math.round(parts.skills + parts.time + parts.course + parts.interest);
  const why = [];
  if (gain.length) why.push('Brings ' + gain.join(', ') + ' that you don’t have');
  if (ov.length) why.push('Both free ' + ov.length + ' time slot' + (ov.length>1?'s':'') + ', e.g. ' + slotName(ov[0]));
  if (sameG) why.push('Also looking for: ' + b.goal.toLowerCase());
  if (sameI) why.push('Both interested in ' + b.interest.toLowerCase());
  if (sameC) why.push('Same course (' + b.course + ')');
  return {total, parts, gain, why};
}
const ringColor = t => t >= 70 ? 'var(--mint)' : t >= 45 ? 'var(--acc)' : 'var(--warn)';

/* ---------- views ---------- */
function needProfile(){
  return `<div class="panel empty"><div style="font-size:2.2rem">👤</div><h2>Create your profile first</h2><p class="muted">Matches are based on your skills and free time.</p><button class="btn pri" data-tab="profile">Create profile</button></div>`;
}
function profileView(){
  const d = draft;
  const opt = (arr, v) => arr.map(x => `<option ${String(x)===String(v)?'selected':''}>${esc(x)}</option>`).join('');
  return `<h1>${S.me ? 'Your profile' : 'Create your profile'}</h1><p class="muted">This is the only data the matcher uses. It stays in your browser.</p>
  <div class="panel">
    <label class="f" for="pName">Name</label><input type="text" id="pName" maxlength="40" value="${esc(d.name)}" placeholder="e.g. Aman Sharma" style="width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card)">
    <div class="grid2">
      <div><label class="f" for="pCourse">Course</label><select id="pCourse">${opt(COURSES,d.course)}</select></div>
      <div><label class="f" for="pYear">Year</label><select id="pYear">${opt([1,2,3,4],d.year)}</select></div>
      <div><label class="f" for="pGoal">Looking for</label><select id="pGoal">${opt(GOALS,d.goal)}</select></div>
      <div><label class="f" for="pInt">Interest</label><select id="pInt">${opt(INTERESTS,d.interest)}</select></div>
    </div>
    <label class="f">Your skills</label>
    <div class="chips">${SKILLS.map(s=>`<button class="chip ${d.skills.includes(s)?'on':''}" data-act="skill" data-v="${esc(s)}" aria-pressed="${d.skills.includes(s)}">${esc(s)}</button>`).join('')}</div>
    <label class="f">When are you free? <span class="muted">Tap the slots</span></label>
    <div class="slots"><table><tr><th></th>${DAYS.map(x=>`<th>${x}</th>`).join('')}</tr>
    ${PARTS.map(([p,l])=>`<tr><th>${l}</th>${DAYS.map(x=>{const k=x+'-'+p;const on=d.slots.includes(k);return `<td><button class="slot ${on?'on':''}" data-act="slot" data-v="${k}" aria-pressed="${on}" aria-label="${x} ${l}"></button></td>`}).join('')}</tr>`).join('')}</table></div>
    <div class="bar"><button class="btn pri" data-act="save">Save profile</button><button class="btn" data-act="demo">Fill demo profile</button></div>
  </div>`;
}
function findView(){
  if (!S.me) return needProfile();
  let list = STUDENTS.filter(s => (!filt.goal || s.goal===filt.goal) && (!filt.skill || s.skills.includes(filt.skill)))
    .map(s => ({s, r: score(S.me, s)})).sort((a,b) => b.r.total - a.r.total);
  const opt = (arr, v, all) => `<option value="">${all}</option>` + arr.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('');
  return `<h1>Your best matches</h1><p class="muted">Ranked by compatibility with ${esc(S.me.name)}. The demo uses sample students.</p>
  <div class="filters"><select id="fGoal" aria-label="Filter by goal">${opt(GOALS,filt.goal,'Any goal')}</select><select id="fSkill" aria-label="Filter by skill">${opt(SKILLS,filt.skill,'Any skill')}</select></div>
  <div class="list">${list.map(({s,r}) => card(s,r)).join('') || '<div class="panel empty">No students match these filters. Try “Any goal” or “Any skill”.</div>'}</div>`;
}
function card(s, r){
  const sent = S.sent.includes(s.id), inTeam = S.team.includes(s.id);
  const P = [['Skills',r.parts.skills,40],['Time',r.parts.time,30],['Course',r.parts.course,20],['Interest',r.parts.interest,10]];
  return `<article class="panel card">
    <div class="ring" style="--p:${r.total};--c:${ringColor(r.total)}" role="img" aria-label="Compatibility ${r.total} out of 100"><b>${r.total}</b></div>
    <div>
      <div class="who"><strong>${esc(s.name)}</strong><span class="muted">${esc(s.course)}, year ${s.year} · ${esc(s.goal)}</span></div>
      <div class="chips" style="margin-top:8px">${s.skills.map(k=>`<span class="chip ${r.gain.includes(k)?'gain':''}">${r.gain.includes(k)?'+ ':''}${esc(k)}</span>`).join('')}</div>
      <div class="parts">${P.map(([n,v,m])=>`<div class="part"><small><span>${n}</span><span>${Math.round(v)}/${m}</span></small><i><s style="width:${v/m*100}%"></s></i></div>`).join('')}</div>
      <ul class="why">${r.why.map(w=>`<li>${esc(w)}</li>`).join('')}</ul>
      <div class="cta"><button class="btn sm ${sent?'done':'pri'}" data-act="req" data-id="${s.id}" ${sent?'disabled':''}>${sent?'Request sent':'Send request'}</button>
      <button class="btn sm" data-act="${inTeam?'rm':'add'}" data-id="${s.id}">${inTeam?'Remove from team':'Add to team'}</button></div>
    </div></article>`;
}
function teamView(){
  if (!S.me) return needProfile();
  const members = [S.me, ...S.team.map(id => STUDENTS.find(s=>s.id===id)).filter(Boolean)];
  const have = new Set(members.flatMap(m => m.skills));
  const missing = S.req.filter(r => !have.has(r));
  return `<h1>Team builder</h1><p class="muted">Pick the roles your project needs and see what is missing.</p>
  <h2>Roles your team needs</h2>
  <div class="chips">${SKILLS.map(r=>`<button class="chip ${S.req.includes(r)?'on':''}" data-act="req-role" data-v="${esc(r)}" aria-pressed="${S.req.includes(r)}">${esc(r)}</button>`).join('')}</div>
  <h2>Your team (${members.length})</h2>
  <div class="panel">${members.map((m,i)=>`<div class="sug"><div><strong>${esc(m.name)}${i===0?' (you)':''}</strong><br><span class="muted">${esc(m.skills.join(', ') || 'No skills listed')}</span></div>${i?`<button class="btn sm" data-act="rm" data-id="${m.id}">Remove</button>`:''}</div>`).join('')}</div>
  <h2>Role coverage</h2>
  <div class="cover">${S.req.map(r=>`<span class="chip ${have.has(r)?'gain':'lack'}">${have.has(r)?'✓':'✗'} ${esc(r)}</span>`).join('') || '<span class="muted">Select at least one role above.</span>'}</div>
  ${S.req.length && !missing.length ? '<div class="panel empty" style="margin-top:14px"><div style="font-size:2rem">🎉</div><strong>Your team covers every role.</strong></div>' : ''}
  ${missing.map(r => {
    const c = STUDENTS.filter(s => s.skills.includes(r) && !S.team.includes(s.id)).map(s => ({s, t: score(S.me,s).total})).sort((a,b)=>b.t-a.t).slice(0,2);
    return `<h2>Missing: ${esc(r)}</h2><div class="panel">${c.map(({s,t})=>`<div class="sug"><div><strong>${esc(s.name)}</strong> <span class="muted">${esc(s.course)}, year ${s.year} · ${t}% match</span></div><button class="btn sm pri" data-act="add" data-id="${s.id}">Add to team</button></div>`).join('') || '<span class="muted">No student with this skill yet.</span>'}</div>`;
  }).join('')}`;
}
function render(){
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === view));
  $('#app').innerHTML = view === 'profile' ? profileView() : view === 'find' ? findView() : teamView();
}
function setTab(t){ view = t; render(); window.scrollTo(0,0); try{ history.replaceState(null,'','#'+t) }catch(e){} }

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-act]'); if (!t) return;
  if (t.dataset.tab) return setTab(t.dataset.tab);
  const a = t.dataset.act, v = t.dataset.v, id = t.dataset.id;
  if (a === 'skill' || a === 'slot') {
    const arr = a === 'skill' ? draft.skills : draft.slots, i = arr.indexOf(v);
    i < 0 ? arr.push(v) : arr.splice(i,1);
    t.classList.toggle('on', i < 0); t.setAttribute('aria-pressed', i < 0);
  } else if (a === 'save') {
    if (!draft.name.trim()) return toast('Enter your name to save.');
    if (!draft.skills.length) return toast('Pick at least one skill.');
    if (!draft.slots.length) return toast('Pick at least one free slot.');
    S.me = JSON.parse(JSON.stringify(draft)); S.me.id = 'me'; save(); toast('Profile saved'); setTab('find');
  } else if (a === 'demo') {
    draft = {name:'Aman Sharma',course:'CSE',year:3,goal:'Hackathon',interest:'Web app',skills:['Frontend'],slots:['Mon-E','Tue-E','Sat-A','Sat-E','Sun-A']}; render(); toast('Demo profile filled. Press Save profile.');
  } else if (a === 'req') {
    if (!S.sent.includes(id)) S.sent.push(id); save(); render(); toast('Request sent to ' + STUDENTS.find(s=>s.id===id).name);
  } else if (a === 'add') {
    if (!S.team.includes(id)) S.team.push(id); save(); render(); toast('Added to team');
  } else if (a === 'rm') {
    S.team = S.team.filter(x => x !== id); save(); render(); toast('Removed from team');
  } else if (a === 'req-role') {
    const i = S.req.indexOf(v); i < 0 ? S.req.push(v) : S.req.splice(i,1); save(); render();
  }
});
document.addEventListener('input', e => {
  const m = {pName:'name'}[e.target.id]; if (m) draft[m] = e.target.value;
});
document.addEventListener('change', e => {
  const id = e.target.id, v = e.target.value;
  if (id === 'pCourse') draft.course = v; else if (id === 'pYear') draft.year = +v;
  else if (id === 'pGoal') draft.goal = v; else if (id === 'pInt') draft.interest = v;
  else if (id === 'fGoal') { filt.goal = v; render(); } else if (id === 'fSkill') { filt.skill = v; render(); }
});
$('#theme').addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
  S.theme = dark ? 'light' : 'dark'; document.documentElement.dataset.theme = S.theme; save();
});
if (S.theme) document.documentElement.dataset.theme = S.theme;
const h = location.hash.slice(1); if (['profile','find','team'].includes(h) && (S.me || h === 'profile')) view = h; else if (S.me) view = 'find';
window.addEventListener('hashchange', () => { const x = location.hash.slice(1); if (['profile','find','team'].includes(x)) { view = x; render(); } });
render();
})();
