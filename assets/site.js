(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  // A subtle pointer-driven 3D tilt complements the CSS light sweep.
  // Disabled on touch screens and for reduced-motion accessibility settings.
  const hero = $('.hero');
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (hero && !reduceMotion && window.matchMedia?.('(hover:hover) and (pointer:fine)').matches) {
    let queued = false;
    let px = 0, py = 0;
    hero.addEventListener('pointermove', event => {
      const bounds = hero.getBoundingClientRect();
      px = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      py = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        hero.style.setProperty('--car-y', `${(px * 2.3).toFixed(2)}deg`);
        hero.style.setProperty('--car-x', `${(-py * 1.3).toFixed(2)}deg`);
        queued = false;
      });
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--car-y','0deg');
      hero.style.setProperty('--car-x','0deg');
    });
  }
  const KEY = 'twentyfour38-selected-films';
  let selections = [];
  try { selections = JSON.parse(localStorage.getItem(KEY) || '[]'); if (!Array.isArray(selections)) selections = []; } catch (_) {}
  const persist = () => { try { localStorage.setItem(KEY,JSON.stringify(selections)); } catch (_) {} };
  const count = () => $$('.basket-count').forEach(x=>x.textContent=selections.length);
  count();
  const nav = $('#primary-nav');
  $('.menu-toggle')?.addEventListener('click',e=>{
    const open = nav.classList.toggle('show');
    e.currentTarget.setAttribute('aria-expanded',String(open));
  });
  nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('show')));
  const modalBack = $('#request-modal');
  const close = () => { modalBack?.classList.remove('open'); document.body.classList.remove('modal-open'); };
  const open = (target='') => {
    if(!modalBack) return;
    $('#modal-subject').value = target;
    $('#modal-feedback').textContent='';
    modalBack.classList.add('open'); document.body.classList.add('modal-open');
    setTimeout(()=>$('#modal-name')?.focus(),40);
  };
  $$('[data-request]').forEach(el=>el.addEventListener('click',()=>open(el.dataset.request || 'Консультация')));
  $$('.modal-close, [data-close-modal]').forEach(el=>el.addEventListener('click',close));
  modalBack?.addEventListener('click',e=>{if(e.target===modalBack)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  $$('.mini-add').forEach(el=>el.addEventListener('click',e=>{
    e.stopPropagation();
    const item = el.dataset.film;
    if(!item)return;
    if(!selections.includes(item)){ selections.push(item); persist(); count(); }
    el.textContent='Добавлено ✓';
    setTimeout(()=>el.textContent='В подборку +',1800);
  }));
  const basketModal = $('#basket-modal');
  const renderBasket = () => {
    if(!basketModal) return;
    const l=$('#basket-list');
    l.innerHTML='';
    if(!selections.length){l.innerHTML='<li>В подборке пока нет материалов</li>';return;}
    selections.forEach((name,i)=>{
      const li=document.createElement('li');
      const text=document.createElement('span');text.textContent=name;
      const remove=document.createElement('button');remove.type='button';remove.textContent='Убрать';
      remove.addEventListener('click',()=>{selections.splice(i,1);persist();count();renderBasket()});
      li.append(text,remove);l.appendChild(li);
    });
  };
  $$('[data-basket-open]').forEach(el=>el.addEventListener('click',()=>{
    renderBasket();basketModal?.classList.add('open');document.body.classList.add('modal-open');
  }));
  $$('.basket-close').forEach(el=>el.addEventListener('click',()=>{basketModal?.classList.remove('open');document.body.classList.remove('modal-open')}));
  basketModal?.addEventListener('click',e=>{if(e.target===basketModal){basketModal.classList.remove('open');document.body.classList.remove('modal-open')}});
  $('#basket-request')?.addEventListener('click',()=>{
    basketModal.classList.remove('open');
    open('Материалы: '+(selections.join(', ')||'подбор плёнок'));
  });
  const filters=$$('[data-category]');const cards=$$('.shop-grid [data-type]');
  let active='Все';
  const filtering=()=>{
    const q=($('#shop-search')?.value||'').trim().toLowerCase();
    let shown=0;
    cards.forEach(card=>{
      const ok=(active==='Все'||card.dataset.type===active) && card.textContent.toLowerCase().includes(q);
      card.classList.toggle('hidden',!ok); if(ok)shown++;
    });
    if($('#shop-count')) $('#shop-count').textContent=`Найдено вариантов: ${shown}`;
    $('#shop-empty')?.style.setProperty('display',shown?'none':'block');
  };
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');active=btn.dataset.category;filtering();
  }));
  $('#shop-search')?.addEventListener('input',filtering);
  filtering();
  const buildText=()=>{
    const name=$('#modal-name').value.trim();
    const contact=$('#modal-contact').value.trim();
    const subject=$('#modal-subject').value.trim();
    const note=$('#modal-notes').value.trim();
    if(!name||!contact){$('#modal-feedback').textContent='Укажите имя и контакт для связи.';return null;}
    return ['Заявка для 24-38','Имя: '+name,'Контакт: '+contact,'Интересует: '+(subject||'Консультация'),'Комментарий: '+(note||'—'),'','Демоверсия сайта. Заявка скопирована пользователем, но не передана студии.'].join('\n');
  };
  $('#copy-request')?.addEventListener('click',async()=>{
    const str=buildText();if(!str)return;
    try{await navigator.clipboard.writeText(str);$('#modal-feedback').textContent='Текст заявки скопирован. Для отправки потребуется контакт студии.';}
    catch(_){$('#modal-feedback').textContent='Не удалось скопировать автоматически — воспользуйтесь скачиванием.';}
  });
  $('#download-request')?.addEventListener('click',()=>{
    const str=buildText();if(!str)return;
    const a=document.createElement('a');const blob=new Blob([str],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);a.href=url;a.download='zayavka-24-38.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    $('#modal-feedback').textContent='Файл заявки сохранён на ваше устройство. На сервер данные не отправлялись.';
  });
})();
