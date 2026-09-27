// Upgrades media in project pages written in Markdown (e.g. README.md copied from a source repo),
// so they look like the hand-written HTML pages:
//   [![alt](thumb.png)](full.png)   -> image tile in a <div class="gallery"> (opens in js/lightbox.js)
//   [![alt](thumb.png)](demo.webm)  -> <video class="demo-video" controls> placed before the gallery
// Only paragraphs that contain nothing but linked images are touched, so inline images in text stay as they are.
(function () {
	var article = document.querySelector(".doc-body");
	if (!article)
		return;

	var VIDEO = /\.(webm|mp4|m4v|ogv|mov)(\?|#|$)/i;
	var TYPES = { webm: "video/webm", mp4: "video/mp4", m4v: "video/mp4", ogv: "video/ogg", mov: "video/quicktime" };

	function isImageLink(node) {
		return node.nodeType === 1 && node.tagName === "A" && node.children.length === 1 && node.firstElementChild.tagName === "IMG";
	}

	function isMediaParagraph(p) {
		var found = false;
		for (var node = p.firstChild; node; node = node.nextSibling) {
			if (node.nodeType === 3 && !node.textContent.trim())
				continue;
			if (node.nodeType === 1 && node.tagName === "BR")
				continue;
			if (!isImageLink(node))
				return false;
			found = true;
		}
		return found;
	}

	function makeVideo(link) {
		var url = link.getAttribute("href");
		var ext = (url.match(VIDEO) || [])[1];
		var video = document.createElement("video");
		video.className = "demo-video";
		video.controls = true;
		video.preload = "metadata";
		var source = document.createElement("source");
		source.src = url;
		if (ext && TYPES[ext.toLowerCase()])
			source.type = TYPES[ext.toLowerCase()];
		video.appendChild(source);
		video.appendChild(link.cloneNode(true)); // fallback: the original thumbnail link
		return video;
	}

	var paragraphs = article.querySelectorAll("p");
	for (var i = 0; i < paragraphs.length; i++) {
		var p = paragraphs[i];
		if (p.closest(".gallery") || !isMediaParagraph(p))
			continue;

		var gallery = document.createElement("div");
		gallery.className = "gallery";
		var links = p.querySelectorAll("a");
		for (var j = 0; j < links.length; j++) {
			var link = links[j];
			if (VIDEO.test(link.getAttribute("href") || ""))
				p.parentNode.insertBefore(makeVideo(link), p);
			else
				gallery.appendChild(link);
		}

		if (gallery.children.length)
			p.parentNode.replaceChild(gallery, p);
		else
			p.remove();
	}
})();