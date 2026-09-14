/* Lantern — The Long Night v5. Local-first game state. No network/runtime deps. */
const Lantern=(()=>{
const KEY='lanternGameV5';
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const rand=(seed)=>{let h=2166136261; for(const c of seed){h^=c.charCodeAt(0);h=Math.imul(h,16777619)} return ()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
const pick=(r,a)=>a[Math.floor(r()*a.length)];
const defaults=()=>({version:5,day:1,lastDate:'',streak:0,light:12,coins:24,energy:5,maxEnergy:5,weather:0,inventory:{wood:4,stone:3,herb:2,seed:3,thread:1,star:0,berry:2,tea:1,fish:0},home:{garden:0,lantern:0,bench:0,pond:0,plants:[],decor:[],clean:3},friends:[],discoveries:[],journal:[],quests:{},skills:{ground:0,flex:0,connect:0,meaning:0,care:0,restore:0},stats:{wander:0,harvest:0,craft:0,play:0,friend:0,days:1,calmSessions:0},settings:{sound:false,motion:true,voice:false},muse:{connected:false,quality:0,steadiness:0,motion:0,alpha:0,beta:0,battery:null,last:0}});
let S=load();
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&x.version===5?x:defaults()}catch{return defaults()}}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function today(){return new Date().toISOString().slice(0,10)}
function boot(){const d=today();if(S.lastDate!==d){if(S.lastDate){const gap=Math.floor((Date.now()-new Date(S.lastDate))/86400000);S.streak=gap<=1?S.streak+1:1}else S.streak=1;S.lastDate=d;S.day++;S.energy=S.maxEnergy;S.weather=(S.day*7)%5;dailyQuest();save()}}
function dailyQuest(){const q=[['wander','Take a walk',2],['tend','Tend two things',2],['friend','Spend time with a friend',2],['craft','Make something',2],['play','Play a little game',2]][(S.day-1)%5];S.quests.daily={id:q[0],label:q[1],goal:q[2],done:0,reward:6}}
const areas=[
{id:'home',name:'Your Little House',need:0,kind:'home',desc:'A warm corner of the world. Tend it, decorate it, or simply sit with the lantern.'},
{id:'mosswood',name:'Mosswood',need:0,kind:'wild',desc:'Soft paths, mushrooms, fireflies and creatures with excellent hiding places.'},
{id:'moonpond',name:'Moonpond',need:35,kind:'water',desc:'A silver pond with fish, stepping stones and small games.'},
{id:'nightmarket',name:'Night Market',need:70,kind:'market',desc:'Tiny stalls, odd trades, recipes and friends looking for something.'},
{id:'echo',name:'Echo Forest',need:115,kind:'echo',desc:'The forest remembers sounds. Follow an echo, sort a thought, or simply listen.'},
{id:'garden',name:'Keepsake Garden',need:165,kind:'garden',desc:'Plant what you want to keep alive: a value, a memory, a recipe, a joke.'},
{id:'dawnhill',name:'Dawn Hill',need:230,kind:'summit',desc:'A quiet overlook. Nothing here needs fixing.'}
];
const names=['Momo','Pip','Nix','Bram','Lumi','Toto','Moss','Peb','Wisp','Clover','Puddle','Jun','Tansy','Fig','Rue','Bibi','Mallow','Soot','Pico','Nori','Dumpling','Fern'];
const likes=['berries','warm tea','stars','mushrooms','rain','bells','maps','smooth stones','music','moonlight','tiny cakes'];
const bodies=['moth','fox','frog','bird','otter','bean','cat','bat','bunny','mushroom'];
const temper=['shy','curious','sleepy','silly','brave','thoughtful','gentle','restless'];
function creature(seed){const r=rand(seed);return{id:'f'+Math.abs(hash(seed)).toString(36),seed,name:pick(r,names),body:pick(r,bodies),hue:Math.floor(r()*360),size:.85+r()*.3,ears:pick(r,['none','round','leaf','long','horn']),eyes:pick(r,['dot','wide','sleep','spark']),mark:pick(r,['plain','spot','stripe','star','moon']),temperament:pick(r,temper),like:pick(r,likes),home:pick(r,['mosswood','pond','village']),bond:0,trust:0,met:0,position:{x:10+r()*80,y:15+r()*70},mood:pick(r,['content','curious','sleepy','excited'])}}
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return h>>>0}
function addFriend(c){if(S.friends.some(f=>f.id===c.id))return S.friends.find(f=>f.id===c.id);S.friends.push(c);S.stats.friend++;return c}
function friend(id){return S.friends.find(f=>f.id===id)}
function gain(light=1,coins=0,skill){S.light+=light;S.coins+=coins;if(skill)S.skills[skill]=(S.skills[skill]||0)+1;S.energy=Math.min(S.maxEnergy,S.energy+0);touchQuest(skill);save()}
function touchQuest(type,n=1){const q=S.quests.daily;if(!q)return;if((q.id==='wander'&&type==='wander')||(q.id==='tend'&&type==='tend')||(q.id==='friend'&&type==='connect')||(q.id==='craft'&&type==='craft')||(q.id==='play'&&type==='play'))q.done=Math.min(q.goal,q.done+n);if(q.done>=q.goal&&!q.claimed){q.claimed=true;S.light+=q.reward;S.coins+=q.reward}}
function spendEnergy(n=1){if(S.energy<n)return false;S.energy-=n;return true}
function spendCost(cost){for(const [k,v] of Object.entries(cost))if((S.inventory[k]||0)<v)return false;for(const [k,v] of Object.entries(cost))S.inventory[k]-=v;return true}
function canArea(id){const a=areas.find(x=>x.id===id);return a&&S.light>=a.need}
function wander(areaId){if(!spendEnergy(1))return {error:'tired'};S.stats.wander++;touchQuest('wander');const area=areas.find(a=>a.id===areaId)||areas[1];const r=rand(`${S.day}|${area.id}|${S.stats.wander}|${S.light}|${S.weather}`);const roll=r();let type=roll<.27?'creature':roll<.47?'gather':roll<.63?'mini':roll<.79?'view':roll<.9?'choice':'cache';let out={area,type};
if(type==='creature'){const c=creature(`${S.day}-${area.id}-${S.stats.wander}`);const old=friend(c.id);if(old){old.met++;old.position=c.position;old.mood=c.mood;old.trust=Math.min(5,old.trust+1);out.friend=old;out.new=false}else{out.creature=c;out.new=true}}
if(type==='gather'){const table=area.kind==='water'?['fish','stone','herb','berry']:['wood','herb','stone','seed'];const item=pick(r,table);const qty=1+rInt(r,2);S.inventory[item]=(S.inventory[item]||0)+qty;out.item=item;out.qty=qty;gain(2,1,'care');S.stats.harvest+=1}
if(type==='cache'){const item=pick(r,['star','thread','tea','berry','seed']);const qty=1;S.inventory[item]=(S.inventory[item]||0)+qty;out.item=item;out.qty=qty;gain(3,2,'meaning')}
if(type==='view'){out.view=pick(r,['a moonlit snail the size of a teacup','fireflies arranging themselves into a crooked constellation','rain making tiny rings in a puddle','a fox-shaped cloud that refuses to become anything else','mushrooms glowing under the roots','a perfect warm patch of moss']) ;gain(2,0,'ground')}
if(type==='choice'){out.choice=pick(r,[{q:'A shortcut is washed out. What now?',a:[['Take the long way','restore'],['Repair a little crossing','care'],['Explore somewhere else','flex']]},{q:'A tiny creature is carrying something too large.',a:[['Help it','connect'],['Watch how it solves it','ground'],['Offer a different route','flex']]},{q:'You find a note with no name.',a:[['Leave it where it is','care'],['Read it','meaning'],['Carry it to the market','connect']]}])}
if(type==='mini')out.mini=pick(r,['firefly','pond','lantern','sorting']);gain(1,0,'flex');save();return out}
function rInt(r,n){return 1+Math.floor(r()*n)}
function resolveChoice(skill){gain(4,3,skill);S.stats.play++;touchQuest('play');return true}
function playMini(kind,result){let reward=kind==='firefly'?5:kind==='pond'?6:kind==='lantern'?5:4;gain(reward,2,kind==='sorting'?'meaning':'flex');S.stats.play++;touchQuest('play');return reward}
function friendAction(id,action){const f=friend(id);if(!f)return null;let msg,skill='connect',coins=1;if(action==='sit'){f.bond++;f.trust=Math.min(5,f.trust+1);msg=`${f.name} settles beside you. The two of you watch the lantern.`;skill='ground'}
if(action==='play'){f.bond+=2;f.trust=Math.min(5,f.trust+1);msg=`You invent a ridiculous game with ${f.name}. The rules are immediately forgotten.`;skill='flex'}
if(action==='talk'){f.bond++;f.trust=Math.min(5,f.trust+1);msg=`${f.name} tells you about ${f.like}. You swap a small story.`;skill='connect'}
if(action==='help'){f.trust=Math.min(5,f.trust+2);f.bond++;msg=`You help ${f.name} with a little problem. They look pleased.`;skill='care'}
if(action==='gift'){const item=f.like==='berries'?'berry':f.like==='warm tea'?'tea':f.like==='stars'?'star':'herb';if((S.inventory[item]||0)<1)return{error:`You don't have a ${item} yet.`};S.inventory[item]--;f.bond+=2;msg=`${f.name} accepts the ${item}. Their whole face brightens.`;skill='meaning'}
f.met++;gain(2,coins,skill);touchQuest('connect');return{f,msg}}
function tend(thing){if(thing==='garden'){if(!spendCost({seed:1}))return{error:'You need a seed.'};S.home.plants.push({stage:0,day:S.day});S.home.garden++;gain(3,2,'care');return{msg:'You tuck a seed into the soil. Tomorrow is allowed to be tomorrow.'}}
if(thing==='water'){if(!S.home.plants.length)return{error:'Nothing needs watering yet.'};S.home.plants.forEach(p=>p.stage=Math.min(3,p.stage+1));gain(3,2,'care');return{msg:'The garden drinks. A few leaves uncurl.'}}
if(thing==='lantern'){if(!spendCost({herb:1,stone:1}))return{error:'You need one herb and one stone.'};S.home.lantern++;gain(4,2,'ground');return{msg:'You polish the lantern and replace a tiny worn part. The light settles.'}}
if(thing==='clean'){S.home.clean=3;gain(2,2,'restore');return{msg:'A few minutes of sweeping makes the little place feel like yours again.'}}
if(thing==='sit'){gain(1,0,'ground');return{msg:'You sit. Nothing is required of you for a moment.'}}
}
function craft(item){const recipes={tea:{cost:{herb:1,berry:1},out:{tea:1},msg:'A fragrant cup of berry tea.'},lanternCharm:{cost:{thread:1,star:1},out:{decor:1},msg:'A tiny star charm for the lantern.'},seedPacket:{cost:{berry:1,herb:1},out:{seed:3},msg:'Three saved seeds for another day.'},stoneBench:{cost:{stone:3,wood:2},out:{bench:1},msg:'A sturdy little bench.'}};const rec=recipes[item];if(!rec||!spendCost(rec.cost))return{error:'Not enough materials.'};for(const [k,v] of Object.entries(rec.out)){if(k==='decor')S.home.decor.push('star');else if(k==='bench')S.home.bench++;else S.inventory[k]=(S.inventory[k]||0)+v}S.stats.craft++;gain(5,3,'care');touchQuest('craft');return{msg:rec.msg}}
function harvest(){const ready=S.home.plants.filter(p=>p.stage>=3);if(!ready.length)return{error:'Nothing is ready yet.'};S.home.plants=S.home.plants.filter(p=>p.stage<3);S.inventory.berry+=ready.length;S.inventory.seed+=ready.length;gain(4,3,'meaning');return{msg:`You harvest ${ready.length} little bundle${ready.length>1?'s':''} of berries and seeds.`}}
function reset(){S=defaults();save()}
function exportSave(){return JSON.stringify(S,null,2)}
function importSave(text){try{const x=JSON.parse(text);if(x.version!==5)throw 0;S=x;save();return true}catch{return false}}
function museFrame(x){Object.assign(S.muse,{quality:clamp(x.quality),steadiness:clamp(x.steadiness),motion:clamp(x.motion),alpha:+x.band?.alpha||0,beta:+x.band?.beta||0,battery:x.battery??S.muse.battery,last:Date.now()});save()}
function clamp(x){return Math.max(0,Math.min(1,Number(x)||0))}
function start(){boot();S.stats.plays++;save()}
return{S,areas,wander,resolveChoice,playMini,friend,addFriend,friendAction,tend,craft,harvest,canArea,gain,spendCost,museFrame,exportSave,importSave,reset,start,save,creature,KEY};
})();
