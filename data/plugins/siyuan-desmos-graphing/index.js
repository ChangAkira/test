/*!
 * MIT License
 *
 * Copyright (c) 2023 SiYuan 思源笔记
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */(()=>{"use strict";var n={};n.d=(s,e)=>{for(var t in e)n.o(e,t)&&!n.o(s,t)&&Object.defineProperty(s,t,{enumerable:!0,get:e[t]})},n.o=(s,e)=>Object.prototype.hasOwnProperty.call(s,e),n.r=s=>{typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(s,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(s,"__esModule",{value:!0})};var l={};n.r(l),n.d(l,{default:()=>b});const c=require("siyuan"),f="menu-config";class b extends c.Plugin{constructor(){super(...arguments),this.lastSavedState=new Map}onload(){this.data[f]={readonlyText:"Readonly"};const e=(0,c.getFrontend)();this.isMobile=e==="mobile"||e==="browser-mobile",this.protyleSlash=[{filter:["desmos","graph","math","\u6570\u5B66","\u7ED8\u56FE"],html:`<div class="b3-list-item__first"><span class="b3-list-item__text">${this.i18n.insertDesmos}</span><span class="b3-list-item__meta">\u{1F4C8}</span></div>`,id:"insertDesmos",callback:t=>{t.insert(`<iframe src="/plugins/${this.name}/offline-desmos/desmos.html" style="width: 100%; height: 500px;" data-subtype="iframe"></iframe>`,!0)}}],this.boundHandleMessage=this.handleMessage.bind(this),window.addEventListener("message",this.boundHandleMessage)}onunload(){window.removeEventListener("message",this.boundHandleMessage)}handleMessage(e){if(!(!e.data||typeof e.data!="object")){if(e.data.type==="desmos-ready"){const t=document.querySelectorAll("iframe");for(const i of Array.from(t))if(i.contentWindow===e.source){const o=this.findBlockElement(i);if(o){const a=o.getAttribute("data-node-id"),d=o.getAttribute("custom-desmos-state");if(d)try{const r=decodeURIComponent(d);i.contentWindow.postMessage({type:"set-state",state:JSON.parse(r)},"*"),a&&this.lastSavedState.set(a,r)}catch(r){console.error("Desmos V4: Failed to restore state",r)}}break}}else if(e.data.type==="state-changed"){const t=document.querySelectorAll("iframe");for(const i of Array.from(t))if(i.contentWindow===e.source){const o=this.findBlockElement(i);if(o){const a=o.getAttribute("data-node-id");if(!a)continue;const d=JSON.stringify(e.data.state),r=o.getAttribute("custom-desmos-state");if((r?decodeURIComponent(r):this.lastSavedState.get(a)||"")!==d){this.lastSavedState.set(a,d);const m=encodeURIComponent(d);o.setAttribute("custom-desmos-state",m),(0,c.fetchPost)("/api/attr/setBlockAttrs",{id:a,attrs:{"custom-desmos-state":m}},p=>{p.code!==0&&(0,c.fetchPost)("/api/block/setBlockAttrs",{id:a,attrs:{"custom-desmos-state":m}},u=>{u.code!==0&&console.error("Desmos V4: Persist failed entirely",u)})})}}break}}}}findBlockElement(e){let t=e;for(;t&&t!==document.body;){if(t.hasAttribute("data-node-id"))return t;t=t.parentElement}return null}}module.exports=l})();
