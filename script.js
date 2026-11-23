var KEY='fouzan_crm_data',AUTHK='fouzan_crm_auth',EMAIL='admin@fouzancrm.com',PASS='Admin@123';
var STAGES=['Lead','Contacted','Proposal','Won'];
var SEED={
contacts:[
{id:1,name:'Ayesha Khan',company:'Nova Tech',email:'ayesha@novatech.com',phone:'+92 300 1234567',status:'Customer'},
{id:2,name:'Daniel Moore',company:'BrightPath',email:'daniel@brightpath.io',phone:'+1 415 555 0142',status:'Prospect'},
{id:3,name:'Sara Ahmed',company:'Pixel Studio',email:'sara@pixelstudio.com',phone:'+92 321 7654321',status:'Lead'},
{id:4,name:'Liam Carter',company:'CloudNine',email:'liam@cloudnine.dev',phone:'+44 20 7946 0958',status:'Customer'},
{id:5,name:'Hira Malik',company:'Orbit Labs',email:'hira@orbitlabs.com',phone:'+92 333 9988776',status:'Prospect'}],
deals:[
{id:1,title:'Website redesign',company:'Pixel Studio',value:4500,stage:0},
{id:2,title:'Mobile app MVP',company:'BrightPath',value:12000,stage:1},
{id:3,title:'Data dashboard',company:'Orbit Labs',value:7800,stage:2},
{id:4,title:'API integration',company:'Nova Tech',value:5200,stage:3},
{id:5,title:'Support retainer',company:'CloudNine',value:3000,stage:3}],
tasks:[
{id:1,text:'Send proposal to Orbit Labs',due:'2026-11-25',done:false},
{id:2,text:'Follow up with Pixel Studio',due:'2026-11-26',done:false},
{id:3,text:'Prepare demo for BrightPath',due:'2026-11-28',done:false},
{id:4,text:'Update contact records',due:'2026-11-20',done:true}]};
var D,view='dashboard',q='',memAuth=false;
function load(){try{var d=localStorage.getItem(KEY);if(d)return JSON.parse(d)}catch(e){}return JSON.parse(JSON.stringify(SEED))}
function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
function isAuth(){try{return sessionStorage.getItem(AUTHK)==='1'}catch(e){return memAuth}}
function setAuth(v){memAuth=v;try{if(v)sessionStorage.setItem(AUTHK,'1');else sessionStorage.removeItem(AUTHK)}catch(e){}}
function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return '$'+Number(n).toLocaleString('en-US')}
function nid(a){return a.reduce(function(m,x){return Math.max(m,x.id)},0)+1}
function fdate(s){if(!s)return 'No date';var d=new Date(s+'T00:00:00');return isNaN(d)?s:d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}

/* auth */
function enter(){D=load();$('login').hidden=true;$('app').hidden=false;go('dashboard')}
$('lf').onsubmit=function(e){
e.preventDefault();
var em=$('em').value.trim().toLowerCase(),pw=$('pw').value;
if(!em||!pw){$('err').textContent='Please enter your email and password.';return}
if(em===EMAIL&&pw===PASS){$('err').textContent='';setAuth(true);enter()}
else{$('err').textContent='Invalid email or password. Use the demo login below.'}
};
if(isAuth())enter();

/* navigation */
function go(v){
view=v;q='';
document.querySelectorAll('.nv').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-v')===v)});
render();
}
function render(){
var t={dashboard:'Dashboard',contacts:'Contacts',deals:'Deals pipeline',tasks:'Tasks'};
$('ttl').innerHTML=esc(t[view])+'<small>'+({dashboard:'Overview of your business',contacts:D.contacts.length+' people and companies',deals:'Track deals from lead to won',tasks:D.tasks.filter(function(x){return !x.done}).length+' open tasks'}[view])+'</small>';
$('view').innerHTML={dashboard:vDash,contacts:vContacts,deals:vDeals,tasks:vTasks}[view]();
}

/* views */
function vDash(){
var open=D.deals.filter(function(d){return d.stage<3}),won=D.deals.filter(function(d){return d.stage===3});
var sum=function(a){return a.reduce(function(s,d){return s+Number(d.value)},0)};
var per=STAGES.map(function(n,i){return{n:n,v:sum(D.deals.filter(function(d){return d.stage===i}))}});
var mx=Math.max.apply(null,per.map(function(p){return p.v}).concat([1]));
var tasks=D.tasks.filter(function(t){return !t.done}).slice(0,5);
return '<div class="cards"><div class="card"><small>Total contacts</small><b>'+D.contacts.length+'</b></div><div class="card"><small>Open deals</small><b>'+open.length+'</b></div><div class="card"><small>Pipeline value</small><b>'+money(sum(open))+'</b></div><div class="card"><small>Revenue won</small><b>'+money(sum(won))+'</b></div></div>'+
'<div class="two"><div class="card"><h3>Pipeline by stage</h3>'+per.map(function(p){return '<div class="br"><span>'+p.n+'</span><div><i style="width:'+Math.round(p.v/mx*100)+'%"></i></div><span>'+money(p.v)+'</span></div>'}).join('')+'</div>'+
'<div class="card"><h3>Upcoming tasks</h3>'+(tasks.length?tasks.map(function(t){return '<div class="li">'+esc(t.text)+'<span>'+fdate(t.due)+'</span></div>'}).join(''):'<div class="empty">All caught up 🎉</div>')+'</div></div>';
}
function rowsC(){
var l=D.contacts.filter(function(c){return (c.name+c.company+c.email).toLowerCase().indexOf(q.toLowerCase())>-1});
if(!l.length)return '<tr><td colspan="5" class="empty">No contacts found.</td></tr>';
return l.map(function(c){return '<tr><td>'+esc(c.name)+'<small>'+esc(c.email)+'</small></td><td>'+esc(c.company)+'</td><td>'+esc(c.phone)+'</td><td><span class="tag '+esc(c.status)+'">'+esc(c.status)+'</span></td><td><button class="btn sm d" data-act="delC" data-id="'+c.id+'">Delete</button></td></tr>'}).join('');
}
function vContacts(){
return '<div class="bar"><input id="q" placeholder="Search contacts…"><button class="btn p" data-act="addC">+ Add contact</button></div><div class="tw"><table><thead><tr><th>Name</th><th>Company</th><th>Phone</th><th>Status</th><th></th></tr></thead><tbody id="tb">'+rowsC()+'</tbody></table></div>';
}
function vDeals(){
return '<div class="bar"><button class="btn p" data-act="addD">+ Add deal</button></div><div class="kb">'+STAGES.map(function(n,i){
var l=D.deals.filter(function(d){return d.stage===i});
return '<div class="col"><h3>'+n+'<span>'+l.length+'</span></h3>'+l.map(function(d){
return '<div class="dl"><b>'+esc(d.title)+'</b><small>'+esc(d.company)+'</small><div class="v">'+money(d.value)+'</div><div class="a">'+(i>0?'<button class="btn sm" data-act="mv" data-d="-1" data-id="'+d.id+'">←</button>':'')+(i<3?'<button class="btn sm" data-act="mv" data-d="1" data-id="'+d.id+'">→</button>':'')+'<button class="btn sm d" data-act="delD" data-id="'+d.id+'">✕</button></div></div>'}).join('')+'</div>'}).join('')+'</div>';
}
function vTasks(){
return '<div class="bar"><button class="btn p" data-act="addT">+ Add task</button></div><div class="tw">'+(D.tasks.length?D.tasks.map(function(t){
return '<div class="tk'+(t.done?' done':'')+'"><input type="checkbox" data-act="tg" data-id="'+t.id+'"'+(t.done?' checked':'')+'><div>'+esc(t.text)+'<small>Due '+fdate(t.due)+'</small></div><button class="btn sm d" data-act="delT" data-id="'+t.id+'">Delete</button></div>'}).join(''):'<div class="empty">No tasks yet.</div>')+'</div>';
}

/* modal */
function modal(title,fields,cb){
var h='<h3>'+title+'</h3><form id="mf">';
fields.forEach(function(f){h+='<label>'+f.l+(f.t==='select'?'<select name="'+f.k+'">'+f.o.map(function(o){return '<option>'+o+'</option>'}).join('')+'</select>':'<input name="'+f.k+'" type="'+(f.t||'text')+'"'+(f.r?' required':'')+'>')+'</label>'});
h+='<div class="mb"><button type="button" class="btn" data-act="close">Cancel</button><button class="btn p" type="submit">Save</button></div></form>';
$('mbox').innerHTML=h;$('modal').classList.add('open');
var first=$('mf').querySelector('input');if(first)first.focus();
$('mf').onsubmit=function(e){e.preventDefault();var o={},f=this;fields.forEach(function(x){o[x.k]=f.elements[x.k].value.trim()});cb(o);close_();save();render()};
}
function close_(){$('modal').classList.remove('open')}
$('modal').addEventListener('click',function(e){if(e.target===this)close_()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close_()});

/* actions */
document.addEventListener('click',function(e){
var n=e.target.closest('[data-v]');if(n){go(n.getAttribute('data-v'));return}
var b=e.target.closest('[data-act]');if(!b)return;
var a=b.getAttribute('data-act'),id=+b.getAttribute('data-id');
if(a==='logout'){setAuth(false);$('app').hidden=true;$('login').hidden=false;return}
if(a==='close'){close_();return}
if(a==='addC')modal('Add contact',[{k:'name',l:'Full name',r:1},{k:'company',l:'Company'},{k:'email',l:'Email',t:'email'},{k:'phone',l:'Phone'},{k:'status',l:'Status',t:'select',o:['Lead','Prospect','Customer']}],function(o){o.id=nid(D.contacts);D.contacts.push(o)});
if(a==='addD')modal('Add deal',[{k:'title',l:'Deal title',r:1},{k:'company',l:'Company'},{k:'value',l:'Value ($)',t:'number',r:1},{k:'stage',l:'Stage',t:'select',o:STAGES}],function(o){D.deals.push({id:nid(D.deals),title:o.title,company:o.company,value:Number(o.value)||0,stage:Math.max(STAGES.indexOf(o.stage),0)})});
if(a==='addT')modal('Add task',[{k:'text',l:'Task',r:1},{k:'due',l:'Due date',t:'date'}],function(o){D.tasks.unshift({id:nid(D.tasks),text:o.text,due:o.due,done:false})});
if(a==='delC'){D.contacts=D.contacts.filter(function(x){return x.id!==id});save();render()}
if(a==='delD'){D.deals=D.deals.filter(function(x){return x.id!==id});save();render()}
if(a==='delT'){D.tasks=D.tasks.filter(function(x){return x.id!==id});save();render()}
if(a==='mv'){var d=D.deals.filter(function(x){return x.id===id})[0];d.stage=Math.min(3,Math.max(0,d.stage+Number(b.getAttribute('data-d'))));save();render()}
});
document.addEventListener('change',function(e){
var t=e.target;if(t.getAttribute&&t.getAttribute('data-act')==='tg'){var x=D.tasks.filter(function(k){return k.id===+t.getAttribute('data-id')})[0];x.done=t.checked;save();render()}
});
document.addEventListener('input',function(e){if(e.target.id==='q'){q=e.target.value;$('tb').innerHTML=rowsC()}});
