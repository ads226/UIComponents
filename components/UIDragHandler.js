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

		this.onPress = this.onPress.bind(this);
		this.onMove = this.onMove.bind(this);
		this.onRelease = this.onRelease.bind(this);
		this.onTransitionEnd = this.onTransitionEnd.bind(this);

		this.target = '';

		this.handle = document.createElement('div');
		this.handle.id = 'handle';
		this.handle.addEventListener('mousedown', this.onPress);

		const slot = document.createElement('slot');

		shadow.append(style, this.handle, slot);
	}

	onPress(e) {
		e.stopImmediatePropagation;
		e.stopPropagation;

		this.handle.classList.add('press');

		this.prevX = e.clientX;
		this.prevY = e.clientY;

		window.addEventListener('mousemove', this.onMove);
		window.addEventListener('mouseup', this.onRelease);
		window.addEventListener('mouseleave', this.onRelease);
	}

	onMove(e) {
		this.target.style.left = this.target.offsetLeft + (e.clientX - this.prevX) + 'px';
		this.target.style.top = this.target.offsetTop + (e.clientY - this.prevY) + 'px';

		this.prevX = e.clientX;
		this.prevY = e.clientY;
	}

	onRelease(e) {
		window.removeEventListener('mousemove', this.onMove);
		window.removeEventListener('mouseup', this.onRelease);
		window.removeEventListener('mouseleave', this.onRelease);

		this.handle.classList.remove('press');

		let tX = -1;
		let tY = -1;
		let parent = this.target.offsetParent;
		let right = parent.offsetWidth - this.target.offsetWidth;
		let bottom = parent.offsetHeight - this.target.offsetHeight;

		if (this.target.offsetLeft < 0) tX = 0;
		if (this.target.offsetLeft > right) tX = right;
		if (this.target.offsetTop < 0) tY = 0;
		if (this.target.offsetTop > bottom) tY = bottom;

		if (!~tX && !~tY) return;

		if (!~tX) tX = this.target.offsetLeft;
		if (!~tY) tY = this.target.offsetTop;

		this.prevTransition = this.target.style.transition;
		this.target.style.transition = '0.25s';
		this.target.addEventListener('transitionend', this.onTransitionEnd);

		setTimeout(() => {
			this.target.style.left = 'max(0px, min(' + tX + 'px, ' + this.target.offsetLeft + 'px))';
			this.target.style.top = 'max(0px, min(' + tY + 'px, ' + this.target.offsetTop + 'px))';
		}, 0);
	}

	onTransitionEnd() {
		this.target.removeEventListener('transitionend', this.onTransitionEnd);
		this.target.style.transition = this.prevTransition;

		this.target.style.left = this.target.offsetLeft + 'px';
		this.target.style.top = this.target.offsetTop + 'px';
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
		targetElement.style.position = 'absolute';

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