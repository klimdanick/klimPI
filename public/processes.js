let layout;
let menu;
let processes = [];

window.onload = () => {
    BuildPage();

    fetch("/processes").then(respose => respose.json()).then(data => {
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            processes.push(ProcessCard(data[i]));
            layout.appendChild(processes[i]);
        }
    })
}

function BuildPage() {
    layout = new Layout().setAsMain();
    layout.style.flexWrap = "wrap";
    menu = new HamburgerMenu();
    menu.htmlEl.classList.add("MainMenu");
    layout.htmlEl.classList.add("MainLayout");
    layout.appendChild(menu);

    let menuItems = [
        new SimpleMenuItem("assets/processes.png", "processes", () => {
            while (layout.htmlEl.children.length > 1) {
                layout.htmlEl.removeChild(layout.htmlEl.children[layout.htmlEl.children.length - 1])
            }
            for (let i = 0; i < processes.length; i++) layout.appendChild(processes[i]);
        }),
        new SimpleMenuItem("assets/proxy.png", "proxy", () => {
            while (layout.htmlEl.children.length > 1) {
                layout.htmlEl.removeChild(layout.htmlEl.children[layout.htmlEl.children.length - 1])
            }
        }),
        new SimpleMenuItem("assets/files.png", "files", () => {
            while (layout.htmlEl.children.length > 1) {
                layout.htmlEl.removeChild(layout.htmlEl.children[layout.htmlEl.children.length - 1])
            }
        }),
    ]

    menu.addHead(`<h2>KLIM<span style="color: #c40f43;"> π</span></h2>`);
    menu.head.preload.src = "/elementaljs/src/assets/menu.png";
    menu.appendChildren(menuItems);
    setTimeout(() => {menuItems[0].htmlEl.onclick();}, 10);
}

function ProcessCard(p) {
    let id = p.id;
    let name = p.name;
    let cardLayout = new Layout("row");
    cardLayout.style.height = "12em";
    cardLayout.style.width = "300px";
    cardLayout.style.margin = "1em";
    let card = new Card("250px");
    card.htmlEl.classList.add("processCard");
    let tabMenu = new TabMenu();

    card.appendChild(`<h3>${name}</h3>`);

    card.open = (e) => {
        while (card.htmlEl.children.length > 1) {
            card.htmlEl.removeChild(card.htmlEl.children[card.htmlEl.children.length - 1])
        }
        card.htmlEl.appendChild(e);
        hljs.highlightAll();
        try {
            let chart = new CanvasJS.Chart(`graph-${id}`, {
                theme: "dark1", // "light1", "light2", "dark1", "dark2"
                animationEnabled: false,
                zoomEnabled: true,
                data: [{
                    type: "area",
                    dataPoints: [{ x: 0, y: 10 }, { x: 10, y: 15 }, { x: 20, y: 5 }]
                }]
            });
            chart.render();
        } catch { }
    }

    card.graphCanvas = document.createElement("div");
    card.graphCanvas.id = `graph-${id}`;
    card.graphCanvas.classList.add("graph");
    card.open(card.graphCanvas)

    card.logs = document.createElement("pre");
    let codeString = window.onload.toString().replaceAll("  ", "");
    card.logs.innerHTML = `<code>${codeString}</code>`;

    let runButton, stopButton;

    let tabs = [
        new TabMenuItem("/assets/processor.png", () => { card.open(card.graphCanvas) }),
        new TabMenuItem("/assets/files.png", () => { card.open(card.logs) }),
        new TabMenuItem("/assets/settings.png", () => { card.open() }),
        runButton = new TabMenuItem("/assets/play.png", () => { }),
    ]
    runButton.htmlEl.onclick = () => {
        runButton.htmlEl.classList.toggle("running");
    };
    runButton.style.backgroundColor = "var(--primary)";

    tabMenu.appendChildren(tabs);
    tabMenu.htmlEl.classList.add("cardTabs");
    setTimeout(() => {
        tabs[0].htmlEl.onclick();
    }, 10);

    cardLayout.appendChild(tabMenu);
    cardLayout.appendChild(card);
    return cardLayout;
}