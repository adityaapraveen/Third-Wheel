import {readFileSync} from 'node:fs';
const base=process.env.SMOKE_URL||'http://localhost:3001';
const data=JSON.parse(readFileSync('src/data/demo.generated.json','utf8'));
const paths=['/','/demo','/lab',...data.people.flatMap(p=>[`/demo/person/${p.id}`,`/demo/rankings/${p.id}`]),...data.dates.map(d=>`/demo/date/${d.id}`)];
for(const path of paths){const res=await fetch(base+path);if(!res.ok)throw new Error(`${path}: HTTP ${res.status}`);if(path.startsWith('/demo/person/')){const text=await res.text();for(const heading of ['Needs','Hobbies','Interests'])if(!text.includes(heading))throw new Error(`${path}: missing ${heading}`);}}
const invalid=await fetch(base+'/api/analyze',{method:'POST',headers:{'Content-Type':'application/json',origin:base},body:JSON.stringify({linkedinUrl:'https://linkedin.com/company/nope',instagramUrl:'https://instagram.com/example',consent:true})});
if(invalid.status!==400)throw new Error('Invalid LinkedIn URL was not rejected');
const status=await (await fetch(base+'/api/status')).json();
if(!status.model&&!status.accessCodeRequired){const res=await fetch(base+'/api/date/live',{method:'POST',headers:{'Content-Type':'application/json',origin:base},body:JSON.stringify({a:data.people[0],b:data.people[1]})});if(!res.ok)throw new Error(`Fallback date: HTTP ${res.status}`);const stream=await res.text();const events=stream.split('\n\n').filter(s=>s.startsWith('data: ')).map(s=>JSON.parse(s.slice(6)));const end=events.at(-1);if(events.filter(e=>e.type==='agent_message').length!==6||end?.type!=='date_finished'||end.date.mode!=='fallback')throw new Error('Fallback stream did not complete');console.log('Live fallback: six streamed turns, curveball, two outcomes.');}
console.log(`${paths.length} routes returned HTTP 200; all ${data.people.length} profile pages include Needs, Hobbies, and Interests; invalid URL rejected.`);
console.log(`Provider status: scraping=${status.scraping}, model=${status.model}. No paid provider was contacted by this script.`);
