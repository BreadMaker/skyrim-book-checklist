function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function createDatabase(json) {
  localStorage.setItem("database", JSON.stringify(json));
  console.log("Database created");
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
  let checklist = document.getElementsByClassName("checklist"),
    itemlist = document.getElementsByClassName("item");
  for (var i = 0; i < checklist.length; i++) {
    checklist[i].addEventListener("change", event => {
      let data = JSON.parse(localStorage.getItem("database"));
      data[event.target.dataset.id][0] = event.target.checked;
      localStorage.setItem("database", JSON.stringify(data));
    });
  }
  for (var i = 0; i < itemlist.length; i++) {
    itemlist[i].addEventListener("click", event => {
      if (!event.target.classList.contains("checklist")) {
        event.target.parentElement.getElementsByClassName("checklist")[0].click();
      }
    });
  }
}

function buildCheckList() {
  console.log("BUILD");
  let data = JSON.parse(localStorage.getItem("database")),
    container = document.getElementById("checklist"),
    typeList = {
      "b": "Book",
      "sb": "Skill Book",
      "st": "Spell Tome",
      "bb": "Black Book",
      "ln": "Letters/Note",
      "j": "Journal",
      "tm": "Treasure Map"
    },
    shelfCounter = 0;
  for (let key in data) {
    let row = document.createElement("tr");
    if (shelfCounter == 11) {
      row.className = "item border-bottom border-primary";
      shelfCounter = 0;
    } else {
      row.className = "item";
    }
    for (let k in data[key]) {
      let item = document.createElement("td"),
        value = data[key][k],
        content;
      switch (parseInt(k)) {
        case 0:
          item.className = "text-center";
          content = document.createElement("input");
          content.type = "checkbox";
          content.className = "checklist form-check-input";
          content.checked = value;
          content.dataset.id = key;
          break;
        case 2:
          if (value.toString() == "b" || value.toString() == "sb") {
            shelfCounter += 1;
          }
          content = document.createTextNode(typeList[value]);
          break;
        default:
          content = document.createTextNode(value);
      }
      item.appendChild(content);
      row.append(item);
    }
    container.append(row);
  }
  addEvents();
}

ready(function() {
  try {
    localStorage.setItem("supportTest", true);
    localStorage.removeItem("supportTest");
    console.log("localStorage is supported");
  } catch (e) {
    console.log("localStorage is NOT supported");
  }
  initDatabase();
});
