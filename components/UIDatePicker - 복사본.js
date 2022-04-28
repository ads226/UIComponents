class UIDatePicker extends HTMLElement {
    #knob = document.createElement('div');
    #panel = document.createElement('div');
    #date = { y: 1979, m: 6, d: 24};
    #min = { y: 1970, m: 1, d: 1 };
    #max = { y: 2030, m: 12, d: 31 };
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
            --head-height: 68px;
            --head-item-height: calc(var(--head-height) / 3);

            --color-panel-bg: hsl(200, 15%, 25%, 1.00);
            --color-head-txt: hsl(200, 25%, 90%, 0.90);

            --shadow-bg: 0 4px 10px hsl(0, 0%, 0%, 0.20), 0 2px 6px hsl(0, 0%, 0%, 0.30);
            --transition-timing: 0.25s;

            position: relative;
        }

        #knob {
            position: absolute;
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
            background-color: var(--color-panel-bg);
            box-shadow: var(--shadow-bg);
            z-index: 9999;
        }

        #head {
            display: flex;
            justify-content: center;
            gap: 12px;
            width: 100%;
            height: var(--head-height);
            background-color: hsl(0, 0%, 100%, 0.05);
        }

        #year_wrap,
        #month_wrap {
            position: relative;
            display: flex;
            justify-content: center;
            overflow: hidden;
        }

        #year_wrap {
            width: 70px;
        }

        #month_wrap {
            width: 40px;
        }

        .year_item,
        .month_item {
            display: flex;
            align-items: center;
            justify-content: center;
            height: var(--head-item-height);
            line-height: var(--head-item-height);
            color: var(--color-head-txt);
            font-size: 15px;
            opacity: 0;
        }
        .year_item.selected,
        .month_item.selected {
            font-size: 17px;
            opacity: 1;
        }

        .btn_up,
        .btn_down {
            position: absolute;
            width: 8px;
            height: 8px;
            border-left: 1px solid;
            border-bottom: 1px solid;
            border-color: var(--color-head-txt);
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
        }

        .tr {
            transition: var(--transition-timing);
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
                <div id="month_items">
                    <div class="month_item"></div>
                    <div class="month_item selected"></div>
                    <div class="month_item"></div>
                </div>
                <div id="month_up" class="btn_up"></div>
                <div id="month_down" class="btn_down"></div>
            </div>
        </div>
        <div id="body">
            <div id="day_wrap">
                
            </div>
            <div id="date_wrap"></div>
        </div>
        `;

        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onYearUp = this.onYearUp.bind(this);
        this.onYearDown = this.onYearDown.bind(this);
        this.onYearTransitionEnd = this.onYearTransitionEnd.bind(this);

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.append(style, document.createElement('slot'), this.#knob, this.#panel);
    }

    connectedCallback() {
        this.#knob.addEventListener('click', this.onOpen);

        this.#panel.querySelector('#year_up').addEventListener('click', this.onYearUp);
        this.#panel.querySelector('#year_down').addEventListener('click', this.onYearDown);
        
    }

    disconnectedCallback() {
        this.#knob.removeEventListener('click', this.onOpen);
    }

    static get observedAttributes() {
        return ['value', 'min', 'max'];
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'value') this.value = newValue;
        if (attr === 'min') this.min = newValue;
        if (attr === 'max') this.max = newValue;
    }

    onYearUp(e) {
        if (this.#isLock) return;
        if (e.currentTarget.classList.contains('disabled')) return;
        this.#isLock = true;

        this.#panel.querySelector('.year_item.selected').classList.remove('selected');
        this.#panel.querySelectorAll('.year_item')[2].classList.add('selected');
        
        this.#date.y += 1;
        
        const items = this.#panel.querySelector('#year_items');
        items.classList.add('tr');
        items.addEventListener('transitionend', this.onYearTransitionEnd);
        this.#panel.querySelector('#year_items').style.marginTop = 'calc(0px - var(--head-item-height))';
    }

    onYearDown(e) {
        if (e.currentTarget.classList.contains('disabled')) return;
        this.#isLock = true;

        this.#panel.querySelector('.year_item.selected').classList.remove('selected');
        this.#panel.querySelectorAll('.year_item')[0].classList.add('selected');
        
        this.#date.y -= 1;

        const items = this.#panel.querySelector('#year_items');
        items.classList.add('tr');
        items.addEventListener('transitionend', this.onYearTransitionEnd);
        this.#panel.querySelector('#year_items').style.marginTop = 'var(--head-item-height)';
    }

    onYearTransitionEnd(e) {
        const items = this.#panel.querySelector('#year_items');
        items.classList.remove('tr');
        items.removeEventListener('transitionend', this.onYearTransitionEnd);
        items.querySelectorAll('.year_item').forEach((item) => {
            item.classList.remove('tr');
        });

        this.#setPanelYear(this.#date.y);

        setTimeout(() => {
            this.#isLock = false;
        });
    }

    

    onOpen(e) {
        
    }

    open() {

    }

    onClose(e) {

    }

    close() {

    }

    get value() {
        return this.#getDateStr(this.#date);
    }

    get min() {
        return this.#getDateStr(this.#min);
    }

    get max() {
        return this.#getDateStr(this.#max);
    }

    set value(str) {
        let dateObj = this.#getDateObj(str);
        if (dateObj) {
            if (new Date(dateObj.y, dateObj.m, dateObj.d) < new Date(this.#min.y, this.#min.m, this.#min.d)) {
                console.error(`입력된 날짜가 최소 날짜 이전입니다. ${this.#getDateStr(dateObj)}, (min: ${this.min})`);
                return false;
            }

            if (new Date(dateObj.y, dateObj.m, dateObj.d) > new Date(this.#max.y, this.#max.m, this.#max.d)) {
                console.error(`입력된 날짜가 최대 날짜 이후입니다. ${this.#getDateStr(dateObj)}, (max: ${this.max})`);
                return false;
            }

            this.#date = dateObj;
            this.innerHTML = this.value;
            this.#initPanel();
        }
    }

    set min(str) {
        let dateObj = this.#getDateObj(str);
        if (dateObj) {
            if (new Date(dateObj.y, dateObj.m, dateObj.d) > new Date(this.#max.y, this.#max.m, this.#max.d)) {
                console.error(`최소 날짜가 최대 날짜 이후입니다. ${this.#getDateStr(dateObj)}, (max: ${this.max})`);
                return false;
            }

            if (new Date(dateObj.y, dateObj.m, dateObj.d) > new Date(this.#date.y, this.#date.m, this.#date.d)) {
                console.error(`최소 날짜가 설정 날짜 이후입니다. ${this.#getDateStr(dateObj)}, (value: ${this.value})`);
                return false;
            }

            this.#min = dateObj;
        }
    }

    set max(str) {
        let dateObj = this.#getDateObj(str);
        if (dateObj) {
            if (new Date(dateObj.y, dateObj.m, dateObj.d) < new Date(this.#min.y, this.#min.m, this.#min.d)) {
                console.error(`최대 날짜가 최소 날짜 이전입니다. ${this.#getDateStr(dateObj)}, (min: ${this.min})`);
                return false;
            }

            if (new Date(dateObj.y, dateObj.m, dateObj.d) < new Date(this.#date.y, this.#date.m, this.#date.d)) {
                console.error(`최대 날짜가 설정 날짜 이전입니다. ${this.#getDateStr(dateObj)}, (value: ${this.value})`);
                return false;
            }

            this.#max = dateObj;
        }
    }

    #getDateStr(obj) {
        return obj.y + '-' + ('0' + obj.m).slice(-2) + '-' + ('0' + obj.d).slice(-2);
    }

    #getDateObj(str) {
        if (typeof str !== 'string') {
            console.error('데이터 타입이 String이 아닙니다.', str);
            return false;
        }

        let dateArr = str.split('-');
        if (dateArr.length !== 3) {
            console.error('데이터 형식이 "yyyy-mm-dd"이 아닙니다.', str);
            return false;
        }

        let dateObj = {
            y: parseInt(dateArr[0]),
            m: parseInt(dateArr[1]),
            d: parseInt(dateArr[2])
        };

        if (dateObj.m < 1 || dateObj.m > 12) {
            console.error('월(mm)은 1이상, 12이하로 입력되어야 합니다.', str);
            return false;
        }

        let dateCnt = new Date(dateObj.y, dateObj.m, 0).getDate();
        if (dateObj.d < 1 || dateObj.d > dateCnt) {
            console.error(`${dateObj.y}년 ${dateObj.m}월의 일(dd)은 1이상, ${dateCnt}이하로 입력되어야 합니다.`, str);
            return false;
        }

        return dateObj;
    }

    #initPanel() {
        this.#setPanelYear(this.#date.y);
        this.#setPanelMonth(this.#date.m);
    }

    #setPanelYear() {
        const year = this.#date.y;
        
        const items = this.#panel.querySelector('#year_items');
        items.style.marginTop = 0;
        items.querySelectorAll('.year_item').forEach((item, idx) => {
            item.innerHTML = year - 1 + idx + '년';
            item.classList.toggle('selected', idx === 1);
            
            setTimeout(() => {
                item.classList.add('tr');
            });
        });

        this.#panel.querySelector('#year_up').classList.toggle('disabled', year == this.#max.y);
        this.#panel.querySelector('#year_down').classList.toggle('disabled', year == this.#min.y);
    }

    #setPanelMonth(month) {
        const items = this.#panel.querySelectorAll('.month_item');
        items.forEach((item, idx) => {
            item.innerHTML = (month + 11) % 12 + idx + '월';
        });
    }

    static get ver() {
        return '1.0.0';
    }

    static get is() {
        return 'ui-date-picker';
    }
}

customElements.define(UIDatePicker.is, UIDatePicker);