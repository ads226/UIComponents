class Color {
    #H = 0;
    #S = 0;
    #V = 0;
    #A = 1;

    constructor(...argus) {

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