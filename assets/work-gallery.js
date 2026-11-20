/* Photo gallery, keyboard and touch friendly; independent of main site JS. */
(()=>{
const buttons=[...document.querySelectorAll('[data-work-filter]')];
const cards=[...document.querySelectorAll('.works-card')];
if(!cards.length)return;
buttons.forEach(button=>button.addEventListener('click',()=>{
 const category=button.dataset.workFilter;
 buttons.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 cards.forEach(card=>{card.hidden=category!=='all'&&card.dataset.workCategory!==category});
}));
const backdrop=document.createElement('div');backdrop.className='works-lightbox';backdrop.hidden=true;backdrop.setAttribute('role','dialog');backdrop.setAttribute('aria-modal','true');backdrop.setAttribute('aria-label','Фотография работы');
backdrop.innerHTML='<button type="button" class="works-close" aria-label="Закрыть фотографию">×</button><figure class="works-lightbox-figure"><img alt=""><figcaption></figcaption></figure>';
document.body.append(backdrop);
const img=backdrop.querySelector('img'),caption=backdrop.querySelector('figcaption'),close=backdrop.querySelector('.works-close');let opener=null;
function hide(){backdrop.hidden=true;document.body.style.overflow='';opener?.focus()}
function show(button){opener=button;const card=button.closest('.works-card'),thumb=button.querySelector('img');img.src=thumb.getAttribute('src');img.alt=thumb.alt;caption.textContent=card.querySelector('h3').textContent;backdrop.hidden=false;document.body.style.overflow='hidden';close.focus()}
document.querySelectorAll('[data-work-open]').forEach(b=>b.addEventListener('click',()=>show(b)));
close.addEventListener('click',hide);backdrop.addEventListener('click',e=>{if(e.target===backdrop)hide()});
document.addEventListener('keydown',e=>{
 if(backdrop.hidden)return;
 if(e.key==='Escape'){e.preventDefault();hide()}
 else if(e.key==='Tab'){e.preventDefault();close.focus()}
});
})();