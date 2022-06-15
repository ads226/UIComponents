class Color {
    #H = 0;
    #S = 0;
    #V = 0;
    #A = 1;

    constructor() {

    }

    get hex() {
        return Color.rgb2hex(...this.rgb);
    }

    set hex(value) {
        [this.#H, this.#S, this.#V, this.#A] = Color.rgb2hsv(...Color.hex2rgb(value));
    }

    get rgb() {
        return Color.hsv2rgb(this.#H, this.#S, this.#V, this.#A);
    }

    set rgb(values) {
        [this.#H, this.#S, this.#V, this.#A] = Color.rgb2hsv(...values);
    }

    get hsl() {
        return Color.rgb2hsl(...this.rgb);
    }

    set hsl(values) {
        [this.#H, this.#S, this.#V, this.#A] = Color.rgb2hsv(...Color.hsl2rgb(...values));
    }

    static hex2rgb(hex) {
        const rgb = (hex.length === 3) ? hex.match( /[a-f\d]/gi ) : hex.match( /[a-f\d]{2}/gi );
        if (rgb.length === 3) rgb.push('ff');

        rgb.forEach((str, idx, arr) => {
            if (str.length === 1) str = str + str;

            arr[idx] = parseInt(str, 16);
            if (idx === 3) arr[idx] /= 255;
        });

        return rgb;
    }

    static rgb2hex(r, g, b, a = 1) {
        let hex = '#';
        hex += Math.floor(r).toString(16).padStart(2, '0');
        hex += Math.floor(g).toString(16).padStart(2, '0');
        hex += Math.floor(b).toString(16).padStart(2, '0');
        if (a < 1) hex += Math.floor(a * 255).toString(16).padStart(2, '0');

        return hex;
    }

    static rgb2hsv(r, g, b, a = 1) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;

        let v = max;
        let s = (max == 0) ? 0 : d / max;
        let h = 0;

        if (max != min) {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;

                case g:
                    h = (b - r) / d + 2;
                    break;

                case b:
                    h = (r - g) / d + 4;
                    break;

                default :
                    throw('An impossible situation!!');
            }

            h /= 6;
        }

        return [h, s, v, a];
    }

    static hsv2rgb(h, s, v, a = 1) {
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        let r;
        let g;
        let b;

        switch (i % 6) {
            case 0:
                [r, g, b] = [v, t, p];
                break;

            case 1:
                [r, g, b] = [q, v, p];
                break;

            case 2:
                [r, g, b] = [p, v, t];
                break;

            case 3:
                [r, g, b] = [p, q, v];
                break;

            case 4:
                [r, g, b] = [t, p, v];
                break;

            case 5:
                [r, g, b] = [v, p, q];
                break;

            default :
                throw('An impossible situation!!');
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
    }

    static rgb2hsl(r, g, b, a = 1) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;

        let l = (max + min) / 2;
        let s = 0;
        let h = 0;

        if (max != min) {
            s = (1 > 0.5) ? d / (2 - max - min) : d / (max + min);
            s = d / (1 - Math.abs(2 * l - 1));

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;

                case g:
                    h = (b - r) / d + 2;
                    break;

                case b:
                    h = (r - g) / d + 4;
                    break;

                default :
                    throw('An impossible situation!!');
            }
        }

        return [Math.round(h * 60), parseFloat(s.toFixed(2)), parseFloat(l.toFixed(2)), a];
    }

    static hsl2rgb(h, s, l, a = 1) {
        if (h > 1) h /= 360;

        const hue2rgb = function(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t * 6 < 1) return p + (q - p) * 6 * t;
            if (t * 2 < 1) return q;
            if (t * 3 < 2) return p + (q - p) * (2 / 3 - t) * 6;
            
            return p;
        }

        const q = (l <= 0.5) ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        const r = hue2rgb(p, q, h + 1 / 3);
        const g = hue2rgb(p, q, h);
        const b = hue2rgb(p, q, h - 1 / 3);

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
    }
}


export class UIColorPickerPanel extends HTMLElement {
    #panel = document.createElement('div');
    #color = new Color();
    #type = 'hex';
    #point;
    #useAlpha = false;

    constructor() {
        super();

        const style = document.createElement('style');
        style.textContent = `
            :host,
            :host * {
                margin: 0;
                padding: 0;
                border: 0;
                box-sizing: border-box;
            }

            :host {
                --width: 240px;
                --height: 250px;
                --padding: 12px;

                --color-bg: hsl(200, 15%, 25%, 1.00);
                --color-line: hsl(200, 20%, 35%, 1.00);
                --color-text: hsl(0, 0%, 80%, 0.75);
                --color-focus: hsl(200, 80%, 40%, 1.00);
                --color-btn: hsl(200, 50%, 35%, 1.00);
                --color-input: hsl(200, 30%, 7%, 0.75);

                --shadow-bg: 0 4px 10px hsl(0, 0%, 0%, 0.20), 0 2px 6px hsl(0, 0%, 0%, 0.30);
                --shadow-point: 0 2px 3px hsl(0, 0%, 0%, 0.3);

                position: fixed;
                z-index: 99999999;
                padding: 10px 10px 0 !important;
                transform: translate(-10px, -10px);
            }

            #panel {
                display: flex;
                flex-flow: column;
                align-items: center;
                gap: 12px;
                width: var(--width);
                height: var(--height);
                padding-bottom: var(--padding);
                background-color: var(--color-bg);
                box-shadow: var(--shadow-bg);
            }

            .btn {
                font-size: 11px;
                color: hsl(0, 0%, 100%, 0.75);
                border: 1px solid var(--color-line);
                background-color: var(--color-btn);
                cursor: pointer;
            }
            .btn:hover {
                filter: brightness(1.3);
            }

            .hide {
                display: none !important;
            }
        `;

        // palette
        style.textContent += `
            #palette {
                position: relative;
                width: 100%;
                flex: 1;
                background: linear-gradient(
                    to right,
                    hsl(0, 100%, 100%, 1),
                    hsl(0, 100%, 50%, 1)
                );
                cursor: pointer;
            }

            #saturation {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    hsl(0, 100%, 0%, 0),
                    hsl(0, 100%, 0%, 1)
                );
            }

            #hue, #alpha {
                position: relative;
                width: calc(100% - var(--padding) * 2);
                height: 14px;
                cursor: pointer;
            }

            #hue {
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

            #alpha {
                // display: none;
            }

            #alpha #dim {
                background: linear-gradient(
                    to right,
                    hsl(0, 100%, 0%, 0),
                    hsl(0, 100%, 0%, 1)
                );
            }

            .point {
                position: absolute;
                width: 14px;
                height: 14px;
                border: 1px solid #fff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: var(--shadow-point);
                pointer-events: none;
                z-index: 1;
            }

            #alpha #dim,
            .svg_wrap,
            .color {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }

            svg {
                position: absolute;
                top: 0;
                left: 0;
                pointer-events: none;
            }
        `;
        
        // Values
        style.textContent += `
            #values {
                display: grid;
                grid-template-columns: 50px auto 20px;
                grid-gap: 4px 12px;
                width: calc(100% - var(--padding) * 2);
            }

            #values input[type=radio] {
                display: none;
            }

            #value_color {
                position: relative;
                grid-row: span 2;
                width: 50px;
                height: 50px;
                border-radius: 100px;
                background-color: #000;
                overflow: hidden;
            }

            #type_tab {
                grid-column: span 2;
                display: flex;
            }

            #type_tab > input:not(:checked) + label {
                cursor: pointer;
            }

            #type_tab > input + label {
                flex: 1;
                display: flex;
                justify-content: center;

                font-size: 10px;
                line-height: 16px;
                color: var(--color-text);
                border-top: 1px solid;
                border-bottom: 1px solid;
                border-color: var(--color-line);
            }

            #type_tab > input + label:nth-of-type(1) {
                border-radius: 3px 0 0 3px;
                border-left: 1px solid;
                border-right: 1px solid;
                border-color: var(--color-line);
            }

            #type_tab > input + label:nth-last-of-type(1) {
                border-radius: 0 3px 3px 0;
                border-left: 1px solid;
                border-right: 1px solid;
                border-color: var(--color-line);
            }

            #type_tab > input:checked + label {
                color: #fff;
                border-color: var(--color-focus);
                background-color: var(--color-focus);
            }

            #value_wrap .value {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                grid-gap: 0 4px;
            }

            #value_wrap .value input[type=text] {
                width: 100%;
                height: 19px;
                font-size: 11px;
                text-align: center;
                color: var(--color-text);
                border: 1px solid var(--color-line);
                background-color: var(--color-input);
                outline: none;
            }

            #value_wrap .value > div {
                width: 100%;
                font-size: 10px;
                line-height: 10px;
                text-align: center;
                color: var(--color-text);
            }

            
            /*

            #value_color {
                width: 32px;
                height: 32px;
                border-radius: 100px;
                background-color: #000
            }

            #value_wrap input[type=radio] {
                display: none;
            }

            #value_wrap input[type=radio] + div {
                display: none;
            }

            #value_wrap input[type=radio]:checked + div {
                display: grid;
            }

            #value_wrap .value {
                grid-template-columns: repeat(4, 1fr);
                grid-gap: 2px 4px;
            }
            #value_wrap .value:nth-of-type(1) {
                grid-template-columns: repeat(1, 1fr);
            }

            #value_wrap .value input[type=text] {
                width: 100%;
                height: 21px;
                font-size: 11px;
                text-align: center;
                color: var(--color-text);
                border: 1px solid var(--color-line);
                background-color: var(--color-input);
                outline: none;
            }

            #value_wrap .value > div {
                width: 100%;
                font-size: 10px;
                line-height: 10px;
                text-align: center;
                color: var(--color-text);
            }

            #btn_copy {
                font-size: 10px;
                line-height: 32px;
                height: 32px;
                text-align: center;
                border-radius: 4px;
            }
            */
        `;
        
        style.textContent += `
            #btns {
                display: flex;
                justify-content: space-between;
                width: calc(100% - var(--padding) * 2);
            }

            #btns .btn_wrap {
                display: flex;
                gap: 8px;
            }

            #btns button {
                width: 48px;
                height: 23px;
                font-size: 11px;
                font-weight: 600;
                color: hsl(0, 0%, 100%, 0.75);
                border: 1px solid var(--color-line);
                background-color: var(--color-btn);
                cursor: pointer;
            }
            #btns button:hover {
                filter: brightness(1.3);
            }
        `;

        const panelHtml = `
        <div id="palette">
            <div id="saturation"></div>
            <div id="color_point" class="point"></div>
        </div>
        <div id="hue">
            <div id="hue_point" class="point"></div>
        </div>
        <div id="alpha">
            <div class="svg_wrap">
                <svg></svg>
            </div>
            <div id="dim"></div>
            <div id="alpha_point" class="point"></div>
        </div>
        <div id="values">
            <div id="value_color">
                <svg class="point_bg"></svg>
                <div class="color"></div>
            </div>
            <div id="type_tab">
                <input type="radio" name="type" id="type_hex" checked />
                <label for="type_hex">HEX</label>
                <input type="radio" name="type" id="type_rgb" />
                <label for="type_rgb">RGB</label>
                <input type="radio" name="type" id="type_hsl" />
                <label for="type_hsl">HSL</label>
            </div>
            <div id="value_wrap">
                <div class="value">
                    <div>R</div>
                    <div>G</div>
                    <div>B</div>
                    <div>A</div>
                    <input type="text" id="value_rgb_r" />
                    <input type="text" id="value_rgb_g" />
                    <input type="text" id="value_rgb_b" />
                    <input type="text" id="value_rgb_a" />
                </div>
            </div>
            <div id="btn_copy" class="btn">
                <!--
                <svg viewBox="0 0 20 20">
                    <path d="M15.5,1h-7C7.1,1,6,2.1,6,3.5V5H4C2.9,5,2,5.9,2,7v10c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2v-2h1.5c1.4,0,2.5-1.1,2.5-2.5v-9
                        C18,2.1,16.9,1,15.5,1z M17,12.5c0,0.8-0.7,1.5-1.5,1.5H14V7c0-1.1-0.9-2-2-2H7V3.5C7,2.7,7.7,2,8.5,2h7C16.3,2,17,2.7,17,3.5V12.5z
                        "/>
                </svg>
                -->
            </div>

            





        
            <!--
            <div id="type_tab">
                <input type="radio" name="type" id="type_hex" checked />
                <label for="type_hex">HEX</label>
                <input type="radio" name="type" id="type_rgb" />
                <label for="type_rgb">RGB</label>
                <input type="radio" name="type" id="type_hsl" />
                <label for="type_hsl">HSL</label>
            </div>
            <div id="value_color"></div>
            <div id="value_wrap">
                <input type="radio" name="value" for="type_hex" checked />
                <div class="value">
                    <input type="text" id="value_hex" />
                    <div>HEX</div>
                </div>
                <input type="radio" name="value" for="type_rgb" />
                <div class="value">
                    <input type="text" id="value_rgb_r" />
                    <input type="text" id="value_rgb_g" />
                    <input type="text" id="value_rgb_b" />
                    <input type="text" id="value_rgb_a" />
                    <div>R</div>
                    <div>G</div>
                    <div>B</div>
                    <div>A</div>
                </div>
                <input type="radio" name="value" for="type_hsl" />
                <div class="value">
                    <input type="text" id="value_hsl_r" />
                    <input type="text" id="value_hsl_g" />
                    <input type="text" id="value_hsl_b" />
                    <input type="text" id="value_hsl_a" />
                    <div>H</div>
                    <div>S</div>
                    <div>L</div>
                    <div>A</div>
                </div>
            </div>
            <div id="btn_copy" class="btn">COPY</div>
            -->

        </div>
        <div id="btns">
            <div class="btn_wrap">
                <button id="btn_reset">초기화</button>
            </div>
            <div class="btn_wrap">
                <button id="btn_done">적용</button>
                <button id="btn_close">닫기</button>
            </div>
        </div>
        `;
        this.#panel.id = 'panel';
        this.#panel.innerHTML = panelHtml;

        this.#panel.querySelectorAll('.point').forEach((point) => {
            point.innerHTML = `
                <svg class="point_bg"></svg>
                <div class="color"></div>
            `;
        });

        this.#panel.querySelectorAll('svg.point_bg').forEach((svg) => {
            svg.outerHTML = `
                <svg viewBox="0 0 1000 1000" width="1000" height="1000">
                    <defs>
                        <pattern id="pattern" viewBox="0 0 20 20" width="0.8%" height="0.8%">
                            <rect style="fill: #FFFFFF;" width="10" height="10" x="0" y="0"/>
                            <rect style="fill: #D8D8D8;" width="10" height="10" x="10" y="0"/>
                            <rect style="fill: #D8D8D8;" width="10" height="10" x="0" y="10"/>
                            <rect style="fill: #FFFFFF;" width="10" height="10" x="10" y="10"/>
                        </pattern>
                    </defs>

                    <rect fill="url(#pattern)" width="1000" height="1000"/>
                </svg>
            `;
        });

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(style, this.#panel);
    }

    connectedCallback() {}

    disconnectedCallback() {}

    attributeChangedCallback(attr, oldValue, newValue) {}

    static get observedAttributes() {
        return ['type', 'alpha', 'color'];
    }

    static get ON_CLICK_DONE() { return 'onClickDone'; }
    static get ON_CLICK_CLOSE() { return 'onClickDone'; }
    
    static get ON_OPENED() { return 'onOpened'; }
    static get ON_CLOSED() { return 'onClosed'; }

    static get ver() { return '1.1.0'; }
    static get is() { return 'ui-color-picker-panel'; }
}

customElements.define(UIColorPickerPanel.is, UIColorPickerPanel);

