let layout;
let menu;
let processes = [];

let CURIOS_BLUE = "#299ad0";
let TURMERIC_YELLOW = "#d0b747";
let AQUA_GREEN = "#05d993";
let DEBIAN_RED = "#d70e48";

// Create WebSocket connection.
let socket;

window.onload = () => {
    BuildPage();

    fetch("/admin/processes").then(respose => respose.json()).then(data => {
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            processes.push(ProcessCard(data[i]));
            layout.appendChild(processes[i]);
        }
    })

    initSocket();
}

function initSocket() {
    socket = new WebSocket("ws://localhost:1443/admin/data");

    // Connection opened
    socket.addEventListener("open", (event) => {
    socket.send("Hello Server!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
        let data = JSON.parse(event.data);
        let p;
        for (let i = 0; i < processes.length && !p && i < 100; i++) {
            if (processes[i] && processes[i].id == data.id) p = processes[i];
        }
        if (p) {
            p.data[data.type].push({x: new Date(data.x), y: data.y});
            while (p.data[data.type].length > 100) p.data[data.type].shift();
            p.chart.render();
        }
    });
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
    cardLayout.id = id;
    let card = new Card("250px");
    card.htmlEl.classList.add("processCard");
    let tabMenu = new TabMenu();

    card.appendChild(`<h3>${name}</h3>`);

    cardLayout.data = [];
    for (let i = 0; i < 4; i++) cardLayout.data.push([]);

    card.open = (e) => {
        while (card.htmlEl.children.length > 1) {
            card.htmlEl.removeChild(card.htmlEl.children[card.htmlEl.children.length - 1])
        }
        card.htmlEl.appendChild(e);
        hljs.highlightAll();
        try {
            cardLayout.chart = new CanvasJS.Chart(`graph-${id}`, {
                theme: "dark1", // "light1", "light2", "dark1", "dark2"
                animationEnabled: false,
                zoomEnabled: true,
                data: [{
                    type: "spline",
                    dataPoints: cardLayout.data[0],
                    color: DEBIAN_RED
                }, {
                    type: "spline",
                    dataPoints: cardLayout.data[1],
                    color: TURMERIC_YELLOW
                }, {
                    type: "spline",
                    dataPoints: cardLayout.data[2],
                    color: AQUA_GREEN
                }, {
                    type: "spline",
                    dataPoints: cardLayout.data[3],
                    color: CURIOS_BLUE
                }]
            });

            // console.log(chart);
            cardLayout.chart.render();
        } catch { }
    }

    card.graphCanvas = document.createElement("div");
    card.graphCanvas.id = `graph-${id}`;
    card.graphCanvas.classList.add("graph");
    card.open(card.graphCanvas)

    card.logs = document.createElement("pre");
    let codeString = `target url: http://localhost:8085/assets/proxy.png
request url: /assets/files.png, ::1, 2025-02-02T19:27:32.833Z
target url: http://localhost:8085/assets/files.png
request url: /elementaljs/src/assets/menu.png, ::1, 2025-02-02T19:27:32.836Z
target url: http://localhost:80/src/assets/menu.png
request url: /assets/processor.png, ::1, 2025-02-02T19:27:32.863Z
target url: http://localhost:8085/assets/processor.png
request url: /assets/settings.png, ::1, 2025-02-02T19:27:32.864Z
target url: http://localhost:8085/assets/settings.png
request url: /assets/play.png, ::1, 2025-02-02T19:27:32.865Z
target url: http://localhost:8085/assets/play.png`;
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