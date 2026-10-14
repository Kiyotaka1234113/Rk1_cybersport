const streams=[
  {id:1,date:'31.08',time:'18:26–21:21',minutes:175,avg:0,peak:2,unique:3,chat:1,views:8,followers:0,clips:0},
  {id:2,date:'06.09',time:'19:15–22:29',minutes:194,avg:1,peak:3,unique:4,chat:0,views:15,followers:0,clips:0},
  {id:3,date:'07.09',time:'21:48–00:53',minutes:185,avg:0,peak:2,unique:3,chat:1,views:8,followers:1,clips:0},
  {id:4,date:'10.09',time:'04:16–06:24',minutes:128,avg:1,peak:3,unique:6,chat:3,views:20,followers:0,clips:0},
  {id:5,date:'13.09',time:'00:47–02:48',minutes:121,avg:1,peak:3,unique:4,chat:2,views:7,followers:1,clips:0},
  {id:6,date:'14.09',time:'23:25–01:08',minutes:103,avg:0,peak:5,unique:8,chat:2,views:14,followers:0,clips:0},
  {id:7,date:'16.09',time:'00:51–03:15',minutes:144,avg:0,peak:3,unique:6,chat:2,views:13,followers:0,clips:0},
  {id:8,date:'25.09',time:'23:50–02:42',minutes:172,avg:1,peak:4,unique:4,chat:2,views:4,followers:0,clips:1},
  {id:9,date:'06.10',time:'23:20–02:08',minutes:168,avg:1,peak:2,unique:8,chat:3,views:16,followers:1,clips:0},
  {id:10,date:'08.10',time:'20:58–00:08',minutes:190,avg:0,peak:1,unique:2,chat:0,views:2,followers:0,clips:0}
];
if(streams.length!==10||streams.reduce((a,s)=>a+s.minutes,0)!==1580||streams.reduce((a,s)=>a+s.views,0)!==107)throw new Error('Stream source data mismatch');
const metrics={views:{label:'ПРОСМОТРЫ ПО ЭФИРАМ',key:'views',unit:'просмотров'},unique:{label:'УНИКАЛЬНЫЕ ЗРИТЕЛИ ПО ЭФИРАМ',key:'unique',unit:'уникальных зрителей'},chat:{label:'УЧАСТНИКИ ЧАТА ПО ЭФИРАМ',key:'chat',unit:'участников чата'},peak:{label:'ПИК ОНЛАЙНА ПО ЭФИРАМ',key:'peak',unit:'зрителей одновременно'},minutes:{label:'ДЛИТЕЛЬНОСТЬ ЭФИРОВ, МИНУТЫ',key:'minutes',unit:'минут в эфире'}};
const chapters=['overview','growth','log','swot','proof'];
let activeMetric='views',activeStream=4,openEpisode=null;
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
const fmtMinutes=n=>`${Math.floor(n/60)} ч ${String(n%60).padStart(2,'0')} м`;

function activateChapter(name,{scroll=true}={}){
  if(!chapters.includes(name))return;
  chapters.forEach((chapter,index)=>{
    const tab=$(`#tab-${chapter}`),panel=$(`#panel-${chapter}`),on=chapter===name;
    tab.classList.toggle('active',on);tab.setAttribute('aria-selected',String(on));tab.tabIndex=on?0:-1;
    panel.hidden=!on;panel.classList.toggle('active',on);
    if(on){panel.querySelectorAll('.reveal').forEach((el,i)=>setTimeout(()=>el.classList.add('visible'),i*45));}
  });
  $('#nav-progress').style.width=`${(chapters.indexOf(name)+1)*20}%`;
  if(scroll)document.querySelector('.chapter-nav').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  if(name==='growth')renderChart();
  if(name==='log')renderEpisodes();
}
$$('.chapter-tab').forEach((button,index)=>{
  button.addEventListener('click',()=>activateChapter(button.dataset.tab));
  button.addEventListener('keydown',event=>{
    const delta=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
    if(!delta)return;event.preventDefault();const next=(index+delta+chapters.length)%chapters.length;activateChapter(chapters[next],{scroll:false});$$('.chapter-tab')[next].focus();
  });
});
$$('[data-go]').forEach(button=>button.addEventListener('click',()=>{
  activateChapter(button.dataset.go);if(button.dataset.episode){openEpisode=Number(button.dataset.episode);renderEpisodes();}
}));
$('#enter-site').addEventListener('click',event=>{event.preventDefault();$('#main').scrollIntoView({behavior:'smooth'});});

function renderChart(){
  const metric=metrics[activeMetric],max=Math.max(...streams.map(s=>s[metric.key]));
  $('#chart-label').textContent=metric.label;
  $('#chart').innerHTML=streams.map(s=>{
    const value=s[metric.key],height=Math.max(4,Math.round(value/max*100));
    return `<button class="bar-wrap ${s.id===activeStream?'selected':''}" data-stream="${s.id}" style="--h:${height}%" aria-label="Эфир ${s.id}, ${s.date}: ${value} ${metric.unit}" aria-pressed="${s.id===activeStream}"><span class="bar-value">${value}</span><span class="bar"></span><span class="bar-name">${s.date}</span></button>`;
  }).join('');
  $$('.bar-wrap').forEach(b=>b.addEventListener('click',()=>{activeStream=Number(b.dataset.stream);renderChart();}));
  const s=streams.find(v=>v.id===activeStream);
  $('#chart-detail').innerHTML=`<strong>EP.${String(s.id).padStart(2,'0')} / ${s.date}.2026</strong><span>${s[metric.key]} ${metric.unit} · ${fmtMinutes(s.minutes)} · ${s.time}</span>`;
}
$$('.metric-button').forEach(button=>button.addEventListener('click',()=>{
  activeMetric=button.dataset.metric;$$('.metric-button').forEach(b=>{const on=b===button;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});renderChart();
}));

function renderEpisodes(){
  const needle=$('#episode-search').value.trim().toLowerCase(),sort=$('#episode-sort').value;
  let found=streams.filter(s=>`${s.date} 2026 ep.${s.id}`.toLowerCase().includes(needle));
  if(sort==='views')found.sort((a,b)=>b.views-a.views);
  if(sort==='peak')found.sort((a,b)=>b.peak-a.peak);
  if(sort==='duration')found.sort((a,b)=>b.minutes-a.minutes);
  $('#episode-list').innerHTML=found.length?found.map(s=>{
    const on=openEpisode===s.id,fields=[['СР. ОНЛАЙН',s.avg],['ПИК',s.peak],['УНИКАЛЬНЫЕ',s.unique],['ЧАТ',s.chat],['ПРОСМОТРЫ',s.views],['ФОЛЛОВЕРЫ',s.followers],['КЛИПЫ',s.clips]];
    return `<article class="episode ${on?'open':''}"><button class="episode-summary" data-episode="${s.id}" aria-expanded="${on}" aria-controls="detail-${s.id}"><span class="episode-number">${String(s.id).padStart(2,'0')}</span><span class="episode-date">${s.date}.2026 <small class="episode-time">${s.time}</small></span><span class="episode-time">${fmtMinutes(s.minutes)}</span><span class="episode-views"><strong>${s.views}</strong> views</span><span class="episode-toggle" aria-hidden="true">+</span></button><div class="episode-detail" id="detail-${s.id}" ${on?'':'hidden'}>${fields.map(([label,value])=>`<div><small>${label}</small><strong>${value}</strong></div>`).join('')}</div></article>`;
  }).join(''):'<p class="no-results">По такой дате эфиров нет. Попробуй формат 10.09.</p>';
  $$('.episode-summary').forEach(button=>button.addEventListener('click',()=>{const id=Number(button.dataset.episode);openEpisode=openEpisode===id?null:id;renderEpisodes();}));
}
$('#episode-search').addEventListener('input',renderEpisodes);
$('#episode-sort').addEventListener('change',renderEpisodes);

const dialog=$('#video-dialog'),player=$('#video-player');
$$('.clip-card').forEach(button=>button.addEventListener('click',()=>{player.src=button.dataset.video;dialog.showModal();player.play().catch(()=>{});}));
function closeVideo(){player.pause();player.removeAttribute('src');player.load();dialog.close();}
$('#video-close').addEventListener('click',closeVideo);
dialog.addEventListener('click',event=>{if(event.target===dialog)closeVideo();});
dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();});

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});
$$('.reveal').forEach(el=>observer.observe(el));
renderChart();renderEpisodes();
