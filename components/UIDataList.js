class UIDataList extends HTMLElement {
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
                display: grid;
            }
        `;
    }

    init(data) {
        if (data.head != undefined) this.#initHead(data.head);
    }

    #initHead(data) {
        console.log('+++++++++ initHead :', data);
    }

    #initBody() {

    }

    static get ver() {
        return '1.0.0';
    }

    static get is() {
        return 'ui-data-list';
    }
}

customElements.define(UIDataList.is, UIDataList);