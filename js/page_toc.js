// Builds the "On this page" list from the h2/h3 headings of a project page (_layouts/project.html).
(function () {
	var article = document.querySelector(".doc-body");
	var toc = document.querySelector(".page-toc");
	if (!article || !toc)
		return;

	var headings = article.querySelectorAll("h2, h3");
	if (headings.length < 3)
		return;

	function slug(text) {
		return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
	}

	var used = {};
	var existing = article.querySelectorAll("[id]");
	for (var i = 0; i < existing.length; i++)
		used[existing[i].id] = true;

	var title = document.createElement("h2");
	title.textContent = "On this page";
	var list = document.createElement("ul");

	for (var j = 0; j < headings.length; j++) {
		var h = headings[j];
		if (!h.id) {
			var id = slug(h.textContent);
			var unique = id;
			for (var n = 2; used[unique]; n++)
				unique = id + "-" + n;
			used[unique] = true;
			h.id = unique;
		}

		var li = document.createElement("li");
		if (h.tagName === "H3")
			li.className = "sub";
		var a = document.createElement("a");
		a.href = "#" + h.id;
		a.textContent = h.textContent;
		li.appendChild(a);
		list.appendChild(li);
	}

	toc.appendChild(title);
	toc.appendChild(list);
	toc.hidden = false;
})();
