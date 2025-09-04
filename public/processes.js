let layout;
let menu;
let processes = [];
let proxy;

let CURIOS_BLUE = "#299ad0";
let TURMERIC_YELLOW = "#d0b747";
let AQUA_GREEN = "#05d993";
let DEBIAN_RED = "#d70e48";

// Create WebSocket connection.
let socket;

let forbiddenToast = new Toast("You are not permitted to do this action!");

OnElementalLoad = () => {
    BuildPage();

    fetch("/admin/processes").then(respose => respose.json()).then(data => {
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            processes.push(ProcessCard(data[i]));
            layout.appendChild(processes[i]);
        }
    })

    fetch("/admin/proxy").then(respose => respose.json()).then(data => {
        console.log(data);
        proxy = new Layout();
        data.sort((a, b) => a.port - b.port);
        for (let i = 0; i < data.length; i++) {
            proxy.appendChild(ProxyCard(data[i]));
            if (data[i].default) {
                data[i].url = "/";
                data[i].name = "default";
                proxy.appendChild(ProxyCard(data[i]));
            }
        }
    })
    

    initSocket();
}

function initSocket() {
    socket = new WebSocket(`wss://${window.location.host}${window.location.pathname}/data`);

    // Connection opened
    socket.addEventListener("open", (event) => {
    socket.send("Hello Server!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
        let data = JSON.parse(event.data);
        if (data.path == "recources") recourcesData(data);
        if (data.path == "status") statusUpdate(data);
        if (data.path == "log") logUpdate(data);
    });
}

function logUpdate(event) {
    let data = event.data;
    let p;
    for (let i = 0; i < processes.length && !p && i < 100; i++) {
        if (processes[i] && processes[i].name == data.name) p = processes[i];
    }
    if (p) {
        p.card.logs.innerText+=data.log;
    }
}

function statusUpdate(event) {
    let data = event.data;
    let p;
    for (let i = 0; i < processes.length && !p && i < 100; i++) {
        if (processes[i] && processes[i].name == data.name) p = processes[i];
    }
    if (p) {
        if (data.running) {
            p.htmlEl.children[0].children[3].children[0].classList.remove("restarting");
            p.htmlEl.children[0].children[4].classList.add("running");
        } else if (!data.running) {
            p.htmlEl.children[0].children[4].classList.remove("running");
        }
    }
}

function recourcesData(event) {
    let data = event.data;
    let p;
    for (let i = 0; i < processes.length && !p && i < 100; i++) {
        if (processes[i] && processes[i].name == data.name) p = processes[i];
    }
    if (p) {
        p.data[data.type].push({x: new Date(data.x), y: data.y});
        while (p.data[data.type].length > 100) p.data[data.type].shift();
        p.chart.render();
    }
}

function BuildPage() {
    layout = new Layout().setAsMain();
    layout.style.flexWrap = "wrap";
    menu = new HamburgerMenu();
    menu.htmlEl.classList.add("MainMenu");
    layout.htmlEl.classList.add("MainLayout");
    layout.appendChild(menu);

    let menuItems = [
        new SimpleMenuItem("admin/assets/processes.png", "processes", () => {
            while (layout.htmlEl.children.length > 1) {
                layout.htmlEl.removeChild(layout.htmlEl.children[layout.htmlEl.children.length - 1])
            }
            for (let i = 0; i < processes.length; i++) layout.appendChild(processes[i]);
        }),
        new SimpleMenuItem("admin/assets/proxy.png", "proxy", () => {
            while (layout.htmlEl.children.length > 1) {
                layout.htmlEl.removeChild(layout.htmlEl.children[layout.htmlEl.children.length - 1])
            }
            layout.appendChild(proxy);
        }),
        new SimpleMenuItem("admin/assets/files.png", "files", () => {
            while (layout.htmlEl.children.length > 1) {
                layout.htmlEl.removeChild(layout.htmlEl.children[layout.htmlEl.children.length - 1])
            }
        }),
    ]

    menu.addHead(`<h2>KLIM<span style="color: #c40f43;"> π</span></h2>`);
    menu.head.preload.src = "/elementaljs/assets/menu.png";
    menu.appendChildren(menuItems);
    setTimeout(() => {menuItems[0].htmlEl.onclick();}, 10);
}

function ProcessCard(p) {
    let id = p.id;
    let name = p.name;
    let cardLayout = new Layout("row");
    cardLayout.style.height = "15em";
    cardLayout.style.width = "400px";
    cardLayout.style.margin = "1em";
    cardLayout.id = id;
    let card = new Card("350px");
    card.htmlEl.classList.add("processCard");
    let tabMenu = new TabMenu();

    card.appendChild(`<h2>${name}</h2>`);

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
                }],
                axisX:{
                    labelFormatter: function(){
                        return " ";
                    }
                }
            });

            // console.log(chart);
            if (cardLayout.chart) cardLayout.chart.render();
        } catch { }
    }

    card.graphCanvas = document.createElement("div");
    card.graphCanvas.id = `graph-${id}`;
    card.graphCanvas.classList.add("graph");
    card.open(card.graphCanvas)

    card.logs = document.createElement("pre");
    let codeString = "";
    card.logs.innerHTML = `<code>${codeString}</code>`;

    let runButton, restartButton;

    let tabs = [
        new TabMenuItem("/admin/assets/processor.png", () => { card.open(card.graphCanvas) }),
        new TabMenuItem("/admin/assets/files.png", () => { card.open(card.logs) }),
        new TabMenuItem("/admin/assets/settings.png", () => { card.open() }),
        restartButton = new TabMenuItem("/admin/assets/processes.png", () => { }),
        runButton = new TabMenuItem("/admin/assets/play.png", () => { }),
    ]
    runButton.htmlEl.onclick = () => {
        //runButton.htmlEl.classList.toggle("running");

        let command = "toggle";
        if (name.includes("proxy")) command = "restart";

        fetch("/admin/command", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({process: name, command: command})
        }).then(res => {
            if (res.status == 403) {
                forbiddenToast.play();
            }
        })
    };
    restartButton.htmlEl.onclick = () => {
        restartButton.htmlEl.children[0].classList.toggle("restarting");
        fetch("/admin/command", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({process: name, command: "restart"})
        })
    };
    runButton.style.backgroundColor = "var(--DEBIAN_RED)";

    if (p.running) runButton.htmlEl.classList.toggle("running");

    tabMenu.appendChildren(tabs);
    tabMenu.htmlEl.classList.add("cardTabs");
    setTimeout(() => {
        tabs[0].htmlEl.onclick();
    }, 10);

    cardLayout.appendChild(tabMenu);
    cardLayout.appendChild(card);
    cardLayout.name = name;
    cardLayout.card = card;
    return cardLayout;
}