/* Lantern 2 — local-first game engine. No network, no dependencies. */
const Lantern=(()=>{
const KEY='lanternGameV3';
const defaults=()=>({version:3,light:0,coins:12,streak:0,lastDay:'',world:0,skill:{ground:0,flex:0,connect:0,meaning:0,care:0},inventory:[],friends:[],seen:[],journal:[],settings:{motion:true,sound:false,muse:false},muse:{connected:false,quality:0,attention:0,steadiness:0,motion:0,alpha:0,beta:0,battery:null,last:0},stats:{plays:0,returnWins:0,explore:0,kind:0}});
let S=load();
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&x.version===3?x:defaults()}catch(e){return defaults()}}
function save(){localStorage.setItem(KEY,JSON.stringify(S));}
function today(){return new Date().toISOString().slice(0,10)}
function boot(){if(S.lastDay!==today()){if(S.lastDay){let d=(Date.now()-new Date(S.lastDay).getTime())/86400000;S.streak=d<2?S.streak+1:1}else S.streak=1;S.lastDay=today();save()}}
function rand(n){return Math.floor(Math.random()*n)}
function seedHash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function creature(seed){let h=seedHash(seed);const pick=a=>a[(h=Math.imul(h^h>>>13,1274126177)>>>0)%a.length];
 const names=['Pip','Momo','Nix','Bram','Lumi','Toto','Moss','Peb','Wisp','Clover','Puddle','Jun'];
 const bodies=['round','bean','moth','fox','frog','bird','blob']; const ears=['none','leaf','round','long','horn']; const eyes=['dot','wide','sleep','spark']; const marks=['plain','spot','stripe','star','moon'];
 return {id:seed,name:pick(names),body:pick(bodies),ears:pick(ears),eyes:pick(eyes),mark:pick(marks),hue:(h%360+360)%360,friendable:true};}
function addLight(n,skill){S.light+=n;if(skill)S.skill[skill]=(S.skill[skill]||0)+1;save()}
function reward(label,skill){addLight(3,skill);S.coins+=2;return {label,light:3,coins:2}}
const rooms=[
 {id:'village',name:'Lantern Village',tag:'home',desc:'A tiny village under an enormous sky. The lights are small, but they are on.',unlocked:()=>true},
 {id:'mosswood',name:'Mosswood',tag:'explore',desc:'Soft paths, strange mushrooms, and creatures that pretend not to be watching.',unlocked:()=>S.world>=1},
 {id:'moonpond',name:'Moonpond',tag:'steady',desc:'The water mirrors whatever the sky is doing. It never insists on one weather.',unlocked:()=>S.world>=2},
 {id:'echo',name:'Echo Forest',tag:'story',desc:'Here, sounds become little objects. Some are useful. Some are simply echoes.',unlocked:()=>S.world>=3},
 {id:'garden',name:'Keepsake Garden',tag:'meaning',desc:'Things that mattered can become seeds without being put away.',unlocked:()=>S.world>=4},
 {id:'nightmarket',name:'Night Market',tag:'connect',desc:'Nobody asks why you came. Someone always has a warm bowl or a ridiculous hat.',unlocked:()=>S.world>=5},
 {id:'dawn',name:'Dawn Hill',tag:'carry',desc:'The path home is still part of the path.',unlocked:()=>S.world>=6}
];
function unlockIf(){const thresholds=[0,8,18,30,44,60,80];for(let i=1;i<thresholds.length;i++)if(S.light>=thresholds[i])S.world=Math.max(S.world,i);save()}
const games={
 weather(){const opts=[['😶','numb'],['💧','sad'],['🔥','angry'],['🌱','tender'],['⚡','restless'],['🌤️','calm']];let target=opts[rand(opts.length)];return {type:'weather',title:'Weather Catch',prompt:'Catch the weather before it changes.',target,opts:opts.sort(()=>Math.random()-.5)}},
 return(){return {type:'return',title:'Come Back',prompt:'The lantern drifts away. Bring it back by finding the ordinary things that are still here.',items:['warmth','water','sound','ground','light','company'].sort(()=>Math.random()-.5)}},
 echo(){return {type:'echo',title:'Echo Sorting',prompt:'An echo can be a fact, a feeling, or a story. Sort one gently.',cards:[['The room is quieter.','fact'],['I miss them.','feeling'],['Nothing will ever feel right again.','story'],['I wish I had said more.','feeling'],['Tomorrow still exists.','fact'],['I should have known.','story']]}}
};
function explore(){S.stats.explore++;const c=creature(Date.now().toString()+Math.random());let found=Math.random()<.65;if(found&&!S.inventory.find(x=>x.id===c.id))S.inventory.push(c);if(Math.random()<.24&&!S.friends.find(x=>x.id===c.id)){S.friends.push(c);S.stats.kind++}addLight(1,'connect');save();return {creature:c,found,friend:S.friends.some(x=>x.id===c.id)}}
function journal(text){if(!text.trim())return false;S.journal.unshift({t:Date.now(),text:text.trim()});S.journal=S.journal.slice(0,60);save();return true}
function exportSave(){return JSON.stringify(S,null,2)}
function importSave(text){try{let x=JSON.parse(text);if(x.version!==3)throw Error();S=x;save();return true}catch(e){return false}}
function museFrame(x){S.muse.quality=Math.max(0,Math.min(1,x.quality??0));S.muse.attention=Math.max(0,Math.min(1,x.attention??0));S.muse.steadiness=Math.max(0,Math.min(1,x.steadiness??0));S.muse.motion=Math.max(0,Math.min(1,x.motion??0));S.muse.alpha=Number(x.band?.alpha||0);S.muse.beta=Number(x.band?.beta||0);S.muse.battery=x.battery??S.muse.battery;S.muse.last=Date.now()}
function start(){boot();S.stats.plays++;save()}
return {S,rooms,games,creature,reward,unlockIf,explore,journal,exportSave,importSave,museFrame,save,start,KEY};
})();
