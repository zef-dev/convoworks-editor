export const getRandomColor = () => {
	var letters = "0123456789ABCDEF";
	var color = "#";

	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

export const getColor = (index) => {
	let arr = [
		"#56ebd3",
		"#fbacf6",
		"#9ee786",
		"#e4b5ff",
		"#c2e979",
		"#20d8fd",
		"#e8d25c",
		"#42edec",
		"#f3c46f",
		"#5cefba",
		"#e8de7a",
		"#7ee8c0",
		"#e8d98c",
		"#88e99a",
		"#cfdd73",
		"#8be8ad",
		"#dff799",
		"#b5eaa1",
		"#c2d681",
		"#b5e287",
	];

	return arr[index % arr.length]
};
