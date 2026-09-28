(function () {
	var triggers = Array.prototype.slice.call(document.querySelectorAll("a.uz-lightbox"));
	if (!triggers.length) return;

	var galleries = window.UZ_GALLERIES || {};

	var overlay = document.createElement("div");
	overlay.className = "uz-lightbox-overlay";
	overlay.innerHTML =
		'<button type="button" class="uz-lightbox-close" aria-label="Zamknij">&times;</button>' +
		'<button type="button" class="uz-lightbox-prev" aria-label="Poprzednie">&#8249;</button>' +
		'<button type="button" class="uz-lightbox-next" aria-label="Następne">&#8250;</button>' +
		'<figure class="uz-lightbox-figure">' +
		'<img class="uz-lightbox-img" src="" alt="">' +
		'<figcaption class="uz-lightbox-caption"></figcaption>' +
		"</figure>" +
		'<div class="uz-lightbox-thumbs"></div>';
	document.body.appendChild(overlay);

	var imgEl = overlay.querySelector(".uz-lightbox-img");
	var captionEl = overlay.querySelector(".uz-lightbox-caption");
	var closeBtn = overlay.querySelector(".uz-lightbox-close");
	var prevBtn = overlay.querySelector(".uz-lightbox-prev");
	var nextBtn = overlay.querySelector(".uz-lightbox-next");
	var thumbsEl = overlay.querySelector(".uz-lightbox-thumbs");

	var currentItems = [];
	var currentIndex = 0;

	function show(index) {
		currentIndex = (index + currentItems.length) % currentItems.length;
		var item = currentItems[currentIndex];
		imgEl.src = item.src;
		imgEl.alt = item.caption || "";
		captionEl.textContent = item.caption || "";
		captionEl.style.display = item.caption ? "block" : "none";
		var multi = currentItems.length > 1;
		prevBtn.style.display = multi ? "flex" : "none";
		nextBtn.style.display = multi ? "flex" : "none";

		var thumbButtons = thumbsEl.querySelectorAll(".uz-lightbox-thumb");
		thumbButtons.forEach(function (btn, i) {
			btn.classList.toggle("is-active", i === currentIndex);
		});
	}

	function renderThumbs() {
		thumbsEl.innerHTML = "";
		if (currentItems.length <= 1) {
			thumbsEl.style.display = "none";
			return;
		}
		thumbsEl.style.display = "flex";
		currentItems.forEach(function (item, i) {
			var btn = document.createElement("button");
			btn.type = "button";
			btn.className = "uz-lightbox-thumb";
			btn.setAttribute("aria-label", "Zdjęcie " + (i + 1));
			btn.innerHTML = '<img src="' + item.src + '" alt="">';
			btn.addEventListener("click", function () {
				show(i);
			});
			thumbsEl.appendChild(btn);
		});
	}

	function open(items, startIndex) {
		currentItems = items;
		renderThumbs();
		show(startIndex || 0);
		overlay.classList.add("is-open");
		document.body.style.overflow = "hidden";
	}

	function close() {
		overlay.classList.remove("is-open");
		document.body.style.overflow = "";
	}

	triggers.forEach(function (a) {
		a.addEventListener("click", function (e) {
			e.preventDefault();
			var category = a.getAttribute("data-category");
			var items = (category && galleries[category]) || [
				{ src: a.getAttribute("href"), caption: a.getAttribute("data-caption") || "" },
			];
			open(items, 0);
		});
	});

	closeBtn.addEventListener("click", close);
	prevBtn.addEventListener("click", function () {
		show(currentIndex - 1);
	});
	nextBtn.addEventListener("click", function () {
		show(currentIndex + 1);
	});

	overlay.addEventListener("click", function (e) {
		if (e.target === overlay) close();
	});

	document.addEventListener("keydown", function (e) {
		if (!overlay.classList.contains("is-open")) return;
		if (e.key === "Escape") close();
		if (e.key === "ArrowLeft") show(currentIndex - 1);
		if (e.key === "ArrowRight") show(currentIndex + 1);
	});
})();
