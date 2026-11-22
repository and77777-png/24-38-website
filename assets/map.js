/* 24/38 — responsive map without Leaflet / external CSS dependencies.
   Only the OSM iframe loads external content. Addresses and route links remain
   available if the embedded map does not load. */
(() => {
  "use strict";
  const sites = [
    {
      label:"ФИЛИАЛ № 1",
      title:"УЛ. АЛЕКСЕЕВА, 13",
      iframeTitle:"Карта: Алексеева, 13, Красноярск",
      phone:"+7 (913) 030-22-24",
      tel:"tel:+79130302224",
      point:[56.052572,92.922937],
      bounds:[92.908,56.044,92.938,56.061],
      directions:"https://2gis.ru/krasnoyarsk/search/"+encodeURIComponent("Красноярск, Алексеева, 13"),
      accuracy:"Для точного входа и режима работы уточняйте сведения у филиала."
    },
    {
      label:"ФИЛИАЛ № 2",
      title:"УЛ. ВЫСОТНАЯ, 2, СТР. 2",
      iframeTitle:"Карта: Высотная, 2, строение 2, Красноярск",
      phone:"+7 (913) 559-77-70",
      tel:"tel:+79135597770",
      point:[56.024788,92.784515],
      bounds:[92.770,56.016,92.799,56.034],
      directions:"https://2gis.ru/krasnoyarsk/search/"+encodeURIComponent("Красноярск, Высотная, 2, строение 2"),
      accuracy:"Положение маркера ориентировочное: точная точка строения 2 ещё не подтверждена. Открывайте маршрут по полному адресу."
    }
  ];
  function osmUrl(site){
    const coords=site.bounds.join(",");
    return "https://www.openstreetmap.org/export/embed.html?bbox="+encodeURIComponent(coords)+"&layer=mapnik&marker="+encodeURIComponent(site.point.join(","));
  }
  document.querySelectorAll("[data-branch-map]").forEach(widget => {
    const frame=widget.querySelector("[data-map-frame]");
    const tabs=[...widget.querySelectorAll("[data-map-location]")];
    const nodes={
      label:widget.querySelector("[data-map-label]"),
      address:widget.querySelector("[data-map-address]"),
      phone:widget.querySelector("[data-map-phone]"),
      accuracy:widget.querySelector("[data-map-accuracy]"),
      directions:widget.querySelector("[data-map-directions]"),
      call:widget.querySelector("[data-map-call]"),
      external:widget.querySelector("[data-map-external]")
    };
    if (!frame) return;
    let current=-1;
    function show(index){
      if(!Number.isInteger(index)||index<0||index>=sites.length)return;
      const site=sites[index]; current=index;
      tabs.forEach((tab,i)=>{
        tab.classList.toggle("active",i===index);
        tab.setAttribute("aria-pressed",String(i===index));
      });
      if(nodes.label)nodes.label.textContent=site.label;
      if(nodes.address)nodes.address.textContent=site.title;
      if(nodes.phone){nodes.phone.textContent=site.phone;nodes.phone.href=site.tel;}
      if(nodes.accuracy)nodes.accuracy.textContent=site.accuracy;
      if(nodes.directions)nodes.directions.href=site.directions;
      if(nodes.external)nodes.external.href=site.directions;
      if(nodes.call)nodes.call.href=site.tel;
      frame.title=site.iframeTitle;
      const url=osmUrl(site);
      if(frame.getAttribute("src")!==url)frame.setAttribute("src",url);
    }
    tabs.forEach(tab=>tab.addEventListener("click",()=>show(Number(tab.dataset.mapLocation))));
    show(0);
  });
})();