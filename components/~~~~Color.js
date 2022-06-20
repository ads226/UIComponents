class Color {
    #H = 0;
    #S = 0;
    #V = 0;
    #A = 1;

    constructor(colorValue) {
        this.init(colorValue);
    }

    init(colorValue) {
        if (colorValue === undefined) return;
        
        let color;
        
        if (typeof colorValue === 'string') {
            colorValue = colorValue.toLowerCase();

            if (colorValue.includes('#')) {
                color = Color.rgb2hsv(...Color.hex2rgb(colorValue));
            } else if (colorValue.includes('rgb')) {
                color = colorValue.trim().replace(/[rgb\rgba\(\)]| /gi, '').split(',');
                color = Color.rgb2hsv(...color);
            } else if (colorValue.includes('hsl')) {
                console.log('hsl');
            }
        } else if (Array.isArray(colorValue)) {
            console.log(colorValue);
        }

        [this.#H, this.#S, this.#V, this.#A] = color;
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
    get rgbObj() {
        const rgb = Color.hsv2rgb(this.#H, this.#S, this.#V, this.#A);
        return { r:rgb[0], g:rgb[1], b:rgb[2], a:rgb[3] }
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

    get h() { return this.#H; }
    set h(value) { this.#H = Math.min(Math.max(value, 0), 1); }
    
    get s() { return this.#S; }
    set s(value) { this.#S = Math.min(Math.max(value, 0), 1); }
    
    get v() { return this.#V; }
    set v(value) { this.#V = Math.min(Math.max(value, 0), 1); }
    
    get a() { return this.#A; }
    set a(value) { this.#A = Math.min(Math.max(value, 0), 1); }

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


class UIColorPickerPanel extends HTMLElement {
    #panel = document.createElement('div');
    #color = new Color();
    #type = 'hex';
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
                --height: 260px;
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
        `;
        
        // panel & common
        style.textContent += `
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
                height: 10px;
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

            #alpha #dim {
                background: linear-gradient(
                    to right,
                    hsl(0, 100%, 0%, 0),
                    hsl(0, 100%, 0%, 1)
                );
            }

            .point {
                position: absolute;
                width: 10px;
                height: 10px;
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
                pointer-events: none;
            }
        `;
        
        // values
        style.textContent += `
            #values {
                display: grid;
                grid-template-columns: 50px auto;
                grid-gap: 4px 12px;
                width: calc(100% - var(--padding) * 2);
                margin: 6px 0;
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

            #value_tab {
                display: flex;
            }

            #value_tab input[type=radio] {
                display: none;
            }

            #value_tab input[type=radio]:not(:checked) + label {
                cursor: pointer;
            }

            #value_tab input[type=radio] + label {
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

            #value_tab input[type=radio] + label:nth-of-type(1) {
                border-radius: 3px 0 0 3px;
                border-left: 1px solid;
                border-right: 1px solid;
                border-color: var(--color-line);
            }

            #value_tab input[type=radio] + label:nth-last-of-type(1) {
                border-radius: 0 3px 3px 0;
                border-left: 1px solid;
                border-right: 1px solid;
                border-color: var(--color-line);
            }

            #value_tab input[type=radio]:checked + label {
                color: #fff;
                border-color: var(--color-focus);
                background-color: var(--color-focus);
            }

            #value_input .value {
                display: flex;
                gap: 4px;
            }

            #value_input .value > div {
                flex: 1;
                font-size: 10px;
                line-height: 8px;
                text-align: center;
                color: var(--color-text);
                margin-bottom: 1px;
            }

            #value_input .value input[type=text] {
                flex: 1;
                width: 1px;
                height: 19px;
                font-size: 11px;
                text-align: center;
                color: var(--color-text);
                border: 1px solid var(--color-line);
                background-color: var(--color-input);
                outline: none;
            }

            #value_input .value:first-child {
                grid-template-columns: repeat(1, 1fr);
            }

        `;
        
        // btns
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
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 26px;
                height: 26px;
                fill: hsl(0, 0%, 100%, 0.75);
                border: 1px solid var(--color-line);
                background-color: var(--color-btn);
                cursor: pointer;
            }
            #btns button:hover {
                filter: brightness(1.3);
            }

            #btns button svg {
                width: 16px;
                height: 16px;
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
            <div id="alpha" class="alpha">
                <div class="svg_wrap">
                    <svg class="point_bg"></svg>
                </div>
                <div id="dim"></div>
                <div id="alpha_point" class="point"></div>
            </div>
        `;

        const valuesHTML = `
            <div id="values">
                <div id="value_color">
                    <svg class="point_bg"></svg>
                    <div class="color"></div>
                </div>
                <div id="value_tab">
                    <input type="radio" name="type" id="type_hex" checked />
                    <label for="type_hex">HEX</label>
                    <input type="radio" name="type" id="type_rgb" />
                    <label for="type_rgb">RGB</label>
                    <input type="radio" name="type" id="type_hsl" />
                    <label for="type_hsl">HSL</label>
                </div>
                <div id="value_input">
                    <div class="value" for="type_hex">
                        <div>HEX</div>
                    </div>
                    <div class="value" for="type_hex">
                        <input type="text" id="value_hex" />
                    </div>

                    <div class="value hide" for="type_rgb">
                        <div>R</div>
                        <div>G</div>
                        <div>B</div>
                        <div class="alpha">A</div>
                    </div>
                    <div class="value hide" for="type_rgb">
                        <input type="text" id="value_rgb_r" />
                        <input type="text" id="value_rgb_g" />
                        <input type="text" id="value_rgb_b" />
                        <input type="text" id="value_rgb_a" class="alpha" />
                    </div>
                    <div class="value hide" for="type_hsl">
                        <div>H</div>
                        <div>S</div>
                        <div>L</div>
                        <div class="alpha">A</div>
                    </div>
                    <div class="value hide" for="type_hsl">
                        <input type="text" id="value_hsl_h" />
                        <input type="text" id="value_hsl_s" />
                        <input type="text" id="value_hsl_l" />
                        <input type="text" id="value_hsl_a" class="alpha" />
                    </div>
                </div>
            </div>
        `;

        const btnsHtml = `
            <div id="btns">
                <div class="btn_wrap">
                    <button id="btn_reset" class="btn" title="초기화">
                        <svg viewBox="0 0 20 20">
                            <path d="M15.7,5c-1.2-1.2-2.7-2-4.3-2.2L11.5,2c0-0.5-0.4-0.8-0.8-0.6L7.4,3C7,3.2,7,3.7,7.3,4l2.8,2.2c0.4,0.3,0.9,0,0.9-0.4
                                l0.1-0.9c1.2,0.2,2.2,0.8,3.1,1.7c2.4,2.4,2.4,6.2,0,8.6c-1.1,1.1-2.7,1.8-4.3,1.8S6.9,16.1,5.7,15c-2.4-2.4-2.4-6.2,0-8.6
                                c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0c-3.1,3.1-3.1,8.2,0,11.4c1.5,1.5,3.5,2.4,5.7,2.4s4.2-0.8,5.7-2.4C18.8,13.3,18.8,8.2,15.7,5z"/>
                        </svg>
                    </button>
                </div>
                <div class="btn_wrap">
                    <button id="btn_copy" class="btn" title="복사">
                        <svg viewBox="0 0 20 20">
                            <path d="M15,1.2H9C7.5,1.2,6.2,2.5,6.2,4v1H4C2.9,5,2,5.9,2,7v10c0,1.1,0.9,2,2,2h7c1.1,0,2-0.9,2-2v-2.2h2c1.5,0,2.8-1.2,2.8-2.8V4
                                C17.8,2.5,16.5,1.2,15,1.2z M16.2,12c0,0.7-0.6,1.2-1.2,1.2h-2V7c0-1.1-0.9-2-2-2H7.8V4c0-0.7,0.6-1.2,1.2-1.2h6
                                c0.7,0,1.2,0.6,1.2,1.2V12z"/>
                        </svg>
                    </button>
                    <button id="btn_done" class="btn" title="적용">
                        <svg viewBox="0 0 20 20">
                            <path d="M8.5,17.6c-0.4,0-0.8-0.2-1.1-0.5l-5-5.5C1.8,11,1.8,10.1,2.4,9.5C3,9,4,9,4.6,9.6l3.7,4.1l7-10.6c0.5-0.7,1.4-0.9,2.1-0.4
                                c0.7,0.5,0.9,1.4,0.4,2.1L9.7,16.9c-0.3,0.4-0.7,0.6-1.1,0.7C8.5,17.6,8.5,17.6,8.5,17.6z"/>
                        </svg>
                    </button>
                    <button id="btn_close" class="btn" title="취소">
                        <svg viewBox="0 0 20 20">
                            <path d="M11.8,10l5.6-5.6c0.5-0.5,0.5-1.3,0-1.8s-1.3-0.5-1.8,0L10,8.2L4.4,2.7C4,2.2,3.2,2.2,2.7,2.7S2.2,4,2.7,4.4L8.2,10
                                l-5.6,5.6c-0.5,0.5-0.5,1.3,0,1.8c0.2,0.2,0.6,0.4,0.9,0.4s0.6-0.1,0.9-0.4l5.6-5.6l5.6,5.6c0.2,0.2,0.6,0.4,0.9,0.4
                                s0.6-0.1,0.9-0.4c0.5-0.5,0.5-1.3,0-1.8L11.8,10z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        this.#panel.id = 'panel';
        this.#panel.innerHTML = panelHtml + valuesHTML + btnsHtml;

        this.#panel.querySelectorAll('.point').forEach(point => {
            point.innerHTML = `
                <svg class="point_bg"></svg>
                <div class="color"></div>
            `;
        });

        this.#panel.querySelectorAll('svg.point_bg').forEach(svg => {
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

        this.#panel.querySelectorAll('[name=type]').forEach(input => {
            input.values = this.#panel.querySelectorAll(`.value`);
            input.onchange = function() {
                this.values.forEach(value => {
                    value.classList.toggle('hide', value.getAttribute('for') !== this.id);
                })
            }
        });

        this.#setUseAlpha();

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(style, this.#panel);
    }

    connectedCallback() {
        
    }

    disconnectedCallback() {}

    init(colorString) {
        this.#color.init(colorString);

        this.#setPalettePosition();
        this.#setHuePosition();
        this.#setAlphaPosition();
        this.#setPaletteColor();
        this.#setPointColor();
    }

    #setPalettePosition(x, y) {
        const point = this.#panel.querySelector('#color_point');
        const parentRect = point.closest('#palette').getBoundingClientRect();
        const rangeX = parentRect.width;
        const rangeY = parentRect.height;
        const correct = point.getBoundingClientRect().width / 2;

        if (typeof x === 'number') {
            x = Math.min(Math.max(x, 0), rangeX);
            this.#color.s = x / rangeX;
        } else {
            x = rangeX * this.#color.s;
        }

        if (typeof y === 'number') {
            y = Math.min(Math.max(y, 0), rangeY);
            this.#color.v = 1 - y / rangeY;
        } else {
            y = rangeY - rangeY * this.#color.v;
        }

        point.style.left = x - correct + 'px';
        point.style.top = y - correct + 'px';
    }

    #setHuePosition(x) {
        const point = this.#panel.querySelector('#hue_point');
        const range = point.closest('#hue').getBoundingClientRect().width;
        const correct = point.getBoundingClientRect().width / 2;

        if (typeof x === 'number') {
            x = Math.min(Math.max(x, 0), range);
            this.#color.h = x / range;
        } else {
            x = range * this.#color.h;
        }

        point.style.left = x - correct + 'px';
    }

    #setAlphaPosition(x) {
        const point = this.#panel.querySelector('#alpha_point');
        const panelStyle = window.getComputedStyle(this.#panel);
        const range = this.#panel.clientWidth - parseInt(panelStyle.getPropertyValue('--padding')) * 2;
        const correct = parseInt(window.getComputedStyle(point).width) / 2;

        if (typeof x === 'number') {
            x = Math.min(Math.max(x, 0), range);
            this.#color.a = x / range;
        } else {
            x = range * this.#color.a;
        }

        point.style.left = x - correct + 'px';
    }

    #setPaletteColor() {
        const h = this.#color.h * 360;
        const { r, g, b } = this.#color.rgbObj;

        this.#panel.querySelector('#palette').style.background = `
            linear-gradient(
                to right,
                hsl(${ h }, 100%, 100%, 1),
                hsl(${ h }, 100%, 50%, 1)
            )
        `;

        this.#panel.querySelector('#alpha #dim').style.background = `
            linear-gradient(
                to right,
                rgba(${ r }, ${ g }, ${ b }, 0),
                rgba(${ r }, ${ g }, ${ b }, 1)
            )
        `;
    }

    #setPointColor() {
        const hex = this.#color.hex;
        const rgb = this.#color.rgb;
        const hsl = this.#color.hsl;

        this.#panel.querySelectorAll('.point .color, #value_color .color').forEach((point) => {
            point.style.backgroundColor = hex;
        });

        this.#panel.querySelector('#value_hex').value = hex;
        this.#panel.querySelector('#value_rgb_r').value = rgb[0];
        this.#panel.querySelector('#value_rgb_g').value = rgb[1];
        this.#panel.querySelector('#value_rgb_b').value = rgb[2];
        this.#panel.querySelector('#value_rgb_a').value = rgb[3];
        this.#panel.querySelector('#value_hsl_h').value = hsl[0];
        this.#panel.querySelector('#value_hsl_s').value = hsl[1] * 100 + '%';
        this.#panel.querySelector('#value_hsl_l').value = hsl[2] * 100 + '%';
        this.#panel.querySelector('#value_hsl_a').value = hsl[3];
    }

    #setUseAlpha(used = false) {
        this.#useAlpha = !!used;

        this.#panel.querySelectorAll('.alpha').forEach(item => {
            item.classList.toggle('hide', !this.#useAlpha);
        });
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'type') {
            const type = newValue.toLowerCase();
            this.#type = ['hex', 'rgb', 'hsl'].includes(type) ? type : 'hex';
            this.#panel.querySelector('#type_' + type).click();
        }

        if (attr === 'alpha') this.#setUseAlpha(this.hasAttribute('alpha'));

        if (attr === 'color') this.init(newValue);
    }

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

