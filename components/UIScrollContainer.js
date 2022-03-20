class UIScrollContainer extends HTMLElement {
	constructor() {
		super();
	}

	static get is() {
		return 'ui-scroll-container';
	}
}

customElements.define(UIScrollContainer.is, UIScrollContainer);