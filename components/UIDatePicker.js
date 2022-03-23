class UIDatePicker extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode:'open'});

		const style = document.createElement('style');
		style.textContent = `
		:host * {
			border: 0;
			padding: 0;
			margin: 0;
			box-sizing: border-box;
			user-select: none;
		}
		
		:host {
			--color-input-border: hsl(0, 0%, 50%, 1.00);
			--color-input-background: hsl(0, 0%, 100%, 1.00);
		}

		.input {
			width: 100%;
			height: 100%;
			border: 1px solid var(--color-input-border);
			background-color: var(--color-input-background);
		}
		`;

		const input = document.createElement('div');
		input.classList.add('input');

		shadow.append(style, input);
	}

	connectedCallback() {
		console.log('connectedCallback')
	}

	static get observedAttributes() {
		return ['value'];
	}

	attributeChangedCallback(attr, oldValue, newValue) {
		console.log('attributeChangedCallback :', attr, oldValue, newValue);
	}
	
	static get is() {
		return 'ui-date-picker';
	}
}

customElements.define(UIDatePicker.is, UIDatePicker);