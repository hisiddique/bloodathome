import{a as C,j as d,c as P}from"./app-Bmo3up5q.js";import{r as a}from"./stripe-DEhpSmJl.js";import{u as I}from"./use-google-maps-Jf974WU7.js";import{c as E}from"./createLucideIcon-DVqpq5-V.js";import{S as $}from"./settings-B1xDw0BD.js";import{g as B,r as O}from"./mapbox-fioGkFd4.js";/* empty css            */import"./google-maps-B08IT9Vv.js";function G({type:o,imageUrl:t,showImage:i,isSelected:n}){const l=document.createElement("div");l.className=`relative flex items-center justify-center transition-all ${n?"scale-125":"scale-100"}`;let c="",u="",f="";switch(o){case"phlebotomist":u=n?"bg-teal-600":"bg-teal-500",f="border-teal-700",c=`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m18 2 4 4"/>
                    <path d="m17 7 3-3"/>
                    <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
                    <path d="m9 11 4 4"/>
                    <path d="m5 19-3 3"/>
                    <path d="m14 4 6 6"/>
                </svg>
            `;break;case"clinic":u=n?"bg-blue-600":"bg-blue-500",f="border-blue-700",c=`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                    <path d="M9 22v-4h6v4"/>
                    <path d="M8 6h.01"/>
                    <path d="M16 6h.01"/>
                    <path d="M12 6h.01"/>
                    <path d="M12 10h.01"/>
                    <path d="M12 14h.01"/>
                    <path d="M16 10h.01"/>
                    <path d="M16 14h.01"/>
                    <path d="M8 10h.01"/>
                    <path d="M8 14h.01"/>
                </svg>
            `;break;case"user":u="bg-red-500",f="border-red-700",c=`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            `;break}return l.innerHTML=`
        <div class="relative">
            <div class="${u} ${f} border-2 rounded-full p-1 shadow-lg ${n?"shadow-xl":""}">
                ${c}
            </div>
            ${i&&t?`
                <div class="absolute inset-0 flex items-center justify-center">
                    <img
                        src="${t}"
                        alt="Provider"
                        class="w-6 h-6 rounded-full border-2 border-white shadow-md object-cover"
                    />
                </div>
            `:""}
        </div>
    `,l}function S({center:o,zoom:t=13,markers:i=[],onMarkerClick:n,selectedMarkerId:l,showUserLocation:c=!1,radiusKm:u,className:f}){const{googleMapsKey:m}=C().props,{isLoaded:s,loadError:x,google:p}=I(m),v=a.useRef(null),g=a.useRef(null),w=a.useRef([]),e=a.useRef(null),h=a.useRef(null),[b,L]=a.useState(!1);return a.useEffect(()=>{if(!(!s||!p||!v.current||g.current))try{g.current=new p.maps.Map(v.current,{center:o,zoom:t,mapId:"BLOODATHOME_MAP",disableDefaultUI:!1,zoomControl:!0,mapTypeControl:!1,streetViewControl:!1,fullscreenControl:!0}),e.current=new p.maps.InfoWindow,L(!1)}catch(r){console.error("Error initializing map:",r),L(!0)}},[s,p,o,t]),a.useEffect(()=>{g.current&&(g.current.setCenter(o),g.current.setZoom(t))},[o,t]),a.useEffect(()=>{if(!g.current||!p||!u){h.current&&(h.current.setMap(null),h.current=null);return}h.current&&h.current.setMap(null),h.current=new p.maps.Circle({strokeColor:"#3b82f6",strokeOpacity:.8,strokeWeight:2,fillColor:"#3b82f6",fillOpacity:.15,map:g.current,center:o,radius:u*1e3})},[p,o,u]),a.useEffect(()=>{!g.current||!p||!s||(w.current.forEach(r=>{r.map=null}),w.current=[],i.forEach(r=>{try{const N=r.id===l,R=G({type:r.type,imageUrl:r.imageUrl,showImage:r.showImage,isSelected:N}),y=new p.maps.marker.AdvancedMarkerElement({map:g.current,position:r.position,content:R,title:r.title});n&&y.addListener("click",()=>{n(r)}),(r.title||r.price!==void 0||r.rating!==void 0)&&(y.addListener("mouseenter",()=>{if(!e.current)return;let M='<div class="p-2 font-sans">';r.title&&(M+=`<div class="font-semibold text-sm mb-1">${r.title}</div>`),(r.price!==void 0||r.rating!==void 0)&&(M+='<div class="flex gap-2 text-xs">',r.price!==void 0&&(M+=`<span class="text-green-600 font-medium">£${r.price}</span>`),r.rating!==void 0&&(M+=`<span class="text-amber-500">★ ${r.rating}</span>`),M+="</div>"),M+="</div>",e.current.setContent(M),e.current.open(g.current,y)}),y.addListener("mouseleave",()=>{e.current&&e.current.close()})),w.current.push(y)}catch(N){console.error("Error creating marker:",N)}}))},[p,s,i,n,l,c]),a.useEffect(()=>()=>{w.current.forEach(r=>{r.map=null}),h.current&&h.current.setMap(null)},[]),x||b||!m?d.jsxs("div",{className:E("relative w-full h-64 md:h-96 bg-muted rounded-2xl flex flex-col items-center justify-center p-6",f),children:[d.jsx("div",{className:"absolute inset-0 opacity-20",children:d.jsx("div",{className:"w-full h-full bg-gradient-to-br from-muted to-border rounded-2xl"})}),d.jsxs("div",{className:"relative z-10 text-center space-y-2",children:[d.jsx($,{className:"w-10 h-10 text-muted-foreground mx-auto"}),d.jsx("p",{className:"text-sm text-muted-foreground",children:m?"Map unavailable - Please check configuration":"Google Maps API key not configured"})]})]}):s?d.jsx("div",{className:E("relative w-full h-64 md:h-96 rounded-2xl overflow-hidden border border-border",f),children:d.jsx("div",{ref:v,className:"absolute inset-0"})}):d.jsx("div",{className:E("relative w-full h-64 md:h-96 bg-muted rounded-2xl flex items-center justify-center",f),children:d.jsxs("div",{className:"flex flex-col items-center gap-2",children:[d.jsx("div",{className:"w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"}),d.jsx("p",{className:"text-sm text-muted-foreground",children:"Loading map..."})]})})}var T=O();const j=B(T);function _(o,t){const i=document.createElement("div");i.className=`mapbox-marker relative flex items-center justify-center transition-all cursor-pointer ${t?"scale-125":"scale-100"}`;let n="",l="",c="";switch(o.type){case"phlebotomist":l=t?"bg-teal-600":"bg-teal-500",c="border-teal-700",n=`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m18 2 4 4"/>
                    <path d="m17 7 3-3"/>
                    <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
                    <path d="m9 11 4 4"/>
                    <path d="m5 19-3 3"/>
                    <path d="m14 4 6 6"/>
                </svg>
            `;break;case"clinic":l=t?"bg-blue-600":"bg-blue-500",c="border-blue-700",n=`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                    <path d="M9 22v-4h6v4"/>
                    <path d="M8 6h.01"/>
                    <path d="M16 6h.01"/>
                    <path d="M12 6h.01"/>
                    <path d="M12 10h.01"/>
                    <path d="M12 14h.01"/>
                    <path d="M16 10h.01"/>
                    <path d="M16 14h.01"/>
                    <path d="M8 10h.01"/>
                    <path d="M8 14h.01"/>
                </svg>
            `;break;case"user":l="bg-red-500",c="border-red-700",n=`
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            `;break}return i.innerHTML=`
        <div class="relative">
            <div class="${l} ${c} border-2 rounded-full p-1 shadow-lg ${t?"shadow-xl":""}">
                ${n}
            </div>
            ${o.showImage&&o.imageUrl?`
                <div class="absolute inset-0 flex items-center justify-center">
                    <img
                        src="${o.imageUrl}"
                        alt="Provider"
                        class="w-6 h-6 rounded-full border-2 border-white shadow-md object-cover"
                    />
                </div>
            `:""}
        </div>
    `,i}function A({center:o,zoom:t=13,markers:i=[],onMarkerClick:n,selectedMarkerId:l,radiusKm:c,className:u,mapboxToken:f}){const m=a.useRef(null),s=a.useRef(null),x=a.useRef([]),p=a.useRef(null),v="radius-circle",[g,w]=a.useState(!1);return a.useEffect(()=>{if(!(!f||!m.current||s.current)){try{j.accessToken=f,s.current=new j.Map({container:m.current,style:"mapbox://styles/mapbox/streets-v12",center:[o.lng,o.lat],zoom:t}),s.current.addControl(new j.NavigationControl),p.current=new j.Popup({closeButton:!1,closeOnClick:!1,offset:25}),w(!1)}catch(e){console.error("Error initializing Mapbox:",e),w(!0)}return()=>{s.current&&(s.current.remove(),s.current=null)}}},[f]),a.useEffect(()=>{s.current&&(s.current.setCenter([o.lng,o.lat]),s.current.setZoom(t))},[o,t]),a.useEffect(()=>{if(!s.current)return;const e=s.current;e.isStyleLoaded()?h():e.once("load",()=>{h()});function h(){if(!e||!s.current||(e.getLayer(v)&&e.removeLayer(v),e.getSource(v)&&e.removeSource(v),!c))return;const b=H(o.lng,o.lat,c);e.addSource(v,{type:"geojson",data:b}),e.addLayer({id:v,type:"fill",source:v,paint:{"fill-color":"#3b82f6","fill-opacity":.15}}),e.addLayer({id:`${v}-outline`,type:"line",source:v,paint:{"line-color":"#3b82f6","line-width":2,"line-opacity":.8}})}},[o,c]),a.useEffect(()=>{s.current&&(x.current.forEach(e=>e.remove()),x.current=[],i.forEach(e=>{try{const h=e.id===l,b=_(e,h),L=new j.Marker({element:b}).setLngLat([e.position.lng,e.position.lat]).addTo(s.current);n&&b.addEventListener("click",()=>{n(e)}),(e.title||e.price!==void 0||e.rating!==void 0)&&(b.addEventListener("mouseenter",()=>{if(!p.current||!s.current)return;let r='<div class="p-2 font-sans">';e.title&&(r+=`<div class="font-semibold text-sm mb-1">${e.title}</div>`),(e.price!==void 0||e.rating!==void 0)&&(r+='<div class="flex gap-2 text-xs">',e.price!==void 0&&(r+=`<span class="text-green-600 font-medium">£${e.price}</span>`),e.rating!==void 0&&(r+=`<span class="text-amber-500">★ ${e.rating}</span>`),r+="</div>"),r+="</div>",p.current.setLngLat([e.position.lng,e.position.lat]).setHTML(r).addTo(s.current)}),b.addEventListener("mouseleave",()=>{p.current&&p.current.remove()})),x.current.push(L)}catch(h){console.error("Error creating marker:",h)}}))},[i,n,l]),a.useEffect(()=>()=>{x.current.forEach(e=>e.remove())},[]),g||!f?d.jsxs("div",{className:E("relative w-full h-64 md:h-96 bg-muted rounded-2xl flex flex-col items-center justify-center p-6",u),children:[d.jsx("div",{className:"absolute inset-0 opacity-20",children:d.jsx("div",{className:"w-full h-full bg-gradient-to-br from-muted to-border rounded-2xl"})}),d.jsxs("div",{className:"relative z-10 text-center space-y-2",children:[d.jsx($,{className:"w-10 h-10 text-muted-foreground mx-auto"}),d.jsx("p",{className:"text-sm text-muted-foreground",children:f?"Map unavailable - Please check configuration":"Mapbox access token not configured"})]})]}):d.jsx("div",{className:E("relative w-full h-64 md:h-96 rounded-2xl overflow-hidden border border-border",u),children:d.jsx("div",{ref:m,className:"absolute inset-0"})})}function H(o,t,i){const l=[],c=i/(111.32*Math.cos(t*Math.PI/180)),u=i/110.574;for(let f=0;f<64;f++){const m=f/64*(2*Math.PI),s=c*Math.cos(m),x=u*Math.sin(m);l.push([o+s,t+x])}return l.push(l[0]),{type:"Feature",properties:{},geometry:{type:"Polygon",coordinates:[l]}}}function X(o){const t=P.c(9);let i,n,l;if(t[0]!==o){const{provider:u,googleMapsKey:f,mapboxToken:m,...s}=o;l=u,n=m,i=s,t[0]=o,t[1]=i,t[2]=n,t[3]=l}else i=t[1],n=t[2],l=t[3];if(l==="mapbox"&&n){let u;return t[4]!==i||t[5]!==n?(u=d.jsx(A,{...i,mapboxToken:n}),t[4]=i,t[5]=n,t[6]=u):u=t[6],u}let c;return t[7]!==i?(c=d.jsx(S,{...i}),t[7]=i,t[8]=c):c=t[8],c}export{X as MapProvider,X as default};
