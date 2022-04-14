class UIColorPicker extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            :host {
                --width: 240px;
                --height: 200px;
                --padding: 8px;

                --color-bg: hsl(200, 20%, 20%, 1.00);
                --color-border: hsl(200, 20%, 30%, 1.00);
                --color-line: hsl(200, 30%, 35%, 1.00);
                --color-focus: hsl(200, 100%, 50%, 1.00);
                --color-btn: hsl(200, 60%, 35%, 1.00);
                --color-text: hsl(0, 0%, 80%, 0.75);
                --color-ui: hsl(200, 30%, 7%, 0.75);

                --shadow: 0 5px 10px hsl(0, 0%, 0%, 0.15), 0 2px 5px hsl(0, 0%, 0%, 0.25);

                position: relative;
                cursor: pointer;
                font-size: inherit;
                color: inherit;
            }
            :host,
            :host * {
                margin: 0;
                padding: 0;
                border: 0;
                box-sizing: border-box;
                user-select: none;
            }

            #btn {
                display: flex;
                justify-content: space-between;
            }
            :host button {
                width: 50px;
                height: 23px;
                font-size: 12px;
                color: hsl(0, 0%, 100%, 0.75);

                border: 1px solid var(--color-line);
                background-color: var(--color-btn);
                cursor: pointer;
            }
            :host button:hover {
                filter: brightness(1.3);
            }

            #value {
                display: flex;
                gap: 8px;
            }

            #tab_wrap {
                flex: 1 0 100px;
                display: table;
	            border-collapse: collapse;
            }

            :host input[type=radio] {
                display: none;
            }

            :host input[type=radio] + label {
                display: table-cell;
                height: 19px;
                font-size: 11px;
                text-align: center;
                vertical-align: middle;
                color: var(--color-text);
                border: 1px solid var(--color-line);
                cursor: pointer;
            }
            :host input[type=radio]:checked + label {
                color: #fff;
                border: 1px solid var(--color-focus);
                background-color: var(--color-focus);
                cursor: default;
            }

            #value input[type=text] {
                flex: 1 0 100px;
                
                font-size: 11px;
                line-height: 19px;
                border: 1px solid var(--color-line);
                background-color: var(--color-ui);
            }


            #panel {
                position: absolute;
                top: 100%;
                left: 0;

                display: flex;
                flex-flow: column;
                gap: 4px;

                width: var(--width);
                height: var(--height);
                padding: var(--padding);
                cursor: default;


                border: 1px solid var(--color-border);
                background-color: var(--color-bg);
                box-shadow: var(--shadow);
            }
        `;

        const panel = document.createElement('div');
        panel.id = 'panel';
        panel.innerHTML = `
            <div id="color">
                <div id="saturation"></div>
                <div id="color_point" class="point"></div>
            </div>
            <div id="hue">
                <div id="hue_point" class="point"></div>
            </div>
            <div id="value">
                <div id="tab_wrap">
                    <input type="radio" name="type" id="type_hex" checked />
                    <label for="type_hex">HEX</label>
                    <input type="radio" name="type" id="type_rgb" />
                    <label for="type_rgb">RGB</label>
                    <input type="radio" name="type" id="type_hsl" />
                    <label for="type_hsl">HSL</label>
                </div>
                <input type="text" id="result" value="" />
            </div>
            <div id="btn">
                <div class="btn_wrap">
                    <button id="btn_reset">초기화</button>
                </div>
                <div class="btn_wrap">
                    <button id="btn_done">확인</button>
                    <button id="btn_cancel">취소</button>
                </div>
            </div>
        `;


        shadow.append(style, panel);
    }


    static get is() {
        return 'ui-color-picker';
    }
}

customElements.define(UIColorPicker.is, UIColorPicker);