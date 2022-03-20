class UIDragHandler extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode:'open'});

		const style = document.createElement('style');
		style.textContent = `
			:host {
				position: relative;
			}

			:host #handle {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				cursor: grab;
			}

			:host #handle.press {
				cursor: grabbing;
			}
		`;

		this.target = '';

		this.handle = document.createElement('div');
		this.handle.id = 'handle';
		this.handle.addEventListener('mousedown', this.onPress.bind(this));
		this.handle.addEventListener('mousemove', this.onMove.bind(this));
		this.handle.addEventListener('mouseup', this.onRelease.bind(this));

		const slot = document.createElement('slot');
		
		shadow.append(style, this.handle, slot);
	}

	onPress(e) {
		e.stopImmediatePropagation;
		e.stopPropagation;

		if (this.isPress) return;
		this.isPress = true;
		
		this.handle.classList.add('press');
		this.prevX = e.pageX;
		this.prevY = e.pageY;
	}

	onMove(e) {
		e.stopImmediatePropagation;
		e.stopPropagation;

		if (!this.isPress) return;

		this.target.style.left = this.target.clientLeft + (e.pageX - this.prevX) + 'px';
		this.target.style.top = this.target.clientTop + (e.pageY - this.prevY) + 'px';

		this.prevX = e.pageX;
		this.prevY = e.pageY;
	}

	onRelease(e) {
		e.stopImmediatePropagation;
		e.stopPropagation;

		if (!this.isPress) return;
		this.isPress = false;

		this.handle.classList.remove('press');
	}

	connectedCallback() {
		if (!this.target) this.setTarget(this);
	}
	
	disconnectedCallback() {}

	static get observedAttributes() {
		return ['target'];
	}

	attributeChangedCallback(attr, oldValue, newValue) {
		if (attr == 'target') {
			this.resetTarget(oldValue == null ? this : oldValue);
			this.setTarget(newValue);
		}
	}

	setTarget(target) {
		const targetElement = this.getTarget(target);
		targetElement.prevPosition = targetElement.style.position || 'static';
		targetElement.style.position = 'fixed';
		
		this.target = targetElement;
	}

	resetTarget(target) {
		const targetElement = this.getTarget(target);
		targetElement.style.position = targetElement.prevPosition;
	}

	getTarget(target) {
		return (typeof target === 'string') ? document.querySelector(target) : target;
	}

	static get is() {
		return 'ui-drag-handler';
	}
}

customElements.define(UIDragHandler.is, UIDragHandler);