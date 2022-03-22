class UIScrollContainer extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode:'open'});

		const style = document.createElement('style');
		style.textContent = `
			:host {
				--thead-size: 0;
				--shadow-size: min(160px, 30%);
				--shadow-color: hsl(0, 0%, 100%, 1.0);
				--scrollbar-size: 6px;
				--scrollbar-color: hsl(200, 25%, 75%, 1.0);

				display: block;
				width: 100%;
				height: 100%;
			}

			#container {
				position: relative;
				width: 100%;
				height: 100%;
			}

			#scroll {
				width: calc(100% + var(--scrollbar-size));
				height: 100%;
				overflow-x: hidden;
				overflow-y: scroll;
				scroll-behavior: auto;
			}
			#scroll::-webkit-scrollbar {
				width: var(--scrollbar-size);
				box-sizing: content-box;
			}
			#scroll::-webkit-scrollbar-track {
				background-color: transparent;
			}
			#scroll::-webkit-scrollbar-thumb {
				background-color: var(--scrollbar-color);
				border-radius: 10px;
			}
			#scroll::-webkit-scrollbar-button:start {
				height: var(--thead-size);
			}

			#shadow_wrap {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				pointer-events: none;
			}

			#shadow_top,
			#shadow_btm {
				position: absolute;
				left: 0;
				width: 100%;
				height: var(--shadow-size);
			}

			#shadow_top {
				top: var(--thead-size);
				background: linear-gradient(to bottom, var(--shadow-color), hsl(0, 0%, 0%, 0));
			}

			#shadow_btm {
				bottom: 0;
				background: linear-gradient(to top, var(--shadow-color), hsl(0, 0%, 0%, 0));
			}

			.transition {
				transition: opacity 0.3s;
			}

			.hide {
				opacity: 0;
			}
		`;

		const slot = document.createElement('slot');

		this.scroll = document.createElement('div');
		this.scroll.id = 'scroll';
		this.scroll.append(slot);
		this.scroll.addEventListener('scroll', this.onScrolling.bind(this));

		this.shadowTop = document.createElement('div');
		this.shadowTop.id = 'shadow_top';

		this.shadowBtm = document.createElement('div');
		this.shadowBtm.id = 'shadow_btm';

		const shadowWrap = document.createElement('div');
		shadowWrap.id = 'shadow_wrap';
		shadowWrap.append(this.shadowTop, this.shadowBtm);

		const container = document.createElement('div');
		container.id = 'container';
		container.append(this.scroll, shadowWrap);

		shadow.append(style, container);
	}

	connectedCallback() {
		setTimeout(() => {
			this.onScrolling();

			this.shadowTop.classList.add('transition');
			this.shadowBtm.classList.add('transition');
		})
	}

	onScrolling(e) {
		this.shadowTop.classList.toggle('hide', this.scroll.scrollTop == 0);
		this.shadowBtm.classList.toggle('hide', this.scroll.scrollTop == this.scroll.scrollHeight - this.scroll.offsetHeight);
	}

	static get observedAttributes() {
		return [];
	}

	attributeChangedCallback(attr, oldValue, newValue) {

	}

	static get is() {
		return 'ui-scroll-container';
	}
}

customElements.define(UIScrollContainer.is, UIScrollContainer);