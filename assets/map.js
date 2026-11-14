/* 24/38 — interactive branch map, no API key, OpenStreetMap/Leaflet. */
(() => {
  'use strict';
  const branches = [
    {
      label: 'ФИЛИАЛ № 1',
      title: 'УЛ. ВЫСОТНАЯ, 2, СТР. 2',
      phone: '+7 (913) 559-77-70',
      tel: 'tel:+79135597770',
      lat: 56.024788,
      lng: 92.784515,
      zoom: 15,
      directions: 'https://2gis.ru/krasnoyarsk/search/' + encodeURIComponent('Красноярск Высотная улица 2 строение 2'),
      accuracy: 'Маркер показывает район дома 2. Точная позиция строения 2 на карте пока не подтверждена.'
    },
    {
      label: 'ФИЛИАЛ № 2',
      title: 'УЛ. АЛЕКСЕЕВА, 13',
      phone: '+7 (913) 030-22-24',
      tel: 'tel:+79130302224',
      lat: 56.052572,
      lng: 92.922937,
      zoom: 16,
      directions: 'https://2gis.ru/krasnoyarsk/search/' + encodeURIComponent('Красноярск Алексеева 13'),
      accuracy: 'Адрес Алексеева, 13 нанесён по координатам здания. Сверьте вход и часы работы перед поездкой.'
    }
  ];
  document.querySelectorAll('[data-branch-map]').forEach(widget => {
    const area = widget.querySelector('[data-map-canvas]');
    const tabs = [...widget.querySelectorAll('[data-map-location]')];
    const label = widget.querySelector('[data-map-label]');
    const title = widget.querySelector('[data-map-address]');
    const phone = widget.querySelector('[data-map-phone]');
    const accuracy = widget.querySelector('[data-map-accuracy]');
    const route = widget.querySelector('[data-map-directions]');
    const call = widget.querySelector('[data-map-call]');
    let map = null, markers = [];
    const setActive = (idx, center = true) => {
      const b = branches[idx];
      if (!b) return;
      tabs.forEach((tab, i) => {
        const active = i === idx;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-pressed', String(active));
      });
      if (label) label.textContent = b.label;
      if (title) title.textContent = b.title;
      if (phone) { phone.href = b.tel; phone.textContent = b.phone; }
      if (accuracy) accuracy.textContent = b.accuracy;
      if (route) route.href = b.directions;
      if (call) call.href = b.tel;
      markers.forEach((m, i) => m.getElement()?.classList.toggle('selected', i === idx));
      if (map && center) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          map.setView([b.lat, b.lng], b.zoom, {animate:false});
        } else {
          map.flyTo([b.lat, b.lng], b.zoom, {duration:.85});
        }
        markers[idx]?.openPopup();
      }
    };
    tabs.forEach(tab => tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.mapLocation);
      setActive(idx);
    }));
    if (typeof window.L === 'undefined' || !area) {
      area?.classList.add('map-unavailable');
      return; // visible address and 2GIS links remain usable
    }
    try {
      const L = window.L;
      area.innerHTML = '';
      map = L.map(area, {scrollWheelZoom:false, zoomControl:false, preferCanvas:true});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,
        attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      }).addTo(map);
      L.control.zoom({position:'bottomleft'}).addTo(map);
      markers = branches.map((b,i) => {
        const marker = L.marker([b.lat,b.lng], {
          icon:L.divIcon({
            className:'branch-map-pin',
            html:'<span>' + String(i + 1).padStart(2,'0') + '</span>',
            iconSize:[44,51],iconAnchor:[22,48],popupAnchor:[0,-43]
          })
        }).addTo(map);
        const popup = document.createElement('div');
        const strong = document.createElement('strong');
        strong.textContent = b.label + ' — ' + b.title;
        const small = document.createElement('small');
        small.textContent = b.phone;
        const a = document.createElement('a');
        a.href = b.directions;
        a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = 'Маршрут в 2ГИС ↗';
        popup.append(strong,document.createElement('br'),small,document.createElement('br'),a);
        marker.bindPopup(popup,{closeButton:false});
        marker.on('click', () => setActive(i,false));
        return marker;
      });
      map.fitBounds(L.latLngBounds(branches.map(b=>[b.lat,b.lng])), {padding:[48,48], maxZoom:13,animate:false});
      setActive(0,false);
      if (window.ResizeObserver) {
        const resize = new ResizeObserver(() => map.invalidateSize({pan:false}));
        resize.observe(area);
      }
      window.addEventListener('load',() => map.invalidateSize({pan:false}),{once:true});
    } catch (e) {
      if (map) {try{map.remove();}catch(_){}}
      area.innerHTML='<div class="map-fallback"><span>КАРТА ВРЕМЕННО НЕДОСТУПНА</span><p>Для поиска и маршрута используйте кнопки 2ГИС рядом с адресом.</p></div>';
    }
  });
})();