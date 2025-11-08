/*global tmpl, bootstrap*/
function ready(fn) {
  if (document.readyState != "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function createDatabase(json) {
  let database = {
    database: Array()
  };
  for (let i in json) {
    database.database.push({
      id: parseInt(i),
      added: undefined,
      owned: json[i][0],
      title: json[i][1],
      type: json[i][2],
      variant: json[i][3],
      skill: json[i][4],
      school: json[i][5],
      difficulty: json[i][6],
      quest: json[i][7],
      dlc: json[i][8],
      extra: json[i][9],
      location: json[i][10]
    });
  }
  console.log("Database created");
  localStorage.setItem("database", JSON.stringify(database));
  buildCheckList();
}

function initDatabase() {
  if (localStorage.getItem("database") !== null) {
    console.log("Database exists");
    buildCheckList();
  } else {
    console.log("Database does not exists!");
    fetch("database.json")
      .then(response => response.json())
      .then(json => createDatabase(json));
  }
}

function addEvents() {
  console.time("Events added");
  let detailsModal = new bootstrap.Modal(document.getElementById("item-detail-modal"));
  Array.from(document.querySelectorAll("#checklist .list-group-item > div > div:not(.form-check-input-container)")).forEach(element => {
    element.addEventListener("click", event => {
      let database = JSON.parse(localStorage.getItem("database")),
        elementData = event.currentTarget.parentElement.parentElement.dataset,
        databaseEntry = database.database[elementData.id];
      document.getElementById("item-detail-title").textContent = "(" + elementData.type + ") " + databaseEntry.title;
      document.getElementById("item-detail-variant").textContent = databaseEntry.variant;
      document.getElementById("item-detail-dlc").textContent = databaseEntry.dlc;
      document.getElementById("item-detail-owned").textContent = databaseEntry.owned ? "Added: " + databaseEntry.added : "Not owned yet";
      document.getElementById("item-detail-skill").textContent = databaseEntry.skill;
      document.getElementById("item-detail-school").textContent = databaseEntry.school;
      document.getElementById("item-detail-difficulty").textContent = databaseEntry.difficulty;
      document.getElementById("item-detail-quest").textContent = databaseEntry.quest;
      document.getElementById("item-detail-extra").textContent = databaseEntry.extra;
      document.getElementById("item-detail-location").textContent = databaseEntry.location;
      detailsModal.show();
      console.log("CLICK", databaseEntry);
      event.preventDefault();
    });
  });
  Array.from(document.querySelectorAll("#checklist .form-check-input")).forEach(element => {
    element.addEventListener("change", event => {
      let database = JSON.parse(localStorage.getItem("database")),
        target = event.target;
      if (target.checked) {
        let now = Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        }).format(new Date());
        database.database[target.dataset.id].owned = target.checked;
        database.database[target.dataset.id].added = now;
        target.parentElement.parentElement.querySelector(".date-added").textContent = "Added: " + now;
        localStorage.setItem("database", JSON.stringify(database));
      } else {
        if (localStorage.getItem("dont-ask-uncheck-setting") === null || localStorage.getItem("dont-ask-uncheck-setting") === "false") {
          target.checked = true;
          areYouSureModal.show();
          document.getElementById("are-you-sure-item-details").innerHTML = "<strong>" + database.database[target.dataset.id].title + "</strong>, added " + database.database[target.dataset.id].added;
          document.getElementById("are-you-sure-modal").addEventListener("hide.bs.modal", () => {
            document.getElementById("are-you-sure-confirm").addEventListener("click", () => {
              database.database[target.dataset.id].owned = false;
              database.database[target.dataset.id].added = undefined;
              target.parentElement.parentElement.querySelector(".date-added").textContent = "Not owned yet";
              localStorage.setItem("database", JSON.stringify(database));
              target.checked = false;
              if (document.getElementById("are-you-sure-checkbox").checked) {
                localStorage.setItem("dont-ask-uncheck-setting", true);
                document.getElementById("dont-ask-uncheck-setting").checked = true;
              }
            }, {
              once: true
            });
          }, {
            once: true
          });
        } else {
          database.database[target.dataset.id].owned = false;
          database.database[target.dataset.id].added = undefined;
          target.parentElement.parentElement.querySelector(".date-added").textContent = "Not owned yet";
          localStorage.setItem("database", JSON.stringify(database));
        }
      }
    });
  });
  console.timeEnd("Events added");
}

function buildCheckList() {
  console.time("Checklist built");
  let data = JSON.parse(localStorage.getItem("database"));
  document.getElementById("checklist").innerHTML = tmpl("tmpl-book", data);
  document.querySelectorAll(".list-group-item[data-type='b']").forEach(item => {
    item.classList.remove("d-none");
  });
  console.timeEnd("Checklist built");
  addEvents();
}

function showItems(type) {
  document.querySelectorAll(".list-group-item").forEach(item => {
    item.classList.add("d-none");
  });
  document.querySelectorAll(".list-group-item[data-type='" + type + "']").forEach(item => {
    item.classList.remove("d-none");
  });
}

let areYouSureModal,
  offcanvas = new bootstrap.Offcanvas(document.getElementById("menu-offcanvas"));

ready(function () {
  // localStorage MUST be available
  try {
    localStorage.setItem("supportTest", true);
    localStorage.removeItem("supportTest");
    console.log("localStorage is supported");
    initDatabase();
  } catch (e) {
    console.log("localStorage is NOT supported");
  }
  // Init menu
  document.querySelectorAll(".menu-link").forEach(item => {
    item.addEventListener("click", event => {
      event.preventDefault();
      if (event.currentTarget.hasAttribute("data-type")) {
        document.getElementById("menu-title").textContent = event.currentTarget.querySelector(".menu-link-title").textContent;
        document.querySelectorAll(".menu-link.active").forEach(item => {
          item.classList.remove("active");
        });
        document.querySelectorAll(".menu-link[data-type=" + event.currentTarget.dataset.type + "]").forEach(item => {
          item.classList.add("active");
        });
        document.getElementById("settings").classList.add("d-none");
        showItems(event.currentTarget.dataset.type);
      } else {
        document.getElementById("menu-title").textContent = "Settings";
        document.querySelectorAll(".menu-link.active").forEach(item => {
          item.classList.remove("active");
        });
        document.querySelectorAll(".menu-link.goto-settings").forEach(item => {
          item.classList.add("active");
        });
        document.querySelectorAll(".list-group-item").forEach(item => {
          item.classList.add("d-none");
        });
        document.getElementById("settings").classList.remove("d-none");
      }
      offcanvas.hide();
    });
  });
  document.getElementById("menu-toggle-offcanvas").addEventListener("click", event => {
    event.stopPropagation();
    event.preventDefault();
    offcanvas.show();
  });
  // Touch events
  let touchstartX = 0;
  let touchendX = 0;

  const gestureZone = document;

  gestureZone.addEventListener("touchstart", function (event) {
    touchstartX = event.changedTouches[0].screenX;
  }, false);

  gestureZone.addEventListener("touchmove", function (event) {
    touchendX = event.changedTouches[0].screenX;
    handleGesture();
  }, false);

  function handleGesture() {
    if (touchendX <= touchstartX) {
      console.log("Swiped left", touchstartX - touchendX);
    }
    if (touchendX >= touchstartX) {
      console.log("Swiped right", touchendX - touchstartX);
    }
  }
  // Settings
  if (localStorage.getItem("dont-ask-uncheck-setting") !== null && localStorage.getItem("dont-ask-uncheck-setting") == "true") {
    document.getElementById("dont-ask-uncheck-setting").checked = true;
  }
  areYouSureModal = new bootstrap.Modal(document.getElementById("are-you-sure-modal"));
  document.getElementById("dont-ask-uncheck-setting").addEventListener("change", event => {
    localStorage.setItem("dont-ask-uncheck-setting", event.target.checked);
  });
  document.getElementById("are-you-sure-modal").addEventListener("show.bs.modal", () => {
    if (localStorage.getItem("dont-ask-uncheck-setting") === null) {
      document.getElementById("are-you-sure-checkbox").checked = false;
    } else {
      document.getElementById("are-you-sure-checkbox").checked = localStorage.getItem("dont-ask-uncheck-setting") == "true";
    }
  });
  if (localStorage.getItem("dark-mode-setting") === null) {
    localStorage.setItem("dark-mode-setting", true);
  }
  if (localStorage.getItem("dark-mode-setting") == "false") {
    document.getElementById("dark-mode-setting").checked = false;
    Array.from(document.querySelectorAll("[data-dark-mode]")).forEach(element => {
      element.classList.replace("bg-dark", "bg-light");
      element.classList.replace("text-light", "text-dark");
      element.classList.replace("navbar-dark", "navbar-light");
      element.dataset.darkMode = false;
      element.setAttribute("data-dark-mode", false);
    });
  }
  document.getElementById("dark-mode-setting").addEventListener("change", (event) => {
    let darkMode = event.target.checked;
    localStorage.setItem("dark-mode-setting", darkMode);
    Array.from(document.querySelectorAll("[data-dark-mode]")).forEach(element => {
      if (darkMode) {
        element.classList.replace("bg-light", "bg-dark");
        element.classList.replace("text-dark", "text-light");
        element.classList.replace("navbar-light", "navbar-dark");
      } else {
        element.classList.replace("bg-dark", "bg-light");
        element.classList.replace("text-light", "text-dark");
        element.classList.replace("navbar-dark", "navbar-light");
      }
      element.dataset.darkMode = darkMode;
      element.setAttribute("data-dark-mode", darkMode);
    });
  });
  let eraseToast = new bootstrap.Toast(document.getElementById("delete-confirmed-toast")),
    dontToast = new bootstrap.Toast(document.getElementById("no-action-toast"));
  document.getElementById("confirm-delete-database-modal").addEventListener("hide.bs.modal", event => {
    if (event.explicitOriginalTarget.id == "confirm-delete-database-yes") {
      localStorage.removeItem("database");
      eraseToast.show();
      dontToast.hide();
    } else {
      dontToast.show();
      eraseToast.hide();
    }
  });
  // Misc
  [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]")).map(element => {
    new bootstrap.Tooltip(element);
  });
});
