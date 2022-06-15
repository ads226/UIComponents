export class UIColorPicker extends HTMLElement {
    #knob = document.createElement('div');
    #panel;
    #type = 'hex';
    #useAlpha = false;

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
                display: block;
            }

            #knob {
                width: 100%;
                height: 100%;
                cursor: pointer;
            }
        `;

        this.#knob.id = 'knob';

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.closed = this.closed.bind(this);
        this.onClose = this.onClose.bind(this);
        this.done = this.done.bind(this);

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(style, this.#knob);
    }

    connectedCallback() {
        this.#knob.addEventListener('click', this.open);
    }

    disconnectedCallback() {
        this.close();
        this.#knob.removeEventListener('click', this.open);
    }

    open(e) {
        if (this.#panel) this.close();

        const thisStyle = window.getComputedStyle(this);
        const thisRect = this.getBoundingClientRect();
        const panelWidth = parseInt(thisStyle.getPropertyValue('--width'));
        const panelHeight = parseInt(thisStyle.getPropertyValue('--height'));

        this.#panel = document.createElement(UIColorPickerPanel.is);
        this.#panel.style.textContent = `
            --width: ${ panelWidth + 'px' };
            --height: ${ panelHeight + 'px' };
            --padding: ${ thisStyle.getPropertyValue('--padding') };

            --color-bg: ${ thisStyle.getPropertyValue('--color-bg') };
            --color-line: ${ thisStyle.getPropertyValue('--color-line') };
            --color-text: ${ thisStyle.getPropertyValue('--color-text') };
            --color-focus: ${ thisStyle.getPropertyValue('--color-focus') };
            --color-btn: ${ thisStyle.getPropertyValue('--color-btn') };

            --shadow-bg: ${ thisStyle.getPropertyValue('--shadow-bg') };
            --shadow-point: ${ thisStyle.getPropertyValue('--shadow-point') };
        `;
        this.#panel.setAttribute('type', this.#type);
        if (this.#useAlpha) this.#panel.attributes.setNamedItem(document.createAttribute('alpha'));
        this.#panel.setAttribute('color', thisStyle.backgroundColor);

        if (window.innerHeight - thisRect.bottom < panelHeight) {
            this.#panel.style.top = thisRect.top - panelHeight + 'px';
        } else {
            this.#panel.style.top = thisRect.bottom + 'px';
        }

        this.#panel.style.left = 'min(' + thisRect.left + 'px, ' + (window.innerWidth - panelWidth) + 'px)';

        this.#panel.addEventListener(UIColorPickerPanel.ON_CLICK_DONE, this.done);
        this.#panel.addEventListener(UIColorPickerPanel.ON_CLICK_CLOSE, this.close);
        this.#panel.addEventListener(UIColorPickerPanel.ON_CLOSED, this.closed);

        document.querySelector('html').addEventListener('mousedown', this.onClose);
        window.addEventListener('scroll', this.close);
        window.addEventListener('resize', this.close);

        document.querySelector('body').append(this.#panel);
    }

    close(e) {
        if (!this.#panel) return;
        this.#panel.remove();
    }

    closed() {
        this.#panel.removeEventListener(UIColorPickerPanel.ON_CLICK_DONE, this.done);
        this.#panel.removeEventListener(UIColorPickerPanel.ON_CLICK_CLOSE, this.close);
        this.#panel.removeEventListener(UIColorPickerPanel.ON_CLOSED, this.closed);

        document.querySelector('html').removeEventListener('mousedown', this.onClose);
        window.removeEventListener('scroll', this.close);
        window.removeEventListener('resize', this.close);
    }

    onClose(e) {
        if (e.target.closest(UIColorPickerPanel.is) !== this.#panel) this.close();
    }

    done(e) {
        if (!this.#panel) return;

        this.style.backgroundColor = this.#panel.rgb;
        this.close();
        this.change();
    }

    change() {
		if (this.hasAttribute('onchange')) this.onchange.bind(this).call();
    }

    get hex() {
        const color = this.rgbArray;

        let ret = "#";
        ret += ('0' + Math.floor(color[0]).toString(16)).slice(-2);
        ret += ('0' + Math.floor(color[1]).toString(16)).slice(-2);
        ret += ('0' + Math.floor(color[2]).toString(16)).slice(-2);

        if (color[3] < 1) {
            ret += ('0' + Math.floor(color[3] * 100).toString(16)).slice(-2);
        }

        return ret.toUpperCase();
    }

    get rgb() {
        return window.getComputedStyle(this).backgroundColor;
    }

    get rgbArray() {
		return this.rgb.replace(/[rgb\rgba\(\)]| /gi, '').split(',');
	}

    get hsl() {
        const color = UIColorPickerPanel.getRGBtoHSL(...this.rgbArray);
        const str = Math.floor(color[0]) + ', ' + Math.floor(color[1] * 100) + '%, ' + Math.floor(color[2] * 100) + '%';
        
        if (color[3] == 1) {
            return 'hsl(' + str + ')';
        } else {
            return 'hsla(' + str + ', ' + color[3] + ')';
        }
    }

    static get observedAttributes() {
        return ['type', 'alpha'];
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'type') {
            const type = newValue.toLowerCase();
            this.#type = type;
            if (this.#panel) this.#panel.setAttribute('type', this.#type);
        }

        if (attr === 'alpha') {
            this.#useAlpha = this.hasAttribute('alpha');
            if (this.#panel) this.#panel.attributes.setNamedItem(document.createAttribute('alpha'));
        }
    }

    static getRGBtoHEX(r, g, b) {
		return UIColorPickerPanel.getRGBtoHEX(r, g, b);
	}

    static getRGBtoHSV(r, g, b, a) {
        return UIColorPickerPanel.getRGBtoHSV(r, g, b, a);
    }

    static getHSVtoRGB(h, s, v, a) {
        return UIColorPickerPanel.getHSVtoRGB(h, s, v, a);
    }

    static getRGBtoHSL(r, g, b, a) {
        return UIColorPickerPanel.getRGBtoHSL(r, g, b, a);
    }

    static getHSLtoRGB(h, s, l, a) {
        return UIColorPickerPanel.getHSLtoRGB(h, s, l, a);
    }

    static get ver() {
        return '1.1.0';
    }

    static get is() {
        return 'ui-color-picker';
    }
}

customElements.define(UIColorPicker.is, UIColorPicker);


export class UIColorPickerPanel extends HTMLElement {
    #panel = document.createElement('div');
    #type = 'hex';
    #point

    #H = 0;
    #S = 0;
    #V = 0;
    #A = 1;
    #store = [this.#H, this.#S, this.#V, this.#A];

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
                display: none;
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
                gap: 8px;
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
                position: relative;
                flex: 1;
                display: flex;
            }

            .value_wrap input {
                width: 100%;
                outline: none;
                font-size: 11px;
                color: #000;
                text-align: center;
                border: 1px solid var(--color-line);
                z-index: 1;
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
                    <input type="radio" name="type" id="type_hex" checked />
                    <label for="type_hex">HEX</label>
                    <input type="radio" name="type" id="type_rgb" />
                    <label for="type_rgb">RGB</label>
                    <input type="radio" name="type" id="type_hsl" />
                    <label for="type_hsl">HSL</label>
                </div>
                <div class="value_wrap">
                    <div class="svg_wrap">
                        <svg></svg>
                    </div>
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

        this.init = this.init.bind(this);
        this.reset = this.reset.bind(this);
        this.done = this.done.bind(this);
        this.close = this.close.bind(this);
        this.setType = this.setType.bind(this);
        this.onPointMove = this.onPointMove.bind(this);
        this.onPointPress = this.onPointPress.bind(this);
        this.onPointRelease = this.onPointRelease.bind(this);

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(style, this.#panel);
    }

    connectedCallback() {

        this.#panel.querySelector('#palette').addEventListener('mousedown', this.onPointPress);
        this.#panel.querySelector('#hue').addEventListener('mousedown', this.onPointPress);
        this.#panel.querySelector('#alpha').addEventListener('mousedown', this.onPointPress);

        this.#panel.querySelector('#btn_reset').addEventListener('click', this.reset);
        this.#panel.querySelector('#btn_done').addEventListener('click', this.done);
        this.#panel.querySelector('#btn_close').addEventListener('click', this.close);

        this.#panel.querySelectorAll('.type_wrap input').forEach((input) => {
            input.addEventListener('click', this.setType);
        });

        this.init();
    }

    disconnectedCallback() {
        this.#panel.querySelector('#palette').removeEventListener('mousedown', this.onPointPress);
        this.#panel.querySelector('#hue').removeEventListener('mousedown', this.onPointPress);
        this.#panel.querySelector('#alpha').removeEventListener('mousedown', this.onPointPress);

        this.#panel.querySelector('#btn_reset').removeEventListener('click', this.reset);
        this.#panel.querySelector('#btn_done').removeEventListener('click', this.done);
        this.#panel.querySelector('#btn_close').removeEventListener('click', this.close);

        this.#panel.querySelectorAll('.type_wrap input').forEach((input) => {
            input.removeEventListener('click', this.setType);
        });

        this.onPointRelease();
        this.dispatchEvent(new Event(UIColorPickerPanel.ON_CLOSED));
    }

    onPointPress(e) {
        this.#point = e.currentTarget.querySelector('.point');

        window.addEventListener('mousemove', this.onPointMove);
        window.addEventListener('mouseup', this.onPointRelease);
        window.addEventListener('mouseleave', this.onPointRelease);

        this.onPointMove(e);
    }

    onPointMove(e) {
        const rect = this.#point.parentNode.getBoundingClientRect();
        const x = e.clientX - rect.x;
        const y = e.clientY - rect.y;

        switch (this.#point.id) {
            case 'color_point':
                this.#setPalettePosition(x, y);
            break;

            case 'hue_point':
                this.#setHuePosition(x);
            break;

            case 'alpha_point':
                this.#setAlphaPosition(x);
            break;
        }

        this.#setPaletteColor();
        this.#setPointColor();
    }

    onPointRelease(e) {
        window.removeEventListener('mousemove', this.onPointMove);
        window.removeEventListener('mouseup', this.onPointRelease);
        window.removeEventListener('mouseleave', this.onPointRelease);
    }

    reset() {
        this.init();
    }

    done() {
        this.dispatchEvent(new Event(UIColorPickerPanel.ON_CLICK_DONE));
    }

    close() {
        this.dispatchEvent(new Event(UIColorPickerPanel.ON_CLICK_CLOSE));
    }

    setType(e) {
        this.#setColorValue(e.target.id.split('_')[1]);
    }

    init(color) {
        if (color != undefined) {
            this.#setColor(color);
        } else {
            this.#H = this.#store[0];
            this.#S = this.#store[1];
            this.#V = this.#store[2];
            this.#A = this.#store[3];
        }

        this.#setPalettePosition();
        this.#setHuePosition();
        this.#setAlphaPosition();
        this.#setPaletteColor();
        this.#setPointColor();
    }

    #setColor(color) {
        if (typeof color === 'string') {
            if (!!~color.indexOf('#')) {
                color = color.trim().replace('#', '');
                color = UIColorPickerPanel.getHEXtoRGB(color);
            } else if (!!~color.indexOf('rgb')) {
                color = color.trim().replace(/[rgb\rgba\(\)]| /gi, '').split(',');
            } else {
                return console.error('color type을 알 수 없음 :', color);
            }

            color = UIColorPickerPanel.getRGBtoHSV(...color);
        } else {
            return console.error('color type을 알 수 없음 :', color);
        }
        
        this.#H = color[0];
        this.#S = color[1];
        this.#V = color[2];
        this.#A = this.#useAlpha ? color[3] : 1;
        this.#store = [this.#H, this.#S, this.#V, this.#A];
    }

    #setPalettePosition(x, y) {
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
        const h = this.#H * 360;
        const rgb = UIColorPickerPanel.getHSVtoRGB(this.#H, this.#S, this.#V);

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
        const color = this.rgb;

        this.#panel.querySelectorAll('.point .color').forEach((point) => {
            point.style.backgroundColor = color;
        });

        const input = this.#panel.querySelector('.value_wrap input');
        input.style.backgroundColor = color;
        input.style.color = 'hsl(0, 0%, ' + (this.#S - this.#V < -0.5 ? 0 : 100) + '%, 0.9)';
        
        this.#setColorValue();
    }

    #setColorValue(type) {
        if (type != undefined) this.#type = type;

        const input = this.#panel.querySelector('#txt_value');

        switch (this.#type) {
            case 'hex':
                input.value = this.hex;
            break;

            case 'rgb':
                input.value = this.rgb;
            break;

            case 'hsl':
                input.value = this.hsl;
            break;
        }
    }

    get hex() {
        const color = UIColorPickerPanel.getHSVtoRGB(this.#H, this.#S, this.#V, this.#A);
        
        let ret = "#";
        ret += ('0' + Math.floor(color[0]).toString(16)).slice(-2);
        ret += ('0' + Math.floor(color[1]).toString(16)).slice(-2);
        ret += ('0' + Math.floor(color[2]).toString(16)).slice(-2);

        if (color[3] < 1) {
            ret += ('0' + Math.floor(color[3] * 100).toString(16)).slice(-2);
        }

        return ret.toUpperCase();;
    }

    get rgb() {
        const color = UIColorPickerPanel.getHSVtoRGB(this.#H, this.#S, this.#V, this.#A);

        if (color[3] == 1) {
            return 'rgb(' + Math.floor(color[0]) + ', ' + Math.floor(color[1]) + ', ' + Math.floor(color[2]) + ')';
        } else {
            return 'rgba(' + Math.floor(color[0]) + ', ' + Math.floor(color[1]) + ', ' + Math.floor(color[2]) + ', ' + color[3].toFixed(2) + ')';
        }
    }

    get hsl() {
        const color = UIColorPickerPanel.getRGBtoHSL(...UIColorPickerPanel.getHSVtoRGB(this.#H, this.#S, this.#V, this.#A));

        if (color[3] == 1) {
            return 'hsl(' + Math.floor(color[0]) + ', ' + Math.floor(color[1] * 100) + '%, ' + Math.floor(color[2] * 100) + '%)';
        } else {
            return 'hsla(' + Math.floor(color[0]) + ', ' + Math.floor(color[1] * 100) + '%, ' + Math.floor(color[2] * 100) + '%, ' + color[3].toFixed(2) + ')';
        }
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'type') {
            const type = newValue.toLowerCase();
            this.#type = type;
            this.#panel.querySelector('#type_' + type).checked = true;
        }

        if (attr === 'alpha') {
            this.#useAlpha = this.hasAttribute('alpha');
            this.#panel.querySelector('#alpha').style.display = 'block';
        }

        if (attr === 'color') {
            this.init(newValue);
        }
    }

    static get observedAttributes() {
        return ['type', 'alpha', 'color'];
    }

    static getHEXtoRGB(h) {
        let rgb = (h.length === 3) ? h.match( /[a-f\d]/gi ) : h.match( /[a-f\d]{2}/gi );
        if (rgb.length === 3) rgb.push('ff');

        rgb.forEach((str, idx, arr) => {
            if (str.length === 1) str = str + str;

            arr[idx] = parseInt(str, 16);
            if (idx === 3) arr[idx] /= 255;
        });

        return rgb;
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

    static getRGBtoHEX(r, g, b) {
		let ret = "#";
        ret += ('0' + Math.floor(r).toString(16)).slice(-2);
        ret += ('0' + Math.floor(g).toString(16)).slice(-2);
        ret += ('0' + Math.floor(b).toString(16)).slice(-2);
        
		return ret.toUpperCase();
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

    static get ON_CLICK_DONE() {
        return 'onClickDone';
    }

    static get ON_CLICK_CLOSE() {
        return 'onClickClose';
    }

    static get  ON_CLOSED() {
        return 'onClosed';
    }

    static get ver() {
        return '1.0.0';
    }

    static get is() {
        return 'ui-color-picker-panel';
    }
}

customElements.define(UIColorPickerPanel.is, UIColorPickerPanel);