const molecule = document.getElementById("molecule").innerText;

document.addEventListener("DOMContentLoaded", function () {
  var molBlock = molecule;
  if (molBlock.trim()) {
    var viewer = $3Dmol.createViewer("viewer", {
      backgroundColor: "transparent",
    });
    viewer.addModel(molBlock, "sdf");

    viewer.setStyle({}, { stick: { radius: 0.07 }, sphere: { radius: 0.3 } });

    viewer.setBackgroundColor("white");

    viewer.zoomTo();
    viewer.render();
    viewer.zoom(1.2, 500);

    document
      .getElementById("animationCheckbox")
      .addEventListener("click", function () {
        var text = document.getElementById("animationStatus");
        let svg = document.getElementById("animationCheckboxSvg");
        if (svg.style.display === "none") {
          viewer.spin(true, 2);
          text.innerHTML = "Вимкнути анімацію";
          svg.style.display = "flex";
        } else {
          viewer.spin(false);
          text.innerHTML = "Увімкнути анімацію";
          svg.style.display = "none";
        }
      });

    document
      .getElementById("showTextCheckbox")
      .addEventListener("click", function () {
        var text = document.getElementById("ShowTextStatus");
        let svg = document.getElementById("showTextSvg");

        if (svg.style.display === "none") {
          text.innerHTML = "Приховати підписи";
          svg.style.display = "flex";

          var atoms = viewer.getModel().selectedAtoms({});
          atoms.forEach((atom) => {
            viewer.addLabel(atom.elem, {
              position: { x: atom.x, y: atom.y, z: atom.z },
              fontSize: 18,
              fontColor: "black",
              backgroundColor: "#EEEEEE",
              backgroundOpacity: 0.0,
            });
          });
        } else {
          text.innerHTML = "Показати підписи";
          svg.style.display = "none";
          viewer.removeAllLabels();
        }
        viewer.render();
      });
  } else {
    console.error("MolBlock порожній або не був переданий.");
  }
});

const downloadBtn = document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", function () {
  var Data = molecule;
  if (Data.trim()) {
    var blob = new Blob([Data], { type: "text/plain" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = molecule_name + ".sdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    console.error("SDF дані порожні!");
  }
});

let scrollPosition = 0;

function openFullscreen() {
  scrollPosition = window.scrollY;
  console.log("Збережена позиція скролу:", scrollPosition);

  const elem = document.getElementById("viewer");

  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  ) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  } else {
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  }
}

function onFullscreenChange() {
  const isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;

  console.log("Fullscreen змінено. Статус:", isFullscreen);

  if (isFullscreen) {
    if (downloadBtn) downloadBtn.disabled = true;
  } else {
    if (downloadBtn) downloadBtn.disabled = false;

    // Відновлення скролу з невеликою затримкою (щоб браузер встиг оновити DOM)
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: "smooth" });
      console.log("Відновлено скрол на:", scrollPosition);
    }, 50);
  }
}

document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("webkitfullscreenchange", onFullscreenChange);
document.addEventListener("msfullscreenchange", onFullscreenChange);
