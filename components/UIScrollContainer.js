class UIScrollContainer extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode:'open'});

		const style = document.createElement('style');
		style.textContent = `
			:host {
				--thead-height: 0px;
				--shadow-color: hsl(0, 0%, 0%, 0.2);

				display: block;
				width: 100%;
				height: 100%;
			}

			:host #container {
				position: relative;
				width: 100%;
				height: 100%;
			}

			:host #scroll {
				width: 100%;
				height: 100%;
				overflow-x: hidden;
				overflow-y: scroll;
			}

			:host #shadow_wrap {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				pointer-events: none;
			}

			:host #shadow_top,
			:host #shadow_btm {
				position: absolute;
				left: 0;
				width: 100%;
				height: min(160px, 30%);
			}

			:host #shadow_top {
				top: 0;
				background: linear-gradient(to bottom, var(--shadow-color), hsl(0, 0%, 0%, 0));
			}

			:host #shadow_btm {
				bottom: 0;
				background: linear-gradient(to top, var(--shadow-color), hsl(0, 0%, 0%, 0));
			}

			:host .hide {
				display: none;
			}

		`;
		
		const slot = document.createElement('slot');

		this.scroll = document.createElement('div');
		this.scroll.id = 'scroll';
		this.scroll.append(slot);
		this.scroll.addEventListener('scroll', this.onScrolling.bind(this));

		this.shadowTop = document.createElement('div');
		this.shadowTop.id = 'shadow_top';
		this.shadowTop.classList.add('hide');

		this.shadowBtm = document.createElement('div');
		this.shadowBtm.id = 'shadow_btm';
		this.shadowBtm.classList.add('hide');

		const shadowWrap = document.createElement('div');
		shadowWrap.id = 'shadow_wrap';
		shadowWrap.append(this.shadowTop, this.shadowBtm);

		const container = document.createElement('div');
		container.id = 'container';
		container.append(this.scroll, shadowWrap);

		shadow.append(style, container);

	}

	connectedCallback() {
		this.scroll.scrollTo(0, 10);
		this.onScrolling();
	}

	onScrolling(e) {
		this.shadowTop.classList.toggle('hide', this.scroll.scrollTop == 0);
		console.log(this.scroll.scrollHeight, this.scroll.offsetHeight);
	}

	static get is() {
		return 'ui-scroll-container';
	}
}

customElements.define(UIScrollContainer.is, UIScrollContainer);