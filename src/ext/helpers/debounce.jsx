export const debounce = (func, wait) => {
	let timeout;
	return function () {
		const context = this;
		const args = arguments;
		const later = function () {
			timeout = null;
			func.apply(context, args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

export const throttle = (func, timeFrame) => {
	var lastTime = 0;
	return function () {
		var now = new Date();
		if (now - lastTime >= timeFrame) {
			func();
			lastTime = now;
		}
	};
};

