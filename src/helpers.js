const select = (elem) => document.querySelector(elem);
const selectAll = (elem) => Array.from(document.querySelectorAll(elem));
const create = (elem) => document.createElement(elem);

export { select, selectAll, create };
