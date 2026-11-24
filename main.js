document.getElementById('yr').textContent=new Date().getFullYear();

// HEADER shadow
window.addEventListener('scroll',()=>{
  document.getElementById('hdr').style.boxShadow=scrollY>60?'0 2px 24px rgba(0,0,0,.4)':'none';
  document.getElementById('totop').classList.toggle('show',scrollY>400);
});
document.getElementById('totop').addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

// Show the side widget on mobile after the quiz section has been passed.
const quizSection=document.getElementById('quiz');
const sideWidget=document.querySelector('.rwidget');
if(quizSection&&sideWidget){
  const mobileWidgetObserver=new IntersectionObserver(([entry])=>{
    sideWidget.classList.toggle('is-visible',!entry.isIntersecting&&entry.boundingClientRect.bottom<=0);
  });
  mobileWidgetObserver.observe(quizSection);
}

// BURGER
const burger=document.getElementById('burger'),drawer=document.getElementById('drawer'),dov=document.getElementById('doverlay');
function toggleDrawer(){burger.classList.toggle('open');drawer.classList.toggle('open');dov.classList.toggle('open');document.body.style.overflow=drawer.classList.contains('open')?'hidden':'';}
burger.addEventListener('click',toggleDrawer);
dov.addEventListener('click',toggleDrawer);
document.getElementById('drawerClose').addEventListener('click',toggleDrawer);
drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{if(drawer.classList.contains('open'))toggleDrawer();}));

// FADE IN
new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');} });},{threshold:.12}).observe||null;
const io=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');}});},{threshold:.12});
document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',function(e){
  const id=this.getAttribute('href').slice(1);if(!id)return;
  const el=document.getElementById(id);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'});}
}));

// POLICY CHECKS — pre-checked
document.querySelectorAll('.pcheck').forEach(ch=>{
  ch.addEventListener('click',()=>ch.classList.toggle('off'));
});

// QUIZ
let step=1;
const total=5;
function goStep(n){
  document.querySelectorAll('.quiz-step').forEach(s=>s.classList.remove('active'));
  const target=document.getElementById('qs'+n);
  if(target){target.classList.add('active');}
  document.getElementById('qfinal').style.display='none';
  step=n;
  document.getElementById('qNum').textContent=n;
  document.getElementById('qBar').style.width=(n/total*100)+'%';
}
function nextStep(from){
  if(from===1){
    const sel=document.querySelector('#qs1 .quiz-card.sel');
    if(!sel)return;
  } else {
    const sel=document.querySelector('#qs'+from+' .quiz-opt.sel');
    if(!sel&&from!==2)return;
  }
  if(from<total){goStep(from+1);}
  else{
    document.querySelectorAll('.quiz-step').forEach(s=>s.classList.remove('active'));
    document.getElementById('qfinal').style.display='block';
    document.getElementById('qBar').style.width='100%';
  }
}
for(let i=1;i<=total;i++){const b=document.getElementById('qnext'+i);if(b)b.addEventListener('click',()=>nextStep(i));}
document.querySelectorAll('.quiz-back-btn').forEach(b=>{b.addEventListener('click',()=>{const g=parseInt(b.dataset.go);goStep(g);});});
// Card options
document.querySelectorAll('.quiz-card').forEach(c=>{c.addEventListener('click',function(){this.closest('.quiz-cards').querySelectorAll('.quiz-card').forEach(x=>x.classList.remove('sel'));this.classList.add('sel');});});
// Text options
document.querySelectorAll('.quiz-opt').forEach(o=>{o.addEventListener('click',function(){this.closest('.quiz-opts').querySelectorAll('.quiz-opt').forEach(x=>x.classList.remove('sel'));this.classList.add('sel');});});
// Slider
const slider=document.getElementById('areaSlider'),valEl=document.getElementById('sliderVal');
function updateSlider(){
  const v=slider.value,mn=slider.min,mx=slider.max;
  valEl.innerHTML=v+' <span>м²</span>';
  const pct=(v-mn)/(mx-mn)*100;
  slider.style.background=`linear-gradient(to right,var(--gold) 0%,var(--gold) ${pct}%,#e0e0e0 ${pct}%,#e0e0e0 100%)`;
}
slider.addEventListener('input',updateSlider);updateSlider();
// Lead form validation and Telegram handoff
function getFormStatus(form){
  let status=form.querySelector('.form-status');
  if(!status){
    status=document.createElement('p');
    status.className='form-status';
    status.setAttribute('role','status');
    status.setAttribute('aria-live','polite');
    form.append(status);
  }
  return status;
}
function openTelegramDraft(lines){
  const message=lines.filter(Boolean).join('\n');
  const url='https://t.me/OzkaraM?text='+encodeURIComponent(message);
  window.open(url,'_blank','noopener,noreferrer');
}
function validateLead(fields,policyId,status){
  status.textContent='';
  let valid=true;
  fields.forEach(({input,label,check})=>{
    const value=input.value.trim();
    const ok=check(value);
    input.setAttribute('aria-invalid',String(!ok));
    if(!ok){
      status.textContent=label==='Ім’я'?'Вкажіть ім’я.':'Вкажіть коректний номер телефону.';
      if(valid)input.focus();
      valid=false;
    }
  });
  const policy=document.getElementById(policyId);
  if(!policy||policy.classList.contains('off')){
    status.textContent='Підтвердьте згоду з політикою конфіденційності.';
    valid=false;
  }
  return valid;
}
const validName=value=>value.length>0;
const validPhone=value=>/^[+\d\s().-]+$/.test(value)&&value.replace(/\D/g,'').length>=10&&value.replace(/\D/g,'').length<=15;

document.getElementById('qsubmit').addEventListener('click',()=>{
  const form=document.getElementById('qfinal');
  const status=getFormStatus(form);
  const name=document.getElementById('quizName');
  const phone=document.getElementById('quizPhone');
  if(!validateLead([{input:name,label:'Ім’я',check:validName},{input:phone,label:'Телефон',check:validPhone}],'qpol',status))return;
  const answers=[...document.querySelectorAll('.quiz-step')].map((step,index)=>{
    const selected=step.querySelector('.quiz-card.sel, .quiz-opt.sel');
    return selected?`Крок ${index+1}: ${selected.textContent.trim()}`:'';
  }).filter(Boolean);
  const slider=document.getElementById('areaSlider');
  if(slider)answers.push(`Площа: ${slider.value} м²`);
  openTelegramDraft(['Заявка з сайту CleanHome — розрахунок',`Ім’я: ${name.value.trim()}`,`Телефон: ${phone.value.trim()}`,...answers]);
  status.textContent='Telegram відкриє підготовлене повідомлення. Натисніть «Надіслати», щоб передати заявку.';
});

document.getElementById('callBtn').addEventListener('click',()=>{
  const form=document.getElementById('callForm');
  const status=getFormStatus(form);
  const name=document.getElementById('callName');
  const phone=document.getElementById('callPhone');
  if(!validateLead([{input:name,label:'Ім’я',check:validName},{input:phone,label:'Телефон',check:validPhone}],'cpol',status))return;
  const comment=document.getElementById('callComment').value.trim();
  openTelegramDraft(['Заявка з сайту CleanHome — замовлення прибирання',`Ім’я: ${name.value.trim()}`,`Телефон: ${phone.value.trim()}`,comment?`Коментар: ${comment}`:'']);
  status.textContent='Telegram відкриє підготовлене повідомлення. Натисніть «Надіслати», щоб передати заявку.';
});

// FAQ
document.querySelectorAll('.faq-item').forEach(item=>{item.querySelector('.faq-q').addEventListener('click',()=>{const was=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));if(!was)item.classList.add('open');});});

// MODAL
function openModal(){document.getElementById('modal').classList.add('open');document.body.style.overflow='hidden';}
function closeModal(){document.getElementById('modal').classList.remove('open');document.body.style.overflow='';}
document.getElementById('modal').addEventListener('click',function(e){if(e.target===this)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

// COMPARE
const wrap=document.getElementById('cmpWrap'),after=document.getElementById('cmpAfter'),handle=document.getElementById('cmpHandle');
let drag=false;
function setPos(x){const r=wrap.getBoundingClientRect();let p=Math.max(5,Math.min(95,(x-r.left)/r.width*100));after.style.clipPath=`inset(0 ${100-p}% 0 0)`;handle.style.left=p+'%';}
handle.addEventListener('mousedown',()=>drag=true);
document.addEventListener('mouseup',()=>drag=false);
document.addEventListener('mousemove',e=>{if(drag)setPos(e.clientX);});
handle.addEventListener('touchstart',e=>{drag=true;e.preventDefault();},{passive:false});
document.addEventListener('touchend',()=>drag=false);
document.addEventListener('touchmove',e=>{if(drag)setPos(e.touches[0].clientX);},{passive:true});
