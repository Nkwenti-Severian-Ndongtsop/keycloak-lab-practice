"use strict";
(self["webpackChunkadorsys_tw_01"] = self["webpackChunkadorsys_tw_01"] || []).push([[792],{

/***/ 99:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


;// ./src/libs/utils.ts
function addFeatherIconToButton(element, iconStr) {
    const icon = createIcon(iconStr);
    if (!element)
        return;
    element.prepend(icon);
}
function createIcon(icon) {
    const languageIcon = document.createElement("i");
    const attr = document.createAttribute("data-feather");
    attr.value = icon;
    languageIcon.attributes.setNamedItem(attr);
    return languageIcon;
}

;// ./src/libs/code.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

function addCopyButton() {
    const code = document.querySelector("#code");
    if (!code)
        return;
    if (!code.value)
        return;
    code.classList.remove('form-control');
    code.classList.add('input', 'input-bordered', 'join-item', 'w-full');
    const parentElement = code.parentElement;
    if (!parentElement)
        return;
    const newParentDiv = document.createElement("div");
    newParentDiv.classList.add("my-4");
    parentElement.replaceChild(newParentDiv, code);
    const newDiv = document.createElement("div");
    newDiv.appendChild(code);
    newDiv.classList.add("join", "w-full", "join-horizontal");
    newDiv.id = "code-wrapper";
    newParentDiv.appendChild(newDiv);
    const newButton = document.createElement("button");
    newDiv.appendChild(newButton);
    newButton.classList.add("btn", "btn-outline", "btn-primary", "join-item");
    newButton.appendChild(createIcon("clipboard"));
    newButton.addEventListener("click", () => {
        const code = document.querySelector("#code");
        if (!code)
            return;
        if (!code.value)
            return;
        navigator.clipboard.writeText(code.value);
    });
}
window.addEventListener("load", () => __awaiter(void 0, void 0, void 0, function* () {
    addCopyButton();
}));

;// ./src/templates/logo.html
// Imports
var ___HTML_LOADER_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(306), __webpack_require__.b);
// Module
var code = `<img src="${___HTML_LOADER_IMPORT_0___}" alt="adorsys" class="w-1/2 mx-0 my-1 md:mt-2"/>`;
// Exports
/* harmony default export */ const logo = (code);
;// ./src/libs/logo.ts
var logo_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

function addLogo() {
    const headerWrapper = document.querySelector('#kc-page-title');
    if (!headerWrapper)
        return;
    headerWrapper.insertAdjacentHTML('afterend', logo);
}
window.addEventListener("load", () => logo_awaiter(void 0, void 0, void 0, function* () {
    addLogo();
}));

;// ./src/index.ts
var src_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




window.addEventListener("load", () => {
    const languageButton = document.querySelector("#kc-current-locale-link");
    addFeatherIconToButton(languageButton, "globe");
    replaceWrongCheckboxes();
    replaceWrongHr();
});
window.addEventListener("load", () => src_awaiter(void 0, void 0, void 0, function* () {
    yield __webpack_require__.e(/* import() */ 911).then(__webpack_require__.t.bind(__webpack_require__, 911, 23)).then(({ default: feather }) => {
        feather.replace();
    });
    console.log("Libs loaded");
}));
function replaceWrongCheckboxes() {
    const wrongCheckBoxes = document.querySelectorAll("div.checkbox");
    for (const element of wrongCheckBoxes) {
        const checkBox = element.querySelector("input");
        if (!checkBox)
            continue;
        checkBox.classList.add("checkbox");
        const registerSpan = document.createElement("span");
        registerSpan.innerText = element.innerText.trim();
        registerSpan.classList.add("label-text", "ml-2");
        const label = document.createElement("label");
        label.classList.add("cursor-pointer", "label");
        label.appendChild(checkBox);
        label.appendChild(registerSpan);
        if (element.parentNode) {
            element.parentNode.replaceChild(label, element);
        }
    }
}
function replaceWrongHr() {
    const socialProviders = document.querySelector("#kc-social-providers");
    if (!socialProviders)
        return;
    const wrongHr = socialProviders.querySelectorAll("hr");
    let replacement = socialProviders.querySelector("h2");
    replacement = replacement !== null && replacement !== void 0 ? replacement : socialProviders.querySelector("h4");
    if (!replacement)
        return;
    for (const element of wrongHr) {
        const divDivider = document.createElement("div");
        divDivider.innerText = replacement.innerText.trim();
        divDivider.classList.add("divider");
        if (element.parentNode) {
            element.parentNode.removeChild(replacement);
            element.parentNode.replaceChild(divDivider, element);
        }
    }
}


/***/ }),

/***/ 306:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "543ad63292ebf64e9439.svg";

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(99));
/******/ }
]);