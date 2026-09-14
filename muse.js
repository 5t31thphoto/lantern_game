/*
  Lantern Muse 2 bridge — vendored, dependency-free Web Bluetooth adapter.
  Based on the public Muse BLE protocol used by MuseJS/muse-js.
  Muse 2 exposes EEG, PPG, accelerometer and gyroscope over BLE service 0xfe8d.
*/
class LanternMuseBuffer{constructor(size=512){this.a=new Float32Array(size);this.i=0;this.n=0}write(v){this.a[this.i]=v;this.i=(this.i+1)%this.a.length;this.n=Math.min(this.n+1,this.a.length)}readLast(n=this.n){n=Math.min(n,this.n);const out=new Float32Array(n);const s=(this.i-this.n+this.a.length)%this.a.length;for(let j=0;j<n;j++)out[j]=this.a[(s+this.n-n+j+this.a.length)%this.a.length];return out}}
class LanternMuse2{
 constructor(){
  this.SERVICE=0xfe8d;
  this.C={control:'273e0001-4c4d-454d-96be-f03bac821358',battery:'273e000b-4c4d-454d-96be-f03bac821358',gyro:'273e0009-4c4d-454d-96be-f03bac821358',accel:'273e000a-4c4d-454d-96be-f03bac821358',ppg1:'273e000f-4c4d-454d-96be-f03bac821358',ppg2:'273e0010-4c4d-454d-96be-f03bac821358',ppg3:'273e0011-4c4d-454d-96be-f03bac821358',eeg1:'273e0003-4c4d-454d-96be-f03bac821358',eeg2:'273e0004-4c4d-454d-96be-f03bac821358',eeg3:'273e0005-4c4d-454d-96be-f03bac821358',eeg4:'273e0006-4c4d-454d-96be-f03bac821358',eeg5:'273e0007-4c4d-454d-96be-f03bac821358'};
  this.device=null;this.gatt=null;this.control=null;this.connected=false;this.battery=null;this.info={};this.infoFragment='';
  this.eeg=[0,1,2,3,4].map(()=>new LanternMuseBuffer(1024));this.accel=[0,1,2].map(()=>new LanternMuseBuffer(256));this.gyro=[0,1,2].map(()=>new LanternMuseBuffer(256));
  this.onFrame=null;this.onState=null;
 }
 emitState(s){if(this.onState)try{this.onState(s)}catch(e){}}
 async connect(){
  if(!navigator.bluetooth)throw new Error('Web Bluetooth is not available in this browser. Use Chrome or Edge on Android/Windows over HTTPS.');
  this.emitState('requesting');
  this.device=await navigator.bluetooth.requestDevice({filters:[{services:[this.SERVICE]}],optionalServices:[this.SERVICE]});
  this.device.addEventListener('gattserverdisconnected',()=>this._lost());
  this.emitState('connecting');this.gatt=await this.device.gatt.connect();
  const svc=await this.gatt.getPrimaryService(this.SERVICE);
  this.control=await this._notify(svc,this.C.control,e=>this._control(e));
  await this._notify(svc,this.C.battery,e=>this._battery(e));
  await this._notify(svc,this.C.accel,e=>this._motion(e,this.accel,.0000610352));
  await this._notify(svc,this.C.gyro,e=>this._motion(e,this.gyro,.0074768));
  for(let i=0;i<4;i++)await this._notify(svc,this.C['eeg'+(i+1)],e=>this._eeg(i,e));
  this.connected=true;this.emitState('starting');
  await this._cmd('h');await this._cmd('p21');await this._cmd('s');await this._cmd('d');await this._cmd('v1');
  this.emitState('connected');this._loop();
 }
 async _notify(svc,id,fn){const c=await svc.getCharacteristic(id);c.addEventListener('characteristicvaluechanged',fn);await c.startNotifications();return c}
 _control(e){const u=new Uint8Array(e.target.value.buffer);if(!u.length)return;const len=u[0];const s=new TextDecoder().decode(u.slice(1,1+len));for(const ch of s){this.infoFragment+=ch;if(ch==='}'){try{Object.assign(this.info,JSON.parse(this.infoFragment))}catch(_){}this.infoFragment=''}}}
 _battery(e){const d=e.target.value;this.battery=Math.max(0,Math.min(100,d.getUint16(2)/512*100))}
 _motion(e,b,scale){const d=e.target.value;for(let i=0;i<3;i++){const o=2+i*6;for(let k=0;k<3;k++)b[k].write(d.getInt16(o+k*2)*scale)}}
 _eeg(n,e){const u=new Uint8Array(e.target.value.buffer);for(let i=2;i+2<u.length;i+=3){const a=(u[i]<<4)|(u[i+1]>>4),b=((u[i+1]&15)<<8)|u[i+2];this.eeg[n].write(.48828125*(a-2048));this.eeg[n].write(.48828125*(b-2048))}}
 async _cmd(cmd){if(this.control)await this.control.writeValue(new TextEncoder().encode('X'+cmd+'\n').map((v,i,a)=>i===0?a.length-1:v))}
 async disconnect(){try{if(this.control)await this._cmd('h')}catch(_){}try{if(this.gatt?.connected)this.gatt.disconnect()}catch(_){}this._lost()}
 _lost(){this.connected=false;this.emitState('disconnected')}
 _loop(){if(!this.connected)return;const f=this.analyze();if(this.onFrame)this.onFrame(f);setTimeout(()=>this._loop(),250)}
 analyze(){
  const ch=this.eeg.slice(0,4).map(x=>x.readLast(256));
  const quality=this._quality(ch);
  const band=this._bands(ch);
  const motion=this._motionLevel();
  const steadiness=Math.max(0,Math.min(1,quality*(1-motion)));
  return {quality,steadiness,motion,band,battery:this.battery,channels:ch.map(a=>a.length)};
 }
 _quality(ch){let score=0;for(const a of ch){if(a.length<32)continue;let m=0;for(const v of a)m+=v; m/=a.length;let v=0;for(const x of a)v+=(x-m)*(x-m);v/=a.length;const rms=Math.sqrt(v);let bad=0;for(let i=1;i<a.length;i++)if(Math.abs(a[i]-a[i-1])>180)bad++;score+=Math.max(0,Math.min(1,1-bad/a.length*6))*(rms>1&&rms<150?1:.35)}return score/4}
 _motionLevel(){const a=this.accel.map(x=>x.readLast(20));let s=0,n=0;for(let k=0;k<3;k++){for(const v of a[k]){s+=Math.abs(v);n++}}return Math.max(0,Math.min(1,(s/n-.95)/.8))}
 _bands(ch){const avg=new Float32Array(ch[0]?.length||0);let n=0;for(const a of ch)if(a.length){for(let i=0;i<avg.length&&i<a.length;i++)avg[i]+=a[i];n++}if(n)for(let i=0;i<avg.length;i++)avg[i]/=n;const p=(lo,hi)=>this._power(avg,lo,hi);return {delta:p(1,3),theta:p(4,7),alpha:p(8,12),beta:p(13,30)}}
 _power(a,lo,hi){if(a.length<128)return 0;const N=256,fs=256;let sum=0,count=0;for(let k=Math.ceil(lo*N/fs);k<=Math.floor(hi*N/fs);k++){let re=0,im=0;for(let n=0;n<N;n++){const x=a[a.length-N+n]||0;const ang=2*Math.PI*k*n/N;re+=x*Math.cos(ang);im-=x*Math.sin(ang)}sum+=(re*re+im*im)/(N*N);count++}return count?sum/count:0}
}
window.LanternMuse2=LanternMuse2;
