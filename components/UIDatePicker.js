class UIDatePicker extends HTMLElement {
    #container;
    #knob = document.createElement('div');
    #panel = document.createElement('div');
    #now = new Date(2022, 3, 29);
    #min = new Date(1990, 0, 1);
    #max = new Date(2040, 11, 31);
    #isLock = false;

    constructor() {
        super();

        const style = document.createElement('style');
        style.textContent = `
        :host * {
            margin: 0;
            padding: 0;
            border: 0;
            box-sizing: border-box;
            user-select: none;
        }
        `;
        this.#container = this.#getContainer();
        this.#knob.id = 'knob';
        this.#panel.id = 'panel';
        this.#panel.innerHTML = ``;
    }

    connectedCallback() {}

    disconnectedCallback() {}

    open(e) {}

    close(e) {}

    onClose(e) {}

    static get observedAttributes() {
        return ['value', 'min', 'max'];
    }

    attributeChangedCallback(attr, oldValue, newValue) {}

    #getContainer() {
        let container = document.querySelector('component-container');

        if (!container) {
            container = document.createElement('component-container');
            container.attachShadow({ mode: 'open' });
            container.shadowRoot.append(document.createElement('style'));
            container.shadowRoot.querySelector('style').textContent = `
            :host * {
                margin: 0;
                padding: 0;
                border: 0;
                box-sizing: border-box;
                user-select: none;
            }
            :host {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 99999999;
                pointer-events: none;
            }
            `;
            document.querySelector('body').append(container);
        }
        
        return container.shadowRoot;
    }

    #getDateToStr(date) {
        return [date.getFullYear(), ('0' + (date.getMonth() + 1)).slice(-2), ('0' + date.getDate()).slice(-2)].join('-');
    }

    #getStrToDate(str) {
        
    }

    get value() {
        return this.innerHTML;
    }
    set value(str) {

    }

    get min() {
        return this.#getDateToStr(this.#min);
    }
    set min(str) {

    }

    get max() {
        return this.#getDateToStr(this.#max);
    }
    set max(str) {

    }

    static get ver() {
        return '1.0.0';
    }

    static get is() {
        return 'ui-date-picker';
    }
}

customElements.define(UIDatePicker.is, UIDatePicker);