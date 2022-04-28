class UIScrollContainer extends HTMLElement {
    #root = document.createElement('div');
    #container;
    #shadowTop;
    #shadowBtm;

    constructor() {
        super();

        const style = document.createElement('style');
        style.textContent = `
            :host * {
                margin: 0;
                padding: 0;
                border: 0;
                box-sizing: border-box;
            }

            :host {
                --thead-size: 0px;
                --shadow-size: min(30px, 20%);
                --shadow-color: hsl(0, 40%, 10%, 0.2);
                --scrollbar-size: 4px;
                --scrollbar-color: hsl(200, 40%, 40%, 1.0);
                --scrollbar-bg: transparent;
            }

            #root {
                position: relative;
                width: 100%;
                height: 100%;
            }

            #container {
                width: 100%;
                height: 100%;

                overflow-x: hidden;
                overflow-y: auto;
            }
            #root.outside #container {
                width: calc(100% + var(--scrollbar-size));
                height: 100%;
            }

            #root.horizontal #container {
                overflow-x: auto;
                overflow-y: hidden;
            }

            #root.horizontal.outside #container {
                width: 100%;
                height: calc(100% + var(--scrollbar-size));
            }

            #scroll {
                width: 100%;
                height: max-content;
            }

            #root.horizontal #scroll {
                width: max-content;
                height: 100%;
            }

            #shadow_wrap {
                position: absolute;
                top: 0;
                left: 0;
                width: calc(100% - var(--scrollbar-size));
                height: 100%;
                z-index: 1;
                pointer-events: none;
            }

            #root.horizontal #shadow_wrap {
                width: 100%;
                height: calc(100% - var(--scrollbar-size));
            }

            #root.outside #shadow_wrap {
                width: 100%;
                height: 100%;
            }

            #shadow_top,
            #shadow_btm {
                position: absolute;
                left: 0;
                width: 100%;
                height: var(--shadow-size);

                opacity: 0;
                transition: opacity 0.5s;
            }

            #shadow_top {
                top: var(--thead-size);
                background: linear-gradient(to bottom, var(--shadow-color), hsl(0, 0%, 0%, 0));
            }

            #shadow_btm {
                top: auto;
                bottom: 0;
                background: linear-gradient(to top, var(--shadow-color), hsl(0, 0%, 0%, 0));
            }

            #root.horizontal #shadow_top,
            #root.horizontal #shadow_btm {
                top: 0;
                width: var(--shadow-size);
                height: 100%;
            }

            #root.horizontal #shadow_top {
                left: var(--thead-size);
                background: linear-gradient(to right, var(--shadow-color), hsl(0, 0%, 0%, 0));
            }

            #root.horizontal #shadow_btm {
                left: auto;
                right: 0;
                background: linear-gradient(to left, var(--shadow-color), hsl(0, 0%, 0%, 0));
            }

            .show {
                opacity: 1 !important;
            }

            #container::-webkit-scrollbar {
                width: var(--scrollbar-size);
                height: var(--scrollbar-size);
            }
            #container::-webkit-scrollbar-track {
                background-color: var(--scrollbar-bg);
            }
            #container::-webkit-scrollbar-thumb {
                background-color: var(--scrollbar-color);
                border-radius: 10px;
            }
            #container::-webkit-scrollbar-button:vertical:start {
                height: var(--thead-size);
            }
            #container::-webkit-scrollbar-button:horizontal:start {
                width: var(--thead-size);
            }
        `;

        this.#root.id = 'root';
        this.#root.innerHTML = `
            <div id="container">
                <div id="scroll">
                    <slot></slot>
                </div>
            </div>
            <div id="shadow_wrap">
                <div id="shadow_top"></div>
                <div id="shadow_btm"></div>
            </div>
        `;

        this.#container = this.#root.querySelector('#container');
        this.#shadowTop = this.#root.querySelector('#shadow_top');
        this.#shadowBtm = this.#root.querySelector('#shadow_btm');

        this.scrolling = this.scrolling.bind(this);
        this.onScrolling = this.onScrolling.bind(this);

        const shadow = this.attachShadow({mode:'open'});
        shadow.append(style, this.#root);
    }

    connectedCallback() {
        this.#container.addEventListener('wheel', this.scrolling);
        this.#container.addEventListener('scroll', this.onScrolling);

        setTimeout(() => {
            this.onScrolling();
        });
    }

    disconnectedCallback() {
        this.#container.removeEventListener('wheel', this.scrolling);
        this.#container.removeEventListener('scroll', this.onScrolling);
    }

    scrolling(e) {
        this.#container.scrollLeft += e.deltaY;
        this.#container.scrollTop += e.deltaY;
    }

    onScrolling(e) {
        this.#shadowTop.classList.toggle('show', this.#container.scrollTop > 0 || this.#container.scrollLeft > 0);
        this.#shadowBtm.classList.toggle('show',
            this.#container.scrollTop + this.#container.offsetHeight < this.#container.scrollHeight ||
            this.#container.scrollLeft + this.#container.offsetWidth < this.#container.scrollWidth
        );
    }

    showItem(str, idx) {
        const item = this.getItem(str, idx);
        if (!item) return;

        if (this.#root.classList.contains('horizontal')) {
            let itemLeft = item.offsetLeft;
            let itemWidth = item.offsetWidth;
            let scrollLeft = this.#container.scrollLeft;
            let scrollWidth = this.#container.clientWidth;

            this.#container.scrollTo({
                left: Math.min(itemLeft - this.#shadowTop.offsetLeft, Math.max(scrollLeft, itemLeft + itemWidth - scrollWidth)),
                behavior: 'smooth'
            });
        } else {
            let itemTop = item.offsetTop;
            let itemHeight = item.offsetHeight;
            let scrollTop = this.#container.scrollTop;
            let scrollHeight = this.#container.clientHeight;

            this.#container.scrollTo({
                top: Math.min(itemTop - this.#shadowTop.offsetTop, Math.max(scrollTop, itemTop + itemHeight - scrollHeight)),
                behavior: 'smooth'
            });
        }
    }

    getItem(str, idx) {
        return this.querySelectorAll(str)[idx || 0];
    }

    getItemPosition(str, idx) {
        const item = this.getItem(str, idx);
        return item[this.#root.classList.contains('horizontal') ? 'offsetLeft' : 'offsetTop'];
    }

    moveTo(pos) {
        const option = { behavior: 'smooth' };
        option[this.#root.classList.contains('horizontal') ? 'left' : 'top'] = pos;
        this.#container.scrollTo(option);
    }

    static get observedAttributes() {
        return ['horizontal', 'outside'];
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'horizontal') this.#root.classList.toggle('horizontal', this.hasAttribute('horizontal'));
        if (attr === 'outside') this.#root.classList.toggle('outside', this.hasAttribute('outside'));
    }

    static get ver() {
        return '1.1.0';
    }

    static get is() {
        return 'ui-scroll-container';
    }
}

customElements.define(UIScrollContainer.is, UIScrollContainer);