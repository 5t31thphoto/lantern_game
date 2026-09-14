/* Optional Muse 2 Web Bluetooth bridge. No external library. Browser support varies. */
const MuseUI=(()=>{
let device=null,chars={},running=false,buf=[],lastT=0;
const EEG_SERVICE='273e0000-4c4d-454d-96be-f03bac821358';
const EEG_CHAR='273e0003-4c4d-454d-96be-f03bac821358';
const CONTROL='273e0001-4c4d-454d-96be-f03bac821358';
const CONTROL2='273e0002-4c4d-454d-96be-f03bac821358';
const BATTERY='00002a19-0000-1000-8000-00805f9b34fb';
const EOG='273e0005-4c4d-454d-96be-f03bac821358';
function available(){return !!(navigator.bluetooth&&window.isSecureContext)}
async function connect(){if(!available()){alert('This browser does not expose Web Bluetooth here. Try Chrome or Edge on a supported Android/Windows device over HTTPS.');return}try{device=await navigator.bluetooth.requestDevice({filters:[{services:[EEG_SERVICE]},{namePrefix:'Muse'}],optionalServices:[EEG_SERVICE,'0000180f-0000-1000-8000-00805f9b34fb']});device.addEventListener('gattserverdisconnected',disconnect);const server=await device.gatt.connect();const service=await server.getPrimaryService(EEG_SERVICE);chars.eeg=await service.getCharacteristic(EEG_CHAR);chars.control=await service.getCharacteristic(CONTROL);chars.control2=await service.getCharacteristic(CONTROL2);chars.eeg.addEventListener('characteristicvaluechanged',onEEG);await chars.eeg.startNotifications();await chars.control.writeValue(new TextEncoder().encode('h\n'));await chars.control.writeValue(new TextEncoder().encode('s\n'));await chars.control.writeValue(new TextEncoder().encode('p20\n'));await chars.control.writeValue(new TextEncoder().encode('d\n'));Lantern.S.muse.connected=true;Lantern.save();toastMuse('Muse 2 connected');startTicker()}catch(e){console.warn(e);toastMuse('Muse connection cancelled or unavailable.')}}
function disconnect(){running=false;Lantern.S.muse.connected=false;Lantern.save();toastMuse('Muse disconnected')}
function onEEG(ev){const d=new Uint8Array(ev.target.value.buffer);const vals=[];for(let i=0;i+1<d.length;i+=2){const raw=(d[i]<<8)|d[i+1];const v=raw&0x0fff;vals.push(v)}for(let i=0;i<vals.length;i+=4){const q=vals.slice(i,i+4);if(q.length===4)buf.push(q.reduce((a,b)=>a+b,0)/4)}if(buf.length>512)buf=buf.slice(-512);lastT=Date.now()}
function startTicker(){if(running)return;running=true;setInterval(()=>{if(!running)return;const age=(Date.now()-lastT)/1000;const quality=lastT?Math.max(0,1-Math.min(1,age/3)):0;let variance=0,mean=0;if(buf.length){mean=buf.reduce((a,b)=>a+b,0)/buf.length;variance=buf.reduce((a,b)=>a+(b-mean)**2,0)/buf.length}const motion=Math.min(1,variance/250000);const steadiness=quality*(1-motion*.75);Lantern.museFrame({quality,steadiness,motion});updateStatus(quality,steadiness,motion)},1000)}
function updateStatus(q,s,m){const el=document.getElementById('museStatus');if(el)el.textContent=`Muse 2 · ${Math.round(q*100)}% signal · ${Math.round(s*100)}% steady`;const orb=document.getElementById('medorb');if(orb)orb.style.transform=`scale(${.8+s*.7})`;const lamp=document.getElementById('biglantern');if(lamp)lamp.style.filter=`drop-shadow(0 0 ${8+s*22}px rgba(255,220,130,.65))`}
function toastMuse(t){const x=document.getElementById('toast');if(x){x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2600)}}
return{connect,disconnect,available};
})();
