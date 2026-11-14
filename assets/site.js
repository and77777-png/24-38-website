(()=>{
  const $=(sel)=>document.querySelector(sel), $$=(sel)=>[...document.querySelectorAll(sel)];
  const nav=$('#primary-nav'), toggle=$('.menu-toggle');
  const menuClose=()=>{nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false')};
  toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',menuClose));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){menuClose();closeModal()}});
  const modal=$('#contact-modal'),area=$('#contact-text'),status=$('#copy-result');let lastFocused=null;
  function openModal(subject='Консультация'){
    if(!modal)return;
    lastFocused=document.activeElement;modal.classList.add('open');document.body.classList.add('is-locked');
    area.value=subject==='Консультация'?'':`Интересует: ${subject}.\nАвтомобиль: `;
    status.textContent='';modal.querySelector('.modal-close')?.focus();
  }
  function closeModal(){if(!modal?.classList.contains('open'))return;modal.classList.remove('open');document.body.classList.remove('is-locked');lastFocused?.focus?.()}
  $$('[data-contact]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();openModal(el.getAttribute('data-contact')||'Консультация')}));
  $$('[data-close]').forEach(el=>el.addEventListener('click',closeModal));
  modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  $('#copy-request')?.addEventListener('click',async()=>{
    const txt=`Обращение в 24/38\n${area.value.trim()||'Здравствуйте! Хочу обсудить услугу.'}`;
    try{await navigator.clipboard.writeText(txt);status.textContent='Текст скопирован. Позвоните в выбранный филиал.'}
    catch(err){status.textContent='Копирование не удалось. Выделите текст вручную.'}
  });
  let active='Все'; const shopCards=$$('#shop-grid .film'); const filters=$$('[data-filter]'); const search=$('#shop-search');
  const render=()=>{
    const q=(search?.value||'').trim().toLocaleLowerCase('ru');let count=0;
    shopCards.forEach(card=>{const ok=(active==='Все'||card.dataset.category===active)&&(!q||card.dataset.search.includes(q));card.hidden=!ok;if(ok)count++});
    $('#shop-status')&&( $('#shop-status').textContent=`${count} вариантов материала · Цены по запросу`);
    $('#empty-results')?.classList.toggle('show',count===0);
  };
  filters.forEach(f=>f.addEventListener('click',()=>{active=f.dataset.filter;filters.forEach(x=>x.classList.toggle('active',x===f));render()}));
  search?.addEventListener('input',render);
})();
