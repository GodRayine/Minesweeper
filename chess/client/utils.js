function toggleTheme() {
    const body = document.body;
    const checkbox = document.getElementById('theme-switch');
    if (checkbox.checked) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    }
}

function showElement(id) {
    document.getElementById(id).style.display = 'flex';
}

function hideElement(id) {
    document.getElementById(id).style.display = 'none';
}