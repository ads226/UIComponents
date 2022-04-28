class UIDatePicker extends HTMLElement {
    #knob = document.createElement('div');
    #panel = document.createElement('div');
    #date = new Date(1979, 5, 24);
    #min = new Date(1970, 0, 1);
    #max = new Date(2040, 11, 31);
    #isLock = false;

    constructor() {
        super();

        const style = document.createElement('style');
        style.textContent = `
        :host * {
            margin: 0;
            padding: 0;
            border: 0;
            box-sizing: border-box;
            user-select: none;
        }

        :host {
            --panel-width: 300px;
            --panel-height: 300px;
            --panel-margin: 2px;
            --panel-bg-color: hsl(200, 15%, 25%, 1.00);
            --panel-shadow: 0 4px 10px hsl(0, 0%, 0%, 0.20), 0 2px 6px hsl(0, 0%, 0%, 0.30);

            --head-height: 70px;
            --head-item-height: calc(var(--head-height) / 3);
            --head-txt-color: hsl(200, 25%, 90%, 1.00);
            --head-shadow: 0 2px 3px hsl(0, 0%, 0%, 0.1);

            position: relative;
        }

        #knob {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            cursor: pointer;
        }

        #panel {
            position: absolute;
            left: 0;
            top: calc(100% + var(--panel-margin));
            width: var(--panel-width);
            height: var(--panel-height);
            background-color: var(--panel-bg-color);
            box-shadow: var(--panel-shadow);
            overflow: hidden;
            z-index: 9999;
        }

        #head {
            display: flex;
            justify-content: center;
            width: 100%;
            height: var(--head-height);
            background-color: hsl(0, 0%, 100%, 0.05);
            box-shadow: var(--head-shadow);
        }

        #year_wrap,
        #month_wrap {
            position: relative;
            display: flex;
            justify-content: center;
            overflow: hidden;
        }

        #year_wrap {
            width: 80px;
        }

        #year_items {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
        }

        .year_item {
            display: flex;
            align-items: center;
            justify-content: center;
            height: var(--head-item-height);
            line-height: var(--head-item-height);
            color: var(--head-txt-color);
            font-size: 15px;
            opacity: 0;
        }

        .year_item.selected {
            font-size: 17px;
            opacity: 1;
        }

        .btn_up,
        .btn_down {
            position: absolute;
            width: 10px;
            height: 10px;
            border-left: 1px solid;
            border-bottom: 1px solid;
            border-color: var(--head-txt-color);
            cursor: pointer;
        }

        .btn_up {
            top: 8px;
            transform: rotate(135deg);
        }
        .btn_down {
            bottom: 8px;
            transform: rotate(-45deg);
        }

        .btn_up.disabled,
        .btn_down.disabled {
            filter: grayscale(100%) opacity(0.1);
            cursor: default;
        }

        .btn_up:not(.disabled):hover,
        .btn_down:not(.disabled):hover {
            border-color: hsl(190, 100%, 50%, 1);
        }

        .tr {
            transition: 0.25s;
        }
        `;

        this.#knob.id = 'knob';
        this.#panel.id = 'panel';
        this.#panel.innerHTML = `
        <div id="head">
            <div id="year_wrap">
                <div id="year_items">
                    <div class="year_item"></div>
                    <div class="year_item selected"></div>
                    <div class="year_item"></div>
                </div>
                <div id="year_up" class="btn_up"></div>
                <div id="year_down" class="btn_down"></div>
            </div>
            <div id="month_wrap">
                <div id="month_items"></div>
                <div id="month_up" class="btn_up"></div>
                <div id="month_down" class="btn_down"></div>
            </div>
        </div>
        <div id="body">

        </div>
        `;

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onYearUpDown = this.onYearUpDown.bind(this);
        this.onYearTransitionEnd = this.onYearTransitionEnd.bind(this);

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(style, document.createElement('slot'), this.#knob);
    }

    connectedCallback() {
        this.#knob.addEventListener('click', this.open);

        this.#panel.querySelector('#year_up').addEventListener('click', this.onYearUpDown);
        this.#panel.querySelector('#year_down').addEventListener('click', this.onYearUpDown);
    }

    disconnectedCallback() {
        this.close();
        this.#knob.removeEventListener('click', this.open);

        this.#panel.querySelector('#year_up').removeEventListener('click', this.onYearUpDown);
        this.#panel.querySelector('#year_down').removeEventListener('click', this.onYearUpDown);
    }

    open(e) {
        const panel = this.shadowRoot.querySelector('#panel');

        if (!panel) {
            this.shadowRoot.append(this.#panel);

            document.querySelector('html').addEventListener('mousedown', this.onClose);
            window.addEventListener('scroll', this.close);
            window.addEventListener('resize', this.close);
        }

        this.#initPanel();
    }

    close(e) {
        const panel = this.shadowRoot.querySelector('#panel');
        if (!panel) return;

        this.shadowRoot.removeChild(panel);
        document.querySelector('html').removeEventListener('mousedown', this.onClose);
        window.removeEventListener('scroll', this.close);
        window.removeEventListener('resize', this.close);
    }

    onClose(e) {
        if (e.target.closest(UIDatePicker.is) !== this) this.close();
    }

    #initPanel() {
        this.#initPanelYear();

        this.#isLock = false;
    }

    #initPanelYear() {
        const items = this.#panel.querySelector('#year_items');
        items.classList.remove('tr');
        items.style.top = 0;
        items.querySelectorAll('.year_item').forEach((item, idx) => {
            item.innerHTML = this.#date.getFullYear() - 1 + idx + '년';
            item.classList.toggle('selected', idx === 1);
        });

        this.#updatePanelYear();
    }

    #updatePanelYear() {
        this.#panel.querySelector('#year_up').classList.toggle('disabled', this.#date.getFullYear() == this.#max.getFullYear());
        this.#panel.querySelector('#year_down').classList.toggle('disabled', this.#date.getFullYear() == this.#min.getFullYear());
    }

    onYearUpDown(e) {
        if (e.currentTarget.classList.contains('disabled')) return;
        if (this.#isLock) return;
        this.#isLock = true;

        const delta = (e.currentTarget.id === 'year_up') ? 1 : -1;
        this.#date.setFullYear(this.#date.getFullYear() + delta);

        const items = this.#panel.querySelector('#year_items');
        items.classList.add('tr');
        items.addEventListener('transitionend', this.onYearTransitionEnd);
        items.querySelectorAll('.year_item').forEach((item, idx) => {
            item.classList.add('tr');
            item.classList.toggle('selected', idx == 1 + delta);
        });
        items.style.top = (delta > 0) ? 'calc(0px - var(--head-item-height))' : 'var(--head-item-height)';
    }

    onYearTransitionEnd(e) {
        const items = this.#panel.querySelector('#year_items');
        items.classList.remove('tr');
        items.removeEventListener('transitionend', this.onYearTransitionEnd);
        items.querySelectorAll('.year_item').forEach((item, idx) => {
            item.classList.remove('tr');
        });

        this.#initPanelYear();

        setTimeout(() => {
            this.#isLock = false;
        });
    }

    get value() {
        // return UIDatePicker.getDateToString(this.#date);
        return this.innerHTML;
    }

    get min() {
        return UIDatePicker.getDateToString(this.#min);
    }

    get max() {
        return UIDatePicker.getDateToString(this.#max);
    }

    set value(str) {
        const date = UIDatePicker.getStringToDate(str);
        if (date) {
            if (date < this.#min) {
                console.error(`입력된 날짜가 최소 날짜 이전입니다. ${UIDatePicker.getDateToString(date)}, (min: ${this.min})`);
                return false;
            }

            if (date > this.#max) {
                console.error(`입력된 날짜가 최대 날짜 이후입니다. ${UIDatePicker.getDateToString(date)}, (min: ${this.max})`);
                return false;
            }

            this.#date = date;
            // this.innerHTML = this.value;
            this.innerHTML = UIDatePicker.getDateToString(this.#date);
            this.#initPanel();
        }
    }

    set min(str) {
        const date = UIDatePicker.getStringToDate(str);
        if (date) {
            if (date > this.#max) {
                console.error(`최소 날짜가 최대 날짜 이후입니다. ${UIDatePicker.getDateToString(date)}, (min: ${this.max})`);
                return false;
            }

            if (date > this.#date) {
                console.error(`최소 날짜가 설정 날짜 이후입니다. ${UIDatePicker.getDateToString(date)}, (min: ${this.value})`);
                return false;
            }

            this.#min = date;
        }
    }

    set max(str) {
        const date = UIDatePicker.getStringToDate(str);
        if (date) {
            if (date < this.#min) {
                console.error(`최대 날짜가 최소 날짜 이전입니다. ${UIDatePicker.getDateToString(date)}, (min: ${this.min})`);
                return false;
            }

            if (date < this.#date) {
                console.error(`최대 날짜가 설정 날짜 이전입니다. ${UIDatePicker.getDateToString(date)}, (min: ${this.value})`);
                return false;
            }

            this.#max = date;
        }
    }

    static get observedAttributes() {
        return ['value', 'min', 'max'];
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'value') this.value = newValue;
        if (attr === 'min') this.min = newValue;
        if (attr === 'max') this.max = newValue;
    }

    static getDateToString(date) {
        return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    }

    static getStringToDate(str) {
        if (typeof str !== 'string') {
            console.error('param의 dataype이 string이 아닙니다.', str);
            return false;
        }

        const arr = str.split('-');
        if (arr.length !== 3) {
            console.error('param의 형식이 "yyyy-mm-dd"가 아닙니다.', str);
            return false;
        }

        const obj = {
            y: parseInt(arr[0]),
            m: parseInt(arr[1]),
            d: parseInt(arr[2])
        }

        if (obj.m < 1 || obj.m > 12) {
            console.error('월(mm)은 1이상, 12이하로 입력되어야 합니다.', str);
            return false;
        }

        const date = new Date(obj.y, obj.m, 0);
        if (obj.d < 1 || obj.d > date.getDate()) {
            console.error(`${obj.y}년 ${obj.m}월의 일(dd)은 1이상, ${date.getDate()}이하로 입력되어야 합니다.`, str);
            return false;
        }

        date.setDate(obj.d);
        return date;

    }

    static get ver() {
        return '1.0.0';
    }

    static get is() {
        return 'ui-date-picker';
    }
}

customElements.define(UIDatePicker.is, UIDatePicker);


