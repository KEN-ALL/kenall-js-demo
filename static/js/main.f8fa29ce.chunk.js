(this["webpackJsonpkenall-js-demo"]=this["webpackJsonpkenall-js-demo"]||[]).push([[0],{33:function(e,t,s){"use strict";(function(e){s(20);var a=s(19),n=s(37),r=s(18),c=s(11),i=s.n(c),o=s(15),l=s(1),d=s.n(l),u=s(34),x=s.n(u),b=s(35),j=s(0),p={jisx0402:"",old_code:"",postal_code:"",prefecture:"",prefecture_kana:"",city:"",city_kana:"",town:"",town_kana:"",town_raw:"",town_kana_raw:"",koaza:"",kyoto_street:"",building:"",floor:"",town_partial:!1,town_addressed_koaza:!1,town_multi:!1,town_chome:!1,corporation:null},g=new b.KENALL("f32fcf25cc2f0c924d96a96f5f2de415bb7f6332",{apibase:"https://api-beta.kenall.jp/v1",timeout:1e4}),m=function(){var e={},t=function(e){return"".concat(e.query,":").concat(e.limit)};return function(){var s=Object(o.a)(i.a.mark((function s(a){var n,r;return i.a.wrap((function(s){for(;;)switch(s.prev=s.next){case 0:if(n=t(a),void 0!==(r=e[n])){s.next=7;break}return s.next=5,g.searchAddresses(a);case 5:r=s.sent,e[n]=r;case 7:return s.abrupt("return",r);case 8:case"end":return s.stop()}}),s)})));return function(e){return s.apply(this,arguments)}}()}();t.a=function(){var t=d.a.useState(""),s=Object(r.a)(t,2),c=s[0],l=s[1],u=d.a.useState(void 0),b=Object(r.a)(u,2),g=b[0],f=b[1],h=function(){var e=Object(o.a)(i.a.mark((function e(t){var s,a;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(s=t.value,l(s),s){e.next=5;break}return f(void 0),e.abrupt("return");case 5:return e.prev=5,e.next=8,m({query:s,limit:20});case 8:a=e.sent,f(a),e.next=15;break;case 12:e.prev=12,e.t0=e.catch(5),f(e.t0);case 15:case"end":return e.stop()}}),e,null,[[5,12]])})));return function(t){return e.apply(this,arguments)}}();return Object(j.jsxs)("section",{className:"jsx-1733188394 flex flex-col",children:[Object(j.jsx)(e,{id:"1733188394",children:[".react-autosuggest__container{position:relative;}",".react-autosuggest__input{--tw-border-opacity:1;border-color:rgba(229,231,235,var(--tw-border-opacity));border-radius:0.375rem;border-width:1px;font-size:1.125rem;line-height:1.75rem;margin:0px;padding:0.5rem;width:100%;}",".react-autosuggest__input--focused:focus{outline:2px solid transparent;outline-offset:2px;}",".react-autosuggest__suggestions-container{--tw-border-opacity:1;border-color:rgba(229,231,235,var(--tw-border-opacity));border-radius:0.375rem;border-width:1px;display:none;position:absolute;z-index:10;}",".react-autosuggest__suggestions-container--open{display:block;}",".react-autosuggest__suggestions-list{margin:0px;padding:0px;}",".react-autosuggest__suggestion{cursor:pointer;display:-webkit-flex;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-direction:row;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-flex-wrap:nowrap;-webkit-flex-wrap:nowrap;-ms-flex-wrap:nowrap;flex-wrap:nowrap;-webkit-align-items:baseline;-webkit-align-items:baseline;-webkit-box-align:baseline;-ms-flex-align:baseline;align-items:baseline;padding-top:0.5rem;padding-bottom:0.5rem;padding-left:1rem;padding-right:1rem;}",".react-autosuggest__suggestion--highlighted{--tw-bg-opacity:1;background-color:rgba(219,234,254,var(--tw-bg-opacity));}",".container{display:-webkit-flex;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}"]}),Object(j.jsx)("header",{className:"jsx-1733188394 flex-1 align-center",children:Object(j.jsx)("h1",{className:"jsx-1733188394 mb-5 text-3xl font-bold text-gray-500",children:"Autocomplete"})}),Object(j.jsx)("main",{className:"jsx-1733188394 flex-1",children:Object(j.jsxs)("div",{className:"jsx-1733188394",children:[Object(j.jsxs)("div",{className:"jsx-1733188394 mb-2",children:[Object(j.jsx)("label",{className:"jsx-1733188394",children:"\u4f4f\u6240\u3092\u5165\u529b"}),Object(j.jsxs)("p",{className:"jsx-1733188394",children:["\u4f8b: ",Object(j.jsx)("span",{className:"jsx-1733188394 bg-gray-200 p-1 mr-1",children:"\u611b\u77e5\u770c"})," ",Object(j.jsx)("span",{className:"jsx-1733188394 bg-gray-200 p-1 mr-1",children:"\u6a2a\u6d5c\u5e02 \u6e2f\u5317\u533a"})]})]}),Object(j.jsx)("div",{className:"jsx-1733188394 text-lg w-9/12",children:Object(j.jsx)(x.a,{suggestions:void 0===g||g instanceof Error?[p]:g.data,onSuggestionsFetchRequested:h,onSuggestionsClearRequested:function(){f(void 0)},onSuggestionSelected:function(e,t){t.suggestion;var s=t.suggestionValue;t.suggestionIndex,t.sectionIndex,t.method;l(s)},getSuggestionValue:function(e){var t;return"".concat(e.prefecture).concat(e.city).concat(e.town," ").concat(e.kyoto_street||"").concat(e.koaza||"").concat((null===e||void 0===e||null===(t=e.corporation)||void 0===t?void 0:t.block_lot)||"").concat(e.building||"").concat(e.floor||"")},renderSuggestion:function(e){var t;return Object(j.jsxs)(j.Fragment,{children:[Object(j.jsxs)("span",{className:"text-base font-mono w-24 flex-shrink-0",children:["\u3012",e.postal_code.substring(0,3),"-",e.postal_code.substring(3)]}),Object(j.jsxs)("span",{className:"text-sm ml-2",children:[e.prefecture,e.city,e.town," ",e.kyoto_street,e.koaza,null===e||void 0===e||null===(t=e.corporation)||void 0===t?void 0:t.block_lot,e.building,e.floor]})]})},renderSuggestionsContainer:function(e){var t=e.containerProps,s=e.children,r=t.ref,c=t.className,i=Object(n.a)(t,["ref","className"]);return Object(j.jsx)("div",Object(a.a)(Object(a.a)({},i),{},{className:"".concat(c," divide-y divide-gray-200 divide-solid"),children:void 0!==g&&(g instanceof Error?Object(j.jsx)("div",{ref:r,children:Object(j.jsx)("ul",{className:"react-autosuggest__suggestions-list",children:Object(j.jsxs)("li",{className:"react-autosuggest__suggestion",children:[Object(j.jsx)("span",{className:"text-base text-red-300 mr-2",children:"\u53d6\u5f97\u6642\u306b\u30a8\u30e9\u30fc\u304c\u767a\u751f\u3057\u307e\u3057\u305f"}),Object(j.jsx)("span",{className:"text-sm text-red-200",children:g.message})]})})}):Object(j.jsxs)(j.Fragment,{children:[Object(j.jsx)("div",{className:"overflow-y-scroll max-h-48",ref:r,children:s}),Object(j.jsx)("div",{className:"text-sm text-gray-400 py-1 px-4 flex flex-row justify-end",children:Object(j.jsxs)("div",{children:[String(g.count),"\u4ef6"]})})]}))}))},inputProps:{placeholder:"\u4f4f\u6240\u3092\u5165\u529b",value:c,onChange:function(e){"string"===typeof e.currentTarget.value&&l(e.currentTarget.value)}}})})]})})]})}}).call(this,s(20).default)},83:function(e,t,s){},84:function(e,t,s){"use strict";s.r(t);var a=s(1),n=s.n(a),r=s(32),c=s.n(r),i=s(10),o=s(2),l=s(0),d=function(){return Object(l.jsxs)("section",{className:"flex flex-col",children:[Object(l.jsx)("header",{children:Object(l.jsx)("h1",{className:"mb-5 text-3xl font-bold text-gray-500",children:"\u30b1\u30f3\u30aa\u30fc\u30eb \u30c7\u30e2\u30da\u30fc\u30b8"})}),Object(l.jsx)("main",{children:Object(l.jsx)("p",{className:"mb-2",children:"\u30b5\u30a4\u30c9\u30d0\u30fc\u304b\u3089\u30c7\u30e2\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044\u3002"})})]})},u=s(33);var x=function(){return Object(l.jsxs)("div",{className:"flex",children:[Object(l.jsxs)("aside",{className:"m-5",children:[Object(l.jsx)("header",{children:Object(l.jsx)("h1",{className:"px-3 mb-3 text-lg",children:Object(l.jsx)(i.b,{to:"/",children:"\u30b1\u30f3\u30aa\u30fc\u30eb"})})}),Object(l.jsx)("ul",{children:Object(l.jsx)("li",{children:Object(l.jsx)(i.b,{to:"/autocomplete",className:"px-3 py-2 text-gray-500",children:"Autocomplete"})})})]}),Object(l.jsx)("main",{className:"flex-1 m-5",children:Object(l.jsxs)(o.c,{children:[Object(l.jsx)(o.a,{path:"/autocomplete",children:Object(l.jsx)(u.a,{})}),Object(l.jsx)(o.a,{path:"/",children:Object(l.jsx)(d,{})})]})})]})};s(83);c.a.render(Object(l.jsx)(n.a.StrictMode,{children:Object(l.jsx)(i.a,{basename:"/kenall-js-demo",children:Object(l.jsx)(x,{})})}),document.getElementById("root"))}},[[84,1,2]]]);
//# sourceMappingURL=main.f8fa29ce.chunk.js.map