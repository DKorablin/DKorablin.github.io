// _includes/files_list.html
function toggleOlderReleases(button) {
	var show = button.textContent === button.dataset.showLabel;
	var olderReleases = button.parentElement.querySelectorAll(".older-release");
	for (var i = 0; i < olderReleases.length; i++)
		olderReleases[i].classList.toggle("show", show);

	button.textContent = show ? button.dataset.hideLabel : button.dataset.showLabel;
}