document.addEventListener("DOMContentLoaded", function () {
    let element = $("#viewer");
    let config = { backgroundColor: '#FFFFFF' };
    let viewer = $3Dmol.createViewer(element, config);

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    async function findStructure(name) {
        const url = `/api/structure/?name=${encodeURIComponent(name)}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Помилка пошуку: ${response.status}`);
            }

            const data = await response.json();

            if (data.length > 0) {
                const foundMolecule = data[0];
                return foundMolecule;
            } else {
                console.log("Цієї молекули ще немає в історії бази даних.");
                return null;
            }

        } catch (error) {
            console.error("Помилка під час отримання координат:", error);
        }
    }

    async function initStructureRendering() {
        let structureName = getCookie("structure");

        if (structureName) {
            let structure = await findStructure(structureName);
            let titleOfViewer = document.getElementById("titleOfViewer");
            titleOfViewer.innerText = "ChemViz | " + structureName;

            if (structure) {
                renderStructure(structure.coordinates, structure.format);
            } else {
                console.log("Структуру не знайдено в базі даних API.");
            }
        } else {
            console.log("Кукі порожні, користувач ще нічого не шукав.");
        }
    }

    initStructureRendering();


    function renderStructure(data, format) {
        viewer.clear();
        if (format === "xyz") {
            let model = viewer.addModel(data, "xyz");
            viewer.setStyle({}, {
                sphere: { scale: 0.22 },
                stick: { radius: 0.07 }
            });
        } else {
            let model = viewer.addModel(data, format);
            viewer.setStyle({}, { sphere: { radius: 0.3 }, stick: { radius: 0.07 } });
        }
        viewer.zoomTo();
        viewer.render();
    }

    const elem = document.getElementById("viewer");
    const openFullscreenBtn = document.getElementById("openFullscreenBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    if (openFullscreenBtn && elem) {
        openFullscreenBtn.addEventListener("click", function () {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        });
    }

    const handleResize = () => {
        if (viewer) {
            viewer.resize();
            viewer.render();
        }

        const isFull = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        if (downloadBtn) {
            downloadBtn.disabled = !!isFull;
        }
    };

    document.addEventListener('fullscreenchange', handleResize);
    document.addEventListener('webkitfullscreenchange', handleResize);
    document.addEventListener('msfullscreenchange', handleResize);

    const animCheckbox = document.getElementById('animationCheckbox');
    if (animCheckbox) {
        animCheckbox.addEventListener('click', function () {
            var text = document.getElementById('animationStatus');
            let svg = document.getElementById('animationCheckboxSvg');
            if (svg.style.display === 'none') {
                viewer.spin({ y: 1.5 });
                if (text) text.innerHTML = "Вимкнути анімацію";
                svg.style.display = 'flex';
            } else {
                viewer.spin(false);
                if (text) text.innerHTML = "Увімкнути анімацію";
                svg.style.display = 'none';
            }
        });
    }

    const showTextCheckbox = document.getElementById('showTextCheckbox');
    if (showTextCheckbox) {
        showTextCheckbox.addEventListener('click', function () {
            var text = document.getElementById('ShowTextStatus');
            let svg = document.getElementById('showTextSvg');

            if (svg.style.display === 'none') {
                if (text) text.innerHTML = "Приховати підписи";
                svg.style.display = 'flex';

                var model = viewer.getModel();
                if (model) {
                    var atoms = model.selectedAtoms({});
                    atoms.forEach(atom => {
                        viewer.addLabel(atom.elem, {
                            position: { x: atom.x, y: atom.y, z: atom.z },
                            fontSize: 14,
                            fontColor: "black",
                            backgroundColor: "#EEEEEE",
                            backgroundOpacity: 0.0
                        });
                    });
                }
            } else {
                if (text) text.innerHTML = "Показати підписи";
                svg.style.display = 'none';
                viewer.removeAllLabels();
            }
            viewer.render();
        });
    }
});