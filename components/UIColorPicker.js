class UIColorPicker extends HTMLElement {
    #knob = document.createElement('div');
    #panel = document.createElement('div');

    #H = 0;
    #S = 0;
    #L = 0;
    #A = 1;

    constructor() {
        super();
        
        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            :host,
            :host * {
                margin: 0;
                padding: 0;
                border: 0;
                box-sizing: border-box;
                user-select: none;
            }

            :host {
                --width: 250px;
                --padding: 12px;

                --color-bg: hsl(200, 20%, 20%, 1.00);
                --color-line: hsl(200, 20%, 35%, 1.00);
                --color-text: hsl(0, 0%, 80%, 0.75);
                --color-focus: hsl(200, 80%, 40%, 1.00);
                --color-btn: hsl(200, 60%, 35%, 1.00);

                --shadow: 0 5px 10px hsl(0, 0%, 0%, 0.15), 0 2px 5px hsl(0, 0%, 0%, 0.25);
                
                position: relative;
                font-size: inherit;
                color: inherit;
            }

            #knob {
                width: 100%;
                height: 100%;
                cursor: pointer;
            }

            #panel {
                position: absolute;
                top: 100%;
                left: 0;

                display: flex;
                flex-flow: column;
                align-items: center;
                gap: 12px;

                width: var(--width);
                padding-bottom: var(--padding);
                cursor: default;

                background-color: var(--color-bg);
                box-shadow: var(--shadow);
            }

            #palette {
                position: relative;
                width: 100%;
                height: 120px;
                background: linear-gradient(
                    to right,
                    hsl(0, 100%, 100%, 1),
                    hsl(0, 100%, 50%, 1)
                );
            }

            #saturation {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    hsl(0, 0%, 0%, 0),
                    hsl(0, 0%, 0%, 1)
                );
            }

            #hue {
                position: relative;
                width: calc(100% - var(--padding) * 2);
                height: 14px;
                background: linear-gradient(
                    to right,
                    hsl(0, 100%, 50%, 1),
                    hsl(20, 100%, 50%, 1),
                    hsl(40, 100%, 50%, 1),
                    hsl(60, 100%, 50%, 1),
                    hsl(80, 100%, 50%, 1),
                    hsl(100, 100%, 50%, 1),
                    hsl(120, 100%, 50%, 1),
                    hsl(140, 100%, 50%, 1),
                    hsl(160, 100%, 50%, 1),
                    hsl(180, 100%, 50%, 1),
                    hsl(200, 100%, 50%, 1),
                    hsl(220, 100%, 50%, 1),
                    hsl(240, 100%, 50%, 1),
                    hsl(260, 100%, 50%, 1),
                    hsl(280, 100%, 50%, 1),
                    hsl(300, 100%, 50%, 1),
                    hsl(320, 100%, 50%, 1),
                    hsl(340, 100%, 50%, 1),
                    hsl(360, 100%, 50%, 1)
                );
            }

            #value_container {
                display: flex;
                gap: 16px;
                width: calc(100% - var(--padding) * 2);
                height: 20px;
            }

            #type_wrap {
                display: flex;
                width: 90px;
            }

            #type_wrap input {
                display: none;
            }

            #type_wrap input + label {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;

                font-size: 11px;
                color: var(--color-text);
                border-top: 1px solid;
                border-bottom: 1px solid;
                border-color: var(--color-line);
                cursor: pointer;
            }
            #type_wrap input + label:nth-of-type(1) {
                border-radius: 4px 0 0 4px;
                border-left: 1px solid;
                border-right: 1px solid;
                border-color: var(--color-line);
            }
            #type_wrap input + label:nth-of-type(3) {
                border-radius: 0 4px 4px 0;
                border-left: 1px solid;
                border-right: 1px solid;
                border-color: var(--color-line);
            }

            #type_wrap input:checked + label {
                color: #fff;
                border-color: var(--color-focus);
                background-color: var(--color-focus);
                cursor: default;
            }

            #value_wrap {
                flex: 1;
                display: flex;
            }

            #value_wrap input {
                width: 100%;
                outline: none;
                font-size: 12px;
                color: #000;
                text-align: center;
                border: 1px solid var(--color-line);
            }

            #btn_container {
                display: flex;
                justify-content: space-between;
                width: calc(100% - var(--padding) * 2);
            }

            #btn_container .btn_wrap {
                display: flex;
                gap: 8px;
            }

            #btn_container button {
                width: 44px;
                height: 22px;
                font-size: 12px;
                color: hsl(0, 0%, 100%, 0.75);
                border: 1px solid var(--color-line);
                background-color: var(--color-btn);
                cursor: pointer;
            }
            #btn_container button:hover {
                filter: brightness(1.3);
            }

            .point {
                position: absolute;
                width: 14px;
                height: 14px;
                border: 1px solid #fff;
                border-radius: 100px;
                background-color: hsl(0, 0%, 0%, 1);
                box-shadow: 0 2px 3px hsl(0, 0%, 0%, 0.5);
            }
        `;

        this.#knob.id = 'knob';

        this.#panel.id = 'panel';
        this.#panel.innerHTML = `
            <div id="palette">
                <div id="saturation"></div>
                <div id="color_point" class="point"></div>
            </div>
            <div id="hue">
                <div id="hue_point" class="point"></div>
            </div>
            <div id="value_container">
                <div id="type_wrap">
                    <input type="radio" name="type" id="type_hex" checked />
                    <label for="type_hex">HEX</label>
                    <input type="radio" name="type" id="type_rgb" />
                    <label for="type_rgb">RGB</label>
                    <input type="radio" name="type" id="type_hsl" />
                    <label for="type_hsl">HSL</label>
                </div>
                <div id="value_wrap">
                    <input type="text" id="value_txt" value="rgb(0, 0, 0)"></div>
                </div>
            </div>
            <div id="btn_container">
                <div class="btn_wrap">
                    <button id="btn_reset">초기화</button>
                </div>
                <div class="btn_wrap">
                    <button id="btn_done">확인</button>
                    <button id="btn_cancel">취소</button>
                </div>
            </div>
        `;

        this.onPanelOpen = this.onPanelOpen.bind(this);
        this.onPanelClose = this.onPanelClose.bind(this);

        shadow.append(style, this.#knob);

    }

    connectedCallback() {
        this.#knob.addEventListener('click', this.onPanelOpen);
    }

    disconnectedCallback() {
        this.#knob.removeEventListener('click', this.onPanelOpen);
    }

    onPanelOpen(e) {
        console.log('onPanelOpen :', e.currentTarget, this);

        let panel = this.shadowRoot.querySelector('#panel');
        if (panel) return;

        this.#loadColor();

        this.shadowRoot.append(this.#panel);
        document.querySelector('html').addEventListener('click', this.onPanelClose);
    }

    #loadColor() {
        let color = window.getComputedStyle(this).backgroundColor.replace(/[rgb\tgba\(\)]| /gi, '').split(',');
        let R = (parseInt(color[0]) + 1) / 256;
        let G = (parseInt(color[1]) + 1) / 256;
        let B = (parseInt(color[2]) + 1) / 256;
        
        let min = Math.min(R, G, B);
        let max = Math.max(R, G, B);
        let chroma = max - min;

        let L = (max + min) / 2;
        let S = 0;
        let H = 0;

        if (chroma != 0) {
            S = chroma / (1 - Math.abs(2 * L - 1));

            switch(max) {
                case R:
                    H = ((G - B) / chroma) % 6;
                break;

                case G:
                    H = (B - R) / chroma + 2;
                break;

                case B:
                    H = (R - G) / chroma + 4;
                break;
            }

            H = H * 60;
            if (H < 0) H += 360;
        }

        S = S * 100;
        L = L * 100;

        this.#H = parseFloat(H.toFixed(2));
        this.#S = parseFloat(S.toFixed(2));
        this.#L = parseFloat(L.toFixed(2));
        this.#A = parseFloat(color[3] || 1);

        
    }

    #setHuePoint() {
        
    }

    onPanelClose(e) {
        if (e.target.closest(UIColorPicker.is)) return;
        this.shadowRoot.removeChild(this.#panel);
        document.querySelector('html').removeEventListener('click', this.onPanelClose);
    }


    static get is() {
        return 'ui-color-picker';
    }
}

customElements.define(UIColorPicker.is, UIColorPicker);