(() => {
'use strict';
const KEY='lanternLongNightV7';
const seed0=Date.now()%2147483647;
let S=load();
let toastTimer;
const app=document.getElementById('app');

const areas=[
 {id:'workshop',name:'Lantern Workshop',icon:'🏮',desc:'Your little workshop sits beneath the old cedar. Paper, bamboo, thread, and warm light fill the room.',need:0},
 {id:'meadow',name:'Firefly Meadow',icon:'✦',desc:'A soft field where paper, herbs, and curious friends turn up after dusk.',need:0},
 {id:'grove',name:'Bamboo Grove',icon:'🎋',desc:'Tall green stalks sway overhead. Good frame material grows here.',need:4},
 {id:'pond',name:'Moonpond',icon:'◌',desc:'A quiet pond with reeds, fish, lilies, and things that only appear when you stop rushing.',need:8},
 {id:'hill',name:'Dawn Hill',icon:'☼',desc:'The highest place. From here, every lantern becomes a star.',need:14}
];
const species=['moth','fox','frog','bird','bunny','otter','sprite'];
const names=['Mori','Pip','Nori','Juniper','Tavi','Mallow','Clover','Miso','Poe','Luma','Wren','Kiko'];
const colors=['rose','mint','gold','lavender','sky','peach'];
const activities={
 fold:{name:'Fold the Paper',icon:'▱',reward:2},
 frame:{name:'Shape the Frame',icon:'⌁',reward:2},
 tie:{name:'Tie the Frame',icon:'⌘',reward:2},
 wick:{name:'Set the Wick',icon:'✧',reward:2},
 paint:{name:'Paint a Pattern',icon:'✎',reward:3},
 message:{name:'Write a Message',icon:'✉',reward:3},
 light:{name:'Light the Lantern',icon:'🔥',reward:4}
};

function fresh(){return {day:1,light:0,materials:{paper:3,bamboo:2,thread:2,wax:2,ink:1,herb:2},coins:8,lanterns:[],current:null,sky:[],friends:[],discovered:[],quests:[],home:{plants:2,tidy:3},stats:{crafted:0,flown:0,explored:0,kind:0,returned:0},scene:'home',muse:{connected:false,quality:0,steadiness:.5},settings:{sound:true}}}
function load(){try{return Object.assign(fresh(),JSON.parse(localStorage.getItem(KEY)||'{}'),{materials:Object.assign(fresh().materials,(JSON.parse(localStorage.getItem(KEY)||'{}').materials||{}))})}catch{return fresh()}}
function save(){localStorage.setItem(KEY,JSON.stringify(S));}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function rand(n){let x=Math.sin((S.day*999+S.stats.explored*31+n*17+seed0)*12.9898)*43758.5453;return x-Math.floor(x)}
function has(o){return Object.entries(o).every(([k,v])=>(S.materials[k]||0)>=v)}
function take(o){for(const [k,v] of Object.entries(o))S.materials[k]-=v}
function gain(o){for(const [k,v] of Object.entries(o))S.materials[k]=(S.materials[k]||0)+v}
function note(msg){clearTimeout(toastTimer);let e=document.querySelector('.toast');if(!e){e=document.createElement('div');e.className='toast';document.body.append(e)}e.textContent=msg;e.classList.add('show');toastTimer=setTimeout(()=>e.classList.remove('show'),2600)}
function render(){
 app.innerHTML=`<header class="top"><button class="brand" onclick="go('home')"><span class="brandlamp">🏮</span><span><b>Lantern</b><small>The Long Night</small></span></button><div class="resources"><span>✦ ${S.light}</span><span>🪵 ${S.materials.bamboo}</span><span>📜 ${S.materials.paper}</span><span>🧵 ${S.materials.thread}</span></div><button class="menu" onclick="go('journal')">☰</button></header><main id="main"></main><nav class="bottom"><button onclick="go('home')">⌂<small>Home</small></button><button onclick="go(\'workshop\')">🏮<small>Make</small></button><button onclick="go('wander')">✦<small>Wander</small></button><button onclick="go('sky')">☾<small>Sky</small></button><button onclick="go('friends')">♡<small>Friends</small></button></nav>`;
 const m=document.getElementById('main');
 if(S.scene==='home')home(m); else if(S.scene==='workshop')workshop(m); else if(S.scene==='message')message(m); else if(S.scene==='launch')launch(m); else if(S.scene==='wander')wander(m); else if(S.scene==='friends')friends(m); else if(S.scene==='sky')sky(m); else if(S.scene==='journal')journal(m); else if(S.scene==='meditate')meditate(m);
}
function shell(title,kicker,body){return `<section class="screen"><div class="kicker">${kicker}</div><h1>${title}</h1>${body}</section>`}
function home(m){
 const need=10+S.stats.flown*3;
 m.innerHTML=shell('A little light, made by hand.','DAY '+S.day+' · '+(S.stats.flown?'YOUR SKY IS GROWING':'THE WORKSHOP IS WAITING'),`<div class="hero"><div class="heroart"><div class="moon"></div><div class="tree"></div><div class="tinyflames">${S.sky.slice(-8).map((x,i)=>`<i style="--i:${i}"></i>`).join('')}</div><div class="ground"></div></div><div class="heroCopy"><p>There is paper on the table, a warm wick, and a whole night ahead.</p><button class="primary big" onclick="go(\'workshop\')">Make tonight's lantern <span>→</span></button><button class="ghost" onclick="go('wander')">Take a slow walk first</button></div></div>
 <div class="daily"><div><span class="eyebrow">TONIGHT'S LITTLE AIM</span><b>${questText()}</b></div><button onclick="dailyQuest()">${S.quests.includes(S.day)?'✓ Done':'Go'}</button></div>
 <div class="tiles"><button onclick="go(\'workshop\')"><span>🏮</span><b>Workshop</b><small>Build something real</small></button><button onclick="go('wander')"><span>✦</span><b>Wander</b><small>Find materials & friends</small></button><button onclick="go('sky')"><span>☾</span><b>Your Sky</b><small>${S.sky.length} lanterns released</small></button><button onclick="go('friends')"><span>♡</span><b>Friends</b><small>${S.friends.length} little lives nearby</small></button></div>
 <div class="zenbar"><span>☁</span><div><b>Nothing here needs to be rushed.</b><small>Stopping, wandering, making, and returning all count.</small></div><button onclick="go('meditate')">Quiet minute</button></div>`)
}
function questText(){const q=['Find something blue in the meadow.','Make a lantern with a hand-painted pattern.','Meet a creature and learn its favorite thing.','Gather three different materials.','Send a lantern into the night.','Visit somewhere you have not been today.'];return q[(S.day-1)%q.length]}
function dailyQuest(){if(S.quests.includes(S.day)){note('Tonight’s little aim is already complete.');return}let t=questText();if(t.includes('Make')&&S.stats.crafted>S.day-1){finishQuest()}else if(t.includes('Send')&&S.stats.flown>S.day-1){finishQuest()}else{note(t);go(t.includes('Meet')?'friends':t.includes('Send')?'workshop':t.includes('Gather')?'wander':'wander')}}
function finishQuest(){if(!S.quests.includes(S.day)){S.quests.push(S.day);S.light+=5;S.coins+=3;save();note('Little aim complete. +5 light, +3 mooncoins');render()}}
function workshop(m){
 if(!S.current)S.current={step:0,pattern:'moon',message:'',color:'gold'};
 const c=S.current, steps=['fold','frame','tie','wick','paint','message','light'];
 const labels=['Paper','Frame','Thread','Wick','Pattern','Message','Light'];
 let cards=steps.map((id,i)=>{let done=c.step>i;return `<div class="step ${done?'done':''} ${c.step===i?'active':''}"><span>${done?'✓':i+1}</span><small>${labels[i]}</small></div>`}).join('');
 m.innerHTML=shell('The Lantern Workshop','MAKE SOMETHING YOU CAN SEND AWAY',`<div class="workbench"><div class="lanternPreview ${c.color||'gold'} ${c.step>=6?'lit':''}"><div class="lanternTop"></div><div class="lanternBody"><div class="pattern">${pattern(c.pattern)}</div><div class="messagePreview">${esc(c.message||'')}</div></div><div class="flame"></div></div><div class="steps">${cards}</div><div class="actionCard">${workAction(c,steps[c.step])}</div></div><div class="materialStrip"><span>📜 Paper ${S.materials.paper}</span><span>🎋 Bamboo ${S.materials.bamboo}</span><span>🧵 Thread ${S.materials.thread}</span><span>🕯 Wax ${S.materials.wax}</span><span>✎ Ink ${S.materials.ink}</span></div>`)
}
function workAction(c,id){
 if(c.step>=7)return `<h2>This one is ready.</h2><p>It has a paper body, a frame, a wick, a pattern, and words tucked safely inside.</p><button class="primary big" onclick="go('launch')">Take it outside →</button>`;
 if(id==='message')return `<h2>Give it words.</h2><p>One word is enough. A sentence is enough. You can also leave it blank.</p><textarea id="msg" maxlength="120" placeholder="A word to carry, thank, set down, or wish…">${esc(c.message)}</textarea><div class="chips">${['Carry','Thank','Set down','Wish'].map((x,i)=>`<button onclick="prefill(${i})">${x}</button>`).join('')}</div><button class="primary" onclick="setMessage()">Fold the message inside →</button>`;
 if(id==='paint')return `<h2>Make it yours.</h2><p>Choose a pattern. The lantern remembers it when it becomes a star.</p><div class="patternChoices">${['moon','stars','waves','leaves'].map(x=>`<button class="patternChoice ${c.pattern===x?'sel':''}" onclick="pickPattern('${x}')">${pattern(x)}</button>`).join('')}</div><div class="colorChoices">${colors.map(x=>`<button class="dot ${x} ${c.color===x?'sel':''}" onclick="pickColor('${x}')"></button>`).join('')}</div><button class="primary" onclick="advance('paint')">Keep the design →</button>`;
 const req={fold:{paper:1},frame:{bamboo:2},tie:{thread:1},wick:{wax:1},light:{}}[id]||{};
 const verb={fold:'Fold the paper',frame:'Shape the bamboo',tie:'Tie the corners',wick:'Set the warm wick',light:'Light it'}[id];
 return `<h2>${verb}.</h2><p>${id==='fold'?'Press and drag the folds into place.':id==='frame'?'Fit the frame around the paper body.':id==='tie'?'A few careful knots keep everything together.':id==='wick'?'The little flame will be ready when you are.':'When the moment feels right, strike the match.'}</p><div class="tactile" onclick="advance('${id}')"><div class="gesture">${id==='fold'?'↙  ↘':id==='frame'?'◜  ◝':id==='tie'?'⌁  ⌁':id==='wick'?'✧':'🔥'}</div><span>tap / press to ${id==='light'?'light':'work'}</span></div><button class="primary" onclick="advance('${id}')">${id==='light'?'Light lantern':'Continue'} →</button>`
}
function advance(id){const c=S.current;const req={fold:{paper:1},frame:{bamboo:2},tie:{thread:1},wick:{wax:1},paint:{ink:1},light:{}}[id]||{};if(!has(req)){note('You need '+Object.entries(req).map(([k,v])=>v+' '+k).join(', '));return}take(req);c.step++;S.light+=(activities[id]?.reward||2);if(id==='light'){S.stats.crafted++;c.step=7}save();render();if(id==='light')setTimeout(()=>go('launch'),300)}
function setMessage(){S.current.message=document.getElementById('msg').value.trim();S.current.step++;S.light+=3;save();render()}
function prefill(i){const vals=['I can carry this gently.','Thank you for what was here.','I do not have to hold everything tonight.','May something kind find its way forward.'];document.getElementById('msg').value=vals[i]}
function pickPattern(x){S.current.pattern=x;render()} function pickColor(x){S.current.color=x;render()}
function pattern(x){return {moon:'☾',stars:'✦ · ✧',waves:'〰〰',leaves:'❧ ❧'}[x]||'✦'}
function launch(m){
 const c=S.current||{};m.innerHTML=shell('The Launching Field','WHEN YOU ARE READY',`<div class="launchScene" id="launchScene"><div class="starsBg"></div><div class="launchLantern ${c.color||'gold'}"><div class="lanternTop"></div><div class="lanternBody"><div>${pattern(c.pattern)}</div></div><div class="flame"></div></div><div class="launchGround"></div></div><div class="launchControls"><p>${c.message?`Inside: <em>“${esc(c.message)}”</em>`:'There are no required words inside. Just light.'}</p><button class="primary big" onclick="sendLantern()">Release the lantern ↑</button><button class="ghost" onclick="go(\'workshop\')">Not yet</button></div>`)
}
function sendLantern(){const c=S.current||{};const id=S.stats.flown+1;S.sky.push({id,message:c.message||'',pattern:c.pattern,color:c.color,day:S.day});S.stats.flown++;S.light+=10;S.coins+=4;S.current=null;save();const scene=document.getElementById('launchScene');scene.classList.add('rising');setTimeout(()=>{S.day++;save();note('Your lantern is a new light in the sky.');render();},4200)}
function wander(m){
 const unlocked=areas.filter(a=>a.need<=S.stats.flown);m.innerHTML=shell('Wander under the night','THE WORLD IS SMALL, BUT IT IS NOT EMPTY',`<div class="areaGrid">${areas.map(a=>`<button class="area ${a.need>S.stats.flown?'locked':''}" ${a.need>S.stats.flown?'disabled':''} onclick="explore('${a.id}')"><span class="areaIcon">${a.icon}</span><b>${a.name}</b><small>${a.need>S.stats.flown?'Unlocks after '+a.need+' lanterns':a.desc}</small></button>`).join('')}</div><div class="wanderNote"><b>Tonight's walking rule:</b> you do not have to accomplish anything. You can go somewhere just because you like being there.</div>`)
}
function explore(id){const a=areas.find(x=>x.id===id);S.stats.explored++;let roll=Math.floor(rand(S.stats.explored)*6);let msg,actions=[];
 if(roll===0){gain({paper:1,herb:1});msg='A loose sheet and a bundle of herbs were tucked beneath a fern.';actions=['Gather them'];}
 else if(roll===1){gain({bamboo:2});msg='A fallen bamboo stalk is just the right size for a lantern frame.';actions=['Take the bamboo'];}
 else if(roll===2){S.coins+=2;msg='You found two mooncoins glinting beside the path.';actions=['Pocket them'];}
 else if(roll===3){meetCreature(id);msg='Something small is watching from behind the grass.';actions=['Meet the creature'];}
 else if(roll===4){S.materials.thread++;msg='A spool of colored thread is caught on an old branch.';actions=['Free the thread'];}
 else {S.light+=2;msg='You stopped long enough for the fireflies to gather around you.';actions=['Stay a moment'];}
 save();m.innerHTML=shell(a.name,a.icon+' · EXPLORATION',`<div class="sceneCard"><div class="sceneIllustration ${id}"><span>${a.icon}</span></div><h2>${msg}</h2><p>${a.desc}</p><button class="primary" onclick="render()">${actions[0]} ✓</button><button class="ghost" onclick="go('wander')">Keep walking</button></div>`)}
function meetCreature(area){let f=S.friends.find(x=>x.area===area)||null;if(!f){let idx=S.friends.length;f={id:idx+1,name:names[idx%names.length],species:species[idx%species.length],color:colors[idx%colors.length],area,temper:['curious','shy','bold','sleepy','playful'][idx%5],favorite:['herbs','stars','music','tea','thread'][idx%5],bond:0,seen:0};S.friends.push(f)}f.seen++;f.bond++;save()}
function creatureSVG(f){return `<div class="creature ${f.color}"><div class="ear e1"></div><div class="ear e2"></div><div class="body"></div><div class="eye a"></div><div class="eye b"></div><div class="mouth"></div><div class="tail"></div></div>`}
function friends(m){m.innerHTML=shell('Little lives nearby','FRIENDS YOU HAVE ACTUALLY MET',`${S.friends.length?`<div class="friendGrid">${S.friends.map(f=>`<article class="friend"><div class="friendArt">${creatureSVG(f)}</div><div class="friendInfo"><h2>${f.name}</h2><span>${f.species} · ${f.temper}</span><p>${f.name} likes <b>${f.favorite}</b> and tends to appear around the ${areaName(f.area)}.</p><div class="bond"><i style="width:${Math.min(100,20+f.bond*8)}%"></i></div><small>Bond ${f.bond}</small><div class="friendBtns"><button onclick="friendAct(${f.id},'sit')">Sit together</button><button onclick="friendAct(${f.id},'play')">Play</button><button onclick="friendAct(${f.id},'gift')">Gift</button></div></div></article>`).join('')}</div>`:`<div class="empty"><div>🐾</div><h2>Someone is out there.</h2><p>Walk the meadow, grove, or pond. The night is full of tiny lives that don't show up on a checklist.</p><button class="primary" onclick="go('wander')">Go looking →</button></div>`}<div class="companionTip">Friends don't need to be collected. You can meet the same one again and simply spend time together.</div>`)}
function areaName(id){return areas.find(a=>a.id===id)?.name||'night'}
function friendAct(id,type){let f=S.friends.find(x=>x.id===id);if(!f)return;f.bond++;S.stats.kind++;if(type==='play')S.light+=2;if(type==='gift'){if((S.materials[f.favorite]||0)>0){S.materials[f.favorite]--;S.coins+=3;note(f.name+' loved that.')}else{note(f.name+' seems happy you thought of them.')}}else if(type==='sit'){S.light+=1;note(f.name+' stayed beside you.')}else{S.light+=2;note('You and '+f.name+' played until the lanterns came on.')}save();render()}
function sky(m){
 const lights=S.sky.map((x,i)=>'<button class="skyLantern '+esc(x.color||'gold')+'" style="--x:'+((8+(i*37)%84))+'%;--y:'+((18+(i*29)%68))+'%" onclick="skyDetail('+i+')">🏮</button>').join('');
 const empty='<div class="empty"><div>☾</div><h2>The sky is waiting.</h2><p>Your first lantern will leave a mark here.</p><button class="primary" onclick="go(\'workshop\')">Make one →</button></div>';
 const caption='<p class="skyCaption">Some nights you can see them immediately. Some nights you have to look for the faintest ones.</p>';
 m.innerHTML=shell('Your Sky','EVERY LIGHT YOU SENT IS STILL PART OF THE NIGHT','<div class="bigSky"><div class="skyMoon"></div>'+lights+'</div><div class="skyStats"><div><b>'+S.sky.length+'</b><small>lights released</small></div><div><b>'+S.sky.filter(x=>x.message).length+'</b><small>messages carried</small></div><div><b>'+new Set(S.sky.map(x=>x.pattern)).size+'</b><small>patterns made</small></div></div>'+(S.sky.length?caption:empty));
}
function skyDetail(i){const x=S.sky[i];note(x.message?'“'+x.message+'” · Day '+x.day:'A quiet lantern · Day '+x.day)}
function journal(m){m.innerHTML=shell('Notebook','YOUR LOCAL LITTLE RECORD',`<div class="notebook"><h2>What the night has become</h2><div class="statsList"><p>Lanterns made <b>${S.stats.crafted}</b></p><p>Lanterns released <b>${S.stats.flown}</b></p><p>Friends met <b>${S.friends.length}</b></p><p>Places explored <b>${S.stats.explored}</b></p><p>Kind moments <b>${S.stats.kind}</b></p></div><hr><button class="secondary" onclick="exportSave()">Export my local save</button><label class="secondary file">Import save<input type="file" accept="application/json" onchange="importSave(event)"></label><button class="danger" onclick="resetGame()">Start over</button></div><div class="about"><b>About the design</b><p>The world is fictional. The mechanics quietly emphasize noticing, returning, connection, meaning, gentle action, and making room for ordinary life. Nothing here diagnoses you or asks you to uncover hidden memories.</p></div>`)}
function meditate(m){m.innerHTML=shell('Quiet Flight','MUSE 2 · OPTIONAL',`<div class="medCard"><div class="medOrb"><div class="medLantern">🏮</div></div><h2 id="medTitle">Let the lantern drift.</h2><p id="medText">Connect Muse if you want the light to respond to your steadiness. You can also simply watch it.</p><div class="signal"><span>Muse</span><b>${S.muse.connected?'connected':'not connected'}</b><i style="width:${Math.round(S.muse.quality*100)}%"></i></div><div class="medBtns"><button class="primary" onclick="medStart()">Begin 5 minutes</button><button class="ghost" onclick="museDemo()">Muse test / simulate</button></div></div>`)}
let medTimer=null;function medStart(){let t=300;const title=document.getElementById('medTitle'),txt=document.getElementById('medText');clearInterval(medTimer);medTimer=setInterval(()=>{t--;let min=Math.floor(t/60),sec=String(t%60).padStart(2,'0');title.textContent=min+':'+sec;txt.textContent=t>240?'Notice the light.':t>150?'If attention wanders, let it come back.':t>60?'There is nothing to fix right now.': 'Watch the lantern until the last minute becomes quiet.';if(t<=0){clearInterval(medTimer);title.textContent='The lantern is still here.';txt.textContent='You can return to the night whenever you want.'}},1000)}
function museDemo(){S.muse.connected=!S.muse.connected;S.muse.quality=S.muse.connected?.86:0;save();note(S.muse.connected?'Muse signal connected.':'Muse disconnected.');render()}
function exportSave(){const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='lantern-save.json';a.click();URL.revokeObjectURL(a.href)}
function importSave(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{S=Object.assign(fresh(),JSON.parse(r.result));save();render();note('Save imported.')}catch{note('That save file could not be read.')}};r.readAsText(f)}
function resetGame(){if(confirm('Start a new night? Your current local save will be erased.')){S=fresh();save();render()}}
function go(scene){S.scene=scene;save();render();window.scrollTo(0,0)}
window.go=go;window.advance=advance;window.setMessage=setMessage;window.prefill=prefill;window.pickPattern=pickPattern;window.pickColor=pickColor;window.sendLantern=sendLantern;window.explore=explore;window.friendAct=friendAct;window.skyDetail=skyDetail;window.dailyQuest=dailyQuest;window.exportSave=exportSave;window.importSave=importSave;window.resetGame=resetGame;window.medStart=medStart;window.museDemo=museDemo;
render();
})();
