class SetDataTable extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.style.cssText += `
			display: table;
			border-spacing: 0;
			border-collapse: collapse;
		`;
	}

	init(data) {
		this.#keyArray = this.#getKeyArray(data, this.#getKeyArray(data.body, this.#getKeyArray(data.head) || []));
		console.log(this.#keyArray);
		this.initHead(data.head);
		this.initBody(Array.isArray(data) ? data : data.body);
	}

	initHead(data) {
		if (!Array.isArray(data)) return;

		this.innerHTML = '';
		const thead = this.appendChild(document.createElement('thead'));

		thead.append(...this.#getTrArray(data, 'th'));
	}
	

	initBody(data) {
		if (!Array.isArray(data)) return;

		const tbody = this.querySelector('tbody') || this.appendChild(document.createElement('tbody'));
		tbody.innerHTML = '';

		tbody.append(...this.#getTrArray(data, 'td'));
	}

	#getTrArray(data, tag) {
		const ret = [];

		data.forEach((obj, rIdx) => {
			const tr = document.createElement('tr');
			ret.push(tr);
			
			const keys = Object.keys(obj);
			keys.forEach((key, cIdx) => {
				if (typeof obj[key] != 'object') {
					const th = tr.appendChild(document.createElement(tag || 'td'));
					th.classList.add('key');
					th.innerHTML = obj[key];
					
					let cColNum = this.#keyArray.indexOf(key);
					let nColNum = (this.#keyArray.length + 1 + this.#keyArray.indexOf(keys[cIdx + 1])) % (this.#keyArray.length + 1);
					th.setAttribute('colspan', nColNum - cColNum);

					let i = rIdx + 1;
					for (; i < data.length; i ++) {
						if (typeof data[i][key] != 'object') break;
					}
					th.setAttribute('rowspan', i - rIdx);
				}
			});
		});

		return ret;
	}
	
	#keyArray = [];
	#getKeyArray(data, array) {
		if (!data || !Array.isArray(data)) return array;

		let ret = array || [];

		data.forEach((obj) => {
			let keys = Object.keys(obj);
			
			if (ret.toString() != keys.toString()) {
				let point = ret.length;
				
				keys.reverse();
				keys.forEach((key, idx) => {
					if (!~ret.indexOf(key)) {
						ret.splice(point, 0, key);
					} else {
						point = ret.indexOf(key);
					}
				});
			}
		});

		return ret;
	}

	static get is() {
		return 'set-data-table';
	}
}

customElements.define(SetDataTable.is, SetDataTable);