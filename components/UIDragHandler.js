class UIDragHandler extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({mode:'open'});

        const style = document.createElement('style');
        style.textContent = `
            :host {
                cursor: grab;
            }

            .press {
                cursor: grabbing;
            }
        `;

        const slot = document.createElement('slot');

        this.target = this;

        this.addEventListener('mousedown')

        shadow.append(style, slot);
    }

    static get observedAttributes() {
        return ['target'];
    }

    static get is() {
        return 'ui-drag-handler';
    }
}

customElements.define(UIDragHandler.is, UIDragHandler);