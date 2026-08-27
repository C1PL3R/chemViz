let animationDelayStep = 0.05;


document.addEventListener("DOMContentLoaded", () => {
  let allLoadedMolecules = [];

  document.getElementById("MoleculeBtn").addEventListener("click", function (e) {
    closeBtn = document.getElementById("closeMenuCreateMolecule");
    modalDialog = document.getElementById("createMolecule");

    OpenModalDialog((openBtn = this), closeBtn, modalDialog);
  });

  document.getElementById("CrystalBtn").addEventListener("click", function (e) {
    closeBtn = document.getElementById("closeMenuCreateCrystal");
    modalDialog = document.getElementById("createCrystal");

    OpenModalDialog((openBtn = this), closeBtn, modalDialog);
  });


  document.getElementById("searchMoleculeBtn").addEventListener("click", function () {
    const inputMoleculeName = document.getElementById("searchMoleculeInput");
    const loader = document.getElementById("nameLoader");
    const loader_container = document.getElementById("loader_container");

    let MoleculeName = inputMoleculeName ? inputMoleculeName.value.trim() : "";

    if (!MoleculeName) {
      Swal.fire({
        title: "Введіть назву молекули!",
        text: "Поле не може бути порожнім.",
        icon: "warning",
        confirmButtonText: "ОК"
      });
      return;
    }

    loader.style.display = "inline-block";
    loader_container.style.display = "flex";

    axios
      .post(
        "/send-name-of-molecule/",
        { name: MoleculeName },
        {
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json",
          },
        }
      )
      .then((result) => {
        const data = result.data;
        if (data.status === "success") {
          document.getElementById("searchMoleculeBtn").style.display = "none";

          const link = document.getElementById("viewMolecule");
          link.href = "/visualizer/";
          link.style.display = "flex";

        } else {
          Swal.fire({
            title: "Помилка!",
            text: data.error || "Щось пішло не так",
            icon: "error",
            confirmButtonText: "ОК",
          });
          console.error(data.error);
        }
      })
      .catch((error) => {
        console.error("Критична помилка на фронтенді:", error);
        Swal.fire({
          title: "Помилка!",
          text: error.response?.data?.error || error.message || "Сталася невідома помилка",
          icon: "error",
          confirmButtonText: "ОК",
        });
      })
      .finally(() => {
        loader.style.display = "none";
        loader_container.style.display = "none";
      });
  });

  document.getElementById("searchCrystalBtn").addEventListener("click", function () {
    const inputCrystalName = document.getElementById("searchCrystalInput");
    const loader = document.getElementById("formulaLoader");
    const loader_container = document.getElementById("loader_container");

    let crystalName = inputCrystalName.value.trim();

    if (!crystalName) {
      let timerInterval;
      Swal.fire({
        title: "Введіть назву кристалу!",
        html: "До закриття <b></b> мсек.",
        timer: 1000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      });
      return;
    }

    loader.style.display = "inline-block";
    loader_container.style.display = "flex";

    axios
      .post(
        "/send-name-of-crystal/",
        { name: crystalName },
        {
          headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        const data = res.data;
        if (data.status === "success") {
          saveCoordinateToCache(data.name, data.mol_coordinates, data.fileFormat)
          this.style.display = "none";

          const link = document.getElementById("viewCrystal");
          link.href = "/visualizer/";
          link.style.display = "flex";
        } else {
          Swal.fire({
            title: "Помилка!",
            text: data.error || "Щось пішло не так",
            icon: "error",
            confirmButtonText: "ОК",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "Помилка!",
          text: error.response?.data?.error || "Сталася невідома помилка",
          icon: "error",
          confirmButtonText: "ОК",
        });
      })
      .finally(() => {
        loader.style.display = "none";
        loader_container.style.display = "none";
      });
  });

  var openBtn, closeBtn, modalDialog;

  let container = document.getElementById("molecule-container");
  let searchMoleculeInput = document.getElementById("searchMoleculeAndCrystalInput");
  let searchMoleculeInputMobile = document.getElementById("searchMoleculeInputMobile");

  searchMoleculeInput.addEventListener("input", function (e) {
    let searchText = this.value.trim().toLowerCase();

    let elements = Array.from(container.children);

    elements.forEach((element) => {
      let name = element.textContent.trim().toLowerCase();
      element.style.display = name.includes(searchText) ? "" : "none";
    });
  });

  searchMoleculeInputMobile.addEventListener("input", function (e) {
    let searchText = this.value.trim().toLowerCase();

    let elements = Array.from(container.children);

    elements.forEach((element) => {
      let name = element.textContent.trim().toLowerCase();
      element.style.display = name.includes(searchText) ? "" : "none";
    });
  });
});




document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM повністю завантажено");

  let offset = 0;
  const limit = 40;

  function formatDateToDMY(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  function OpenModel(name, id) {
    window.location.href = `/visualizer/?id=${id}`;
  }

  function loadMolecules(initial = false) {
    const container = document.getElementById("molecule-container");
    const loadMoreBtn = document.getElementById("load-more");

    if (initial) {
      offset = 0;
      container.innerHTML = "";
    }

    axios
      .get(`/api/molecule-history/?offset=${offset}&limit=${limit}`)
      .then((response) => {
        const data = response.data;
        console.log("Отримано молекули:", data.results);

        if (data.results.length === 0 && offset === 0) {
          container.innerHTML = "<p>Молекули відсутні.</p>";
          loadMoreBtn.style.display = "flex";
          return;
        }

        data.results.forEach((mol) => {
          const el = document.createElement("section");
          el.className = "element";
          el.id = `mol-${mol.id}`;
          el.onclick = () => OpenModel(mol.name, mol.id);

          let iconSvg = "";
          if (mol.type === "molecule") {
            iconSvg = `
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              <path d="M10 14L7 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <path d="M10.5 10.5L6 6" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <circle cx="18" cy="19" r="1" stroke="currentColor" stroke-width="2" />
              <path d="M14 14L18 19" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <circle cx="19" cy="5" r="2" stroke="currentColor" stroke-width="2" />
              <path d="M17 7L14 10" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              <circle cx="5.5" cy="5.5" r="2.5" fill="currentColor" />
              <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" stroke-width="2" />
            </svg>`;
          } else if (mol.type === "crystal") {
            iconSvg = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none">
              <rect width="48" height="48" fill="none" />
              <path
                  d="M39,29.3V18.7A8,8,0,0,0,37,3a8,8,0,0,0-7.7,6H18.7A8,8,0,0,0,3,11a8,8,0,0,0,6,7.7V29.3A8,8,0,0,0,11,45a8,8,0,0,0,7.7-6H29.3A8,8,0,1,0,39,29.3ZM29.3,35H18.7A7.9,7.9,0,0,0,13,29.3V18.7A7.9,7.9,0,0,0,18.7,13H29.3A7.9,7.9,0,0,0,35,18.7V29.3A7.9,7.9,0,0,0,29.3,35Z"
                  fill="currentColor" />
            </svg>`;
          }

          el.innerHTML = `
              ${iconSvg}
              <span class="name">${mol.name}</span>
              <span class="date">${formatDateToDMY(mol.created_at)}</span>
          `;

          container.appendChild(el);
        });


        offset += limit;

        if (!data.next) {
          loadMoreBtn.style.display = "none";
        } else {
          loadMoreBtn.style.display = "flex";
        }
      })
      .catch((err) => {
        console.error("Помилка при завантаженні молекул:", err);
      });
  }

  loadMolecules(true);

  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      loadMolecules();
    });
  } else {
    console.warn('Кнопка "Завантажити ще" не знайдена');
  }
});
