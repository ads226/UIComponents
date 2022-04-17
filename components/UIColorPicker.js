class UIColorPicker extends HTMLElement {
    #knob = document.createElement('div');
    #panel = document.createElement('div');

    #H = 0;
    #S = 0;
    #V = 0;
    #A = 0;

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
                --width: 260px;
                --height: 250px;
                --padding: 12px;

                --color-bg: hsl(200, 15%, 25%, 1.00);
                --color-line: hsl(200, 20%, 35%, 1.00);
                --color-text: hsl(0, 0%, 80%, 0.75);
                --color-focus: hsl(200, 80%, 40%, 1.00);
                --color-btn: hsl(200, 50%, 35%, 1.00);

                --shadow-bg: 0 4px 10px hsl(0, 0%, 0%, 0.20), 0 2px 6px hsl(0, 0%, 0%, 0.30);
                --shadow-point: 0 2px 3px hsl(0, 0%, 0%, 0.3);

                position: relative;
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
                height: var(--height);
                padding-bottom: var(--padding);
                background-color: var(--color-bg);
                box-shadow: var(--shadow-bg);
            }

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

            #alpha #dim {
                background: linear-gradient(
                    to right,
                    hsl(0, 100%, 0%, 0),
                    hsl(0, 100%, 0%, 1)
                );
            }

            #values {
                display: flex;
                gap: 16px;
                width: calc(100% - var(--padding) * 2);
                height: 21px;
            }

            .type_wrap {
                display: flex;
                width: 90px;
            }

            .type_wrap input {
                display: none;
            }

            .type_wrap input + label {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;

                font-size: 10px;
                color: var(--color-text);
                border-top: 1px solid;
                border-bottom: 1px solid;
                border-color: var(--color-line);
                cursor: pointer;
            }
            .type_wrap input + label:nth-of-type(1) {
                border-radius: 3px 0 0 3px;
                border-left: 1px solid;
                border-right: 1px solid;
                border-color: var(--color-line);
            }
            .type_wrap input + label:nth-of-type(3) {
                border-radius: 0 3px 3px 0;
                border-left: 1px solid;
                border-right: 1px solid;
                border-color: var(--color-line);
            }

            .type_wrap input:checked + label {
                color: #fff;
                border-color: var(--color-focus);
                background-color: var(--color-focus);
                cursor: default;
            }

            .value_wrap {
                flex: 1;
                display: flex;
            }

            .value_wrap input {
                width: 100%;
                outline: none;
                font-size: 12px;
                color: #000;
                text-align: center;
                border: 1px solid var(--color-line);
            }

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
            .point .color {
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
            <div id="alpha">
                <div class="svg_wrap">
                    <svg></svg>
                </div>
                <div id="dim"></div>
                <div id="alpha_point" class="point"></div>
            </div>
            <div id="values">
                <div class="type_wrap">
                    <input type="radio" name="type" id="type_hex" />
                    <label for="type_hex">HEX</label>
                    <input type="radio" name="type" id="type_rgb" />
                    <label for="type_rgb">RGB</label>
                    <input type="radio" name="type" id="type_hsl" />
                    <label for="type_hsl">HSL</label>
                </div>
                <div class="value_wrap">
                    <input type="text" id="txt_value" value="#000000" readonly />
                </div>
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

        this.#panel.querySelectorAll('.point').forEach((point) => {
            point.innerHTML = `
                <svg></svg>
                <div class="color"></div>
            `;
        });

        this.#panel.querySelectorAll('svg').forEach((svg) => {
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

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.done = this.done.bind(this);

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(style, this.#knob);
    }

    connectedCallback() {
        this.#knob.addEventListener('click', this.open);
    }

    disconnectedCallback() {
        this.#knob.removeEventListener('click', this.open);
    }

    open(e) {
        console.log('+++++++++++++++ open', e.target);
        const panel = this.shadowRoot.querySelector('#panel');

        if (!panel) {
            this.#panel.querySelector('#btn_reset').addEventListener('click', this.open);
            this.#panel.querySelector('#btn_done').addEventListener('click', this.done);
            this.#panel.querySelector('#btn_close').addEventListener('click', this.close);

            this.shadowRoot.append(this.#panel);
            document.querySelector('html').addEventListener('mousedown', this.close);
        }

        this.#loadColor();
    }

    close(e) {
        console.log('+++++++++++++++ close', e.target);
        if (e && e.target.closest(UIColorPicker.is)) return;

        const panel = this.shadowRoot.querySelector('#panel');
        if (!panel) return;

        panel.querySelector('#btn_reset').removeEventListener('click', this.open);
        panel.querySelector('#btn_done').removeEventListener('click', this.done);
        panel.querySelector('#btn_close').removeEventListener('click', this.close);

        this.shadowRoot.removeChild(panel);
        document.querySelector('html').removeEventListener('mousedown', this.close);
    }

    done(e) {
        console.log('+++++++++++++++ done', e.target);
        const panel = this.shadowRoot.querySelector('#panel');
        if (!panel) return;

        this.close();
    }


    #loadColor() {
        console.log('+++++++++++++++ loadColor');
        let color = window.getComputedStyle(this).backgroundColor;
        let hsv = UIColorPicker.getRGBtoHSV(...color.replace(/[rgb\rgba\(\)]| /gi, '').split(','));
        console.log('color :', color, ', hsv :', hsv);

        this.#H = hsv[0];
        this.#S = hsv[1];
        this.#V = hsv[2];
        this.#A = hsv[3];

        this.#setPalettePosition();
        this.#setHuePosition();
        this.#setAlphaPosition();
        this.#setPaletteColor();
        this.#setPointColor();
    }

    #setPalettePosition(x, y) {
        console.log('+++++++++++++++ setPalettePosition', x, y);
        const point = this.#panel.querySelector('#color_point');
        const parentRect = point.closest('#palette').getBoundingClientRect();
        const rangeX = parentRect.width;
        const rangeY = parentRect.height;
        const correct = point.getBoundingClientRect().width / 2;

        if (typeof x === 'number') {
            x = Math.min(Math.max(x, 0), rangeX);
            this.#S = x / rangeX;
        } else {
            x = rangeX * this.#S;
        }

        if (typeof y === 'number') {
            y = Math.min(Math.max(y, 0), rangeY);
            this.#V = 1 - y / rangeY;
        } else {
            y = rangeY - rangeY * this.#V;
        }

        point.style.left = x - correct + 'px';
        point.style.top = y - correct + 'px';
    }

    #setHuePosition(x) {
        console.log('+++++++++++++++ setHuePosition', x);
        const point = this.#panel.querySelector('#hue_point');
        const range = point.closest('#hue').getBoundingClientRect().width;
        const correct = point.getBoundingClientRect().width / 2;

        if (typeof x === 'number') {
            x = Math.min(Math.max(x, 0), range);
            this.#H = x / range;
        } else {
            x = range * this.#H;
        }

        point.style.left = x - correct + 'px';
    }

    #setAlphaPosition(x) {
        console.log('+++++++++++++++ setAlphaPosition', x);
        const point = this.#panel.querySelector('#alpha_point');
        const range = point.closest('#alpha').getBoundingClientRect().width;
        const correct = point.getBoundingClientRect().width / 2;

        if (typeof x === 'number') {
            x = Math.min(Math.max(x, 0), range);
            this.#A = x / range;
        } else {
            x = range * this.#A;
        }

        point.style.left = x - correct + 'px';
    }

    #setPaletteColor() {
        console.log('+++++++++++++++ setPaletteColor');
        const h = this.#H * 360;
        const rgb = UIColorPicker.getHSVtoRGB(this.#H, this.#S, this.#V);

        this.#panel.querySelector('#palette').style.background = `
            linear-gradient(
                to right,
                hsl(` + h +`, 100%, 100%, 1),
                hsl(` + h +`, 100%, 50%, 1)
            )
        `;

        this.#panel.querySelector('#alpha #dim').style.background = `
            linear-gradient(
                to right,
                rgba(`+ rgb[0] +`, `+ rgb[1] +`, `+ rgb[2] +`, 0),
                rgba(`+ rgb[0] +`, `+ rgb[1] +`, `+ rgb[2] +`, 1)
            )
        `;
    }

    #setPointColor() {
        console.log('+++++++++++++++ setPointColor');

        const color = this.rgb;
        console.log(color);
        this.#panel.querySelectorAll('.point .color').forEach((point) => {
            point.style.backgroundColor = color;
        });

        const input = this.#panel.querySelector('.value_wrap input');
        input.style.backgroundColor = color;
    }



    get hex() {

    }

    get rgb() {
        const color = UIColorPicker.getHSVtoRGB(this.#H, this.#S, this.#V, this.#A);

        if (color[3] == 1) {
            return 'rgb(' + Math.floor(color[0]) + ', ' + Math.floor(color[1]) + ', ' + Math.floor(color[2]) + ')';
        } else {
            return 'rgba(' + Math.floor(color[0]) + ', ' + Math.floor(color[1]) + ', ' + Math.floor(color[2]) + ', ' + color[3] + ')';
        }
    }

    get hsl() {

    }



    static getRGBtoHSV(r, g, b, a) {
        r /= 255, g /= 255, b /= 255, a = (a != undefined) ? parseFloat(a) : 1;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let d = max - min;

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
            }

            h /= 6;
        }

        return [h, s, v, a];
    }

    static getHSVtoRGB(h, s, v, a) {
        let r, g, b;
        a = (a != undefined) ? parseFloat(a) : 1;

        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
            break;

            case 1:
                r = q, g = v, b = p;
            break;

            case 2:
                r = p, g = v, b = t;
            break;

            case 3:
                r = p, g = q, b = v;
            break;

            case 4:
                r = t, g = p, b = v;
            break;

            case 5:
                r = v, g = p, b = q;
            break;
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
    }

    static getRGBtoHSL(r, g, b, a) {
        r /= 255, g /= 255, b /= 255, a = (a != undefined) ? parseFloat(a) : 1;

        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let d = max - min;

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
            }
        }

        return [Math.round(h * 60), parseFloat(s.toFixed(2)), parseFloat(l.toFixed(2)), a];
    }

    static getHSLtoRGB(h, s, l, a) {
        if (h > 1) h /= 360;
        a = (a != undefined) ? parseFloat(a) : 1;

        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t * 6 < 1) return p + (q - p) * 6 * t;
            if (t * 2 < 1) return q;
            if (t * 3 < 2) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = (l <= 0.5) ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;

        let r = hue2rgb(p, q, h + 1 / 3);
        let g = hue2rgb(p, q, h);
        let b = hue2rgb(p, q, h - 1 / 3);

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
    }

    static get ver() {
        return '1.0.0';
    }

    static get is() {
        return 'color-picker';
    }
}

customElements.define(UIColorPicker.is, UIColorPicker);