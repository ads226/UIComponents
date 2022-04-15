class UIColorPicker extends HTMLElement {
    #knob = document.createElement('div');
    #panel = document.createElement('div');

    #H = 0;
    #S = 0;
    #V = 0;
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
                gap: 16px;

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
                cursor: pointer;
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
                cursor: pointer;
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
                overflow: hidden;
                box-shadow: 0 2px 3px hsl(0, 0%, 0%, 0.5);
                pointer-events: none;
            }
            .point svg {
                position: absolute;
                top: 0;
                left 0;
                width: 100%;
                height: 100%;
            }
            .point .color {
                position: absolute;
                top: 0;
                left 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
        `;

        this.#knob.id = 'knob';

        this.#panel.id = 'panel';
        this.#panel.innerHTML = `
            <div id="palette">
                <div id="saturation"></div>
                <div id="color_point" class="point">
                    <svg viewBox="0 0 28 28">
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="00" y="00"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="10" y="00"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="20" y="00"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="30" y="00"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="00" y="10"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="10" y="10"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="20" y="10"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="30" y="10"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="00" y="20"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="10" y="20"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="20" y="20"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="30" y="20"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="00" y="30"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="10" y="30"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="20" y="30"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="30" y="30"/>
                    </svg>
                    <div class="color"></div>
                </div>
            </div>
            <div id="hue">
                <div id="hue_point" class="point">
                    <svg viewBox="0 0 28 28">
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="00" y="00"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="10" y="00"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="20" y="00"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="30" y="00"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="00" y="10"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="10" y="10"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="20" y="10"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="30" y="10"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="00" y="20"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="10" y="20"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="20" y="20"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="30" y="20"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="00" y="30"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="10" y="30"/>
                        <rect style="fill: #D8D8D8;" width="10" height="10" x="20" y="30"/>
                        <rect style="fill: #FFFFFF;" width="10" height="10" x="30" y="30"/>
                    </svg>
                    <div class="color"></div>
                </div>
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
                    <input type="text" id="value_txt" value="rgb(0, 0, 0)" readonly></div>
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
        this.onPointPress = this.onPointPress.bind(this);
        this.onPointMove = this.onPointMove.bind(this);
        this.onPointRelease = this.onPointRelease.bind(this);

        this.#panel.querySelector('#btn_reset').onclick = this.#loadColor.bind(this);
        this.#panel.querySelector('#btn_cancel').onclick = this.onPanelClose.bind(this);
        this.#panel.querySelector('#btn_done').onclick = this.onDone.bind(this);

        this.#panel.querySelectorAll('input[name=type]').forEach((input) => {
            input.onclick = this.#setValue.bind(this);
        });

        shadow.append(style, this.#knob);
    }

    connectedCallback() {
        this.#knob.addEventListener('click', this.onPanelOpen);
        this.#panel.querySelector('#hue').addEventListener('mousedown', this.onPointPress);
        this.#panel.querySelector('#palette').addEventListener('mousedown', this.onPointPress);
    }

    disconnectedCallback() {
        this.#knob.removeEventListener('click', this.onPanelOpen);
        this.onPointRelease();
    }

    onPanelOpen(e) {
        let panel = this.shadowRoot.querySelector('#panel');
        if (panel) return;

        this.shadowRoot.append(this.#panel);
        document.querySelector('html').addEventListener('mousedown', this.onPanelClose);

        this.#loadColor();
    }

    #loadColor() {
        let rgb = window.getComputedStyle(this).backgroundColor.replace(/[rgb\rgba\(\)]| /gi, '').split(',');
        let hsv = this.#getRGBtoHSV(rgb);

        this.#H = hsv[0];
        this.#S = hsv[1];
        this.#V = hsv[2];

        this.#setHuePointPosition();
        this.#setPalettePointPosition();
        this.#setPaletteColor();
        this.#setPointColor();
    }

    onPointPress(e) {
        this.point = e.currentTarget.querySelector('.point');

        if (e.currentTarget.id == 'hue') {
            this.#setHuePointPosition(e.offsetX);
            this.#panel.querySelector('#hue').addEventListener('mousemove', this.onPointMove);
        } else {
            this.#setPalettePointPosition(e.offsetX, e.offsetY);
            this.#panel.querySelector('#palette').addEventListener('mousemove', this.onPointMove);
        }

        this.#setPaletteColor();
        this.#setPointColor();

        window.addEventListener('mouseup', this.onPointRelease);
        window.addEventListener('mouseleave', this.onPointRelease);
    }

    onPointMove(e) {
        if (this.point.id == 'hue_point') {
            this.#setHuePointPosition(e.offsetX);
        } else if (this.point.id == 'color_point') {
            this.#setPalettePointPosition(e.offsetX, e.offsetY);
        }

        this.#setPaletteColor();
        this.#setPointColor();
    }

    onPointRelease(e) {
        this.#panel.querySelector('#hue').removeEventListener('mousemove', this.onPointMove);
        this.#panel.querySelector('#palette').removeEventListener('mousemove', this.onPointMove);
        window.removeEventListener('mouseup', this.onPointRelease);
        window.removeEventListener('mouseleave', this.onPointRelease);
    }

    #setHuePointPosition(x) {
        let point = this.#panel.querySelector('#hue_point');
        let range = point.closest('#hue').getBoundingClientRect().width;
        let revise = point.getBoundingClientRect().width / 2;

        if (typeof x == 'number') {
            x = Math.min(Math.max(x, 0), range);
            this.#H = x / range;
        } else {
            x = range * this.#H;
        }

        point.style.left = x - revise + 'px';
    }

    #setPalettePointPosition(x, y) {
        let point = this.#panel.querySelector('#color_point');
        let parent = point.closest('#palette').getBoundingClientRect();
        let rangeX = parent.width;
        let rangeY = parent.height;
        let revise = point.getBoundingClientRect().width / 2;

        if (typeof x == 'number') {
            x = Math.min(Math.max(x, 0), rangeX);
            this.#S = x / rangeX;
        } else {
            x = rangeX * this.#S;
        }

        if (typeof y == 'number') {
            y = Math.min(Math.max(y, 0), rangeY);
            this.#V = 1 - y / rangeY;
        } else {
            y = rangeY - rangeY * this.#V;
        }

        point.style.left = x - revise + 'px';
        point.style.top = y - revise + 'px';
    }

    #setPointColor() {
        let color = this.rgb;
        this.#panel.querySelectorAll('.point .color').forEach((div) => {
            div.style.backgroundColor = color;
        });

        let input = this.#panel.querySelector('input[type=text]');
        input.style.backgroundColor = color;
        input.style.color = 'hsl(0, 0%, ' + ((this.#V + 1.5) % 1) * 100 + '%, 0.9)';

        this.#setValue();
    }

    #setValue() {
        let type = '';
        
        this.#panel.querySelectorAll('input[name=type]').forEach((input) => {
            if (input.checked) type = input.id.split('_')[1];
        });

        switch (type) {
            case 'hex':
                this.#panel.querySelector('#value_txt').value = this.hex;
            break;
            case 'rgb':
                this.#panel.querySelector('#value_txt').value = this.rgb;
            break;
            case 'hsl':
                this.#panel.querySelector('#value_txt').value = this.hsl;
            break;
        }
    }

    #setPaletteColor() {
        let h = 360 * this.#H;
        this.#panel.querySelector('#palette').style.background = `
            linear-gradient(
                to right,
                hsl(` + h +`, 100%, 100%, 1),
                hsl(` + h +`, 100%, 50%, 1)
            )
        `;
    }

    #getCurrentRGB() {
        let h = this.#H;
        let s = this.#S;
        let v = this.#V;
        let a = this.#A || 1;

        return this.#getHSVtoRGB([h, s, v, a]);
    }

    get rgb() {
        let color = this.#getCurrentRGB();
        return 'rgb(' + Math.floor(color[0]) + ', ' + Math.floor(color[1]) + ', ' + Math.floor(color[2]) + ')';
    }

    get hex() {
        let rgb = this.#getCurrentRGB();
        return '#' + Math.floor(rgb[0]).toString(16) + Math.floor(rgb[1]).toString(16) + Math.floor(rgb[2]).toString(16);
    }

    get hsl() {
        let hsl = this.#getRGBtoHSL(this.#getCurrentRGB());
        return 'hsl(' + Math.floor(hsl[0]) + ', ' + Math.floor(hsl[1]) + '%, ' + Math.floor(hsl[2]) + '%)';
    }

    onPanelClose(e) {
        if (e.target.closest(UIColorPicker.is)) return;
        this.shadowRoot.removeChild(this.#panel);
        document.querySelector('html').removeEventListener('mousedown', this.onPanelClose);

        this.onPointRelease();
    }

    onDone(e) {
        this.style.backgroundColor = this.rgb;
        this.onChange();
        this.onPanelClose(e);
    }

    #change = 'return false;';
    onChange() {
        eval(this.#change);
    }


    #getRGBtoHSV(rgb) {
        let r = (parseFloat(rgb[0]) + 1) / 256;
        let g = (parseFloat(rgb[1]) + 1) / 256;
        let b = (parseFloat(rgb[2]) + 1) / 256;
        let a = parseFloat(rgb[3] || 1);

        let min = Math.min(r, g, b);
        let max = Math.max(r, g, b);
        let d = max - min;

        let h = 0;
        let s = max == 0 ? 0 : d / max;
        let v = max;

        if (max != min) {
            switch(max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                break;

                case g:
                    h = (b - r) / d + 2;
                break;

                case b:
                    h = (r - b) / d + 4;
                break;
            }

            h /= 6;
        }

        return [h, s, v, a];
    }

    #getRGBtoHSL(rgb) {
        let r = (parseFloat(rgb[0]) + 1) / 256;
        let g = (parseFloat(rgb[1]) + 1) / 256;
        let b = (parseFloat(rgb[2]) + 1) / 256;
        let a = parseFloat(rgb[3] || 1);

        let min = Math.min(r, g, b);
        let max = Math.max(r, g, b);
        let d = max - min;

        let h = 0;
        let s = 0;
        let l = (max + min) / 2;

        if (d != 0) {
            s = d / (1 - Math.abs(2 * l - 1));

            switch(max) {
                case r:
                    h = ((g - b) / d) % 6;
                break;
                
                case g:
                    h = (b - r) / d + 2;
                break;
                
                case b:
                    h = (r - g) / d + 4;
                break;
            }

            h = h * 60;
            if (h < 0) h += 360;
        }

        s *= 100;
        l *= 100;

        return [h, s, l];
    }

    #getHSVtoRGB(hsv) {
        let h = hsv[0];
        let s = hsv[1];
        let v = hsv[2];

        let r, g, b;

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

        return [r * 255, g * 255, b * 255, hsv[3] || 1];
    }

    static get observedAttributes() {
		return ['change'];
	}

    attributeChangedCallback(attr, oldValue, newValue) {
		if (attr == 'change') {
			this.#change = newValue;
		}
	}

    static get is() {
        return 'ui-color-picker';
    }
}

customElements.define(UIColorPicker.is, UIColorPicker);