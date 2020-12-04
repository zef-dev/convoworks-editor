export const backspaceFix = () => {
	document.querySelector('div').addEventListener('keydown', function(event) {
		// Check for a backspace
		if (event.which === 8) {
			console.log('event')
			var s = window.getSelection();
			var r = s.getRangeAt(0)
			var el = r.startContainer.parentElement
			// Check if the current element is the .label
			if (el.classList.contains('label')) {
				// Check if we are exactly at the end of the .label element
				if (r.startOffset === r.endOffset && r.endOffset === el.textContent.length) {
					// prevent the default delete behavior
					event.preventDefault();
					if (el.classList.contains('highlight')) {
						// remove the element
						el.remove();
					} else {
						el.classList.add('highlight');
					}
					return;
				}
			}
		}
		event.target.querySelectorAll('span').forEach(function(el) { el.classList.remove('span');})
	});
} 