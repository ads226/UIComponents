class Color {
    #H = 0;
    #S = 0;
    #V = 0;
    #A = 1;

    constructor() {
        this.#init(...argus);

    }

    #init(...argus) {
        if (argus.length === 1) {
            const argu = argus[0];
            
            if (typeof argu === 'string') {
                if (argu.startsWith('rgb')) {
                    const rgb = argu.replace(/[^0-9.,]/g, '').split(',').map(Number);
                    [this.#H, this.#S, this.#V, this.#A] = Color.rgb2hsv(...rgb);
                } else if (argu.startsWith('hsl')) {
                    const hsl = argu.replace(/[^0-9.,%]/g, '').split(',').map(Number);
                } else {
                    [this.#H, this.#S, this.#V, this.#A] = Color.rgb2hsv(...Color.hex2rgb(argu));
                }
            } else if (Array.isArray(argu)) {
                [this.#H, this.#S, this.#V, this.#A] = Color.rgb2hsv(...argu);
            } else {
                console.log('[Color] type of parameters is unknown.', argus);
            }
        } else if (argus.length > 1) {

        } else {
            console.log('[Color] nothing the parameters of color class.', argus);
        }
    }

    get hex() {
        return;
    }
    set hex(value) {
        console.log(value);
    }

    get rgb() {
        return;
    }
    set rgb(value) {

    }

    get hsl() {
        return;
    }
    set hsl(value) {

    }

    static hex2rgb(hex = '#000000') {
        if (hex[0] === '#') hex = hex.slice(1);
        
        let rgb = (hex.length === 3) ? hex.match( /[a-f\d]/gi ) : hex.match( /[a-f\d]{2}/gi );
        if (rgb.length === 3) rgb.push('ff');

        rgb.forEach((str, idx, arr) => {
            if (str.length === 1) str = str + str;

            arr[idx] = parseInt(str, 16);
            if (idx === 3) arr[idx] /= 255;
        });

        return rgb;
    }

    static rgb2hsv(r = 0, g = 0, b = 0, a = 1) {
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
                    throw('!!!!!!!');
            }

            h /= 6;
        }

        return [h, s, v, a];
    }

}