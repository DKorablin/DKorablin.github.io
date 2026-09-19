// Enlarges screenshots: <div class="gallery"><a href="full.png"><img src="thumb.png"></a></div>
// Without JS the link simply opens the full-size image.
(function () {
	var box = null;

	function close() {
		if (box) {
			box.remove();
			box = null;
		}
	}

	function open(url, alt) {
		close();
		box = document.createElement("div");
		box.className = "lightbox";
		box.setAttribute("role", "dialog");
		box.setAttribute("aria-label", alt || "Image preview");
		var img = document.createElement("img");
		img.src = url;
		img.alt = alt || "";
		box.appendChild(img);
		box.addEventListener("click", close);
		document.body.appendChild(box);
	}

	document.addEventListener("click", function (e) {
		var link = e.target.closest && e.target.closest(".gallery a");
		if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0)
			return;
		e.preventDefault();
		var img = link.querySelector("img");
		open(link.href, img ? img.alt : "");
	});

	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape")
			close();
	});
})();
