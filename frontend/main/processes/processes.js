let processes;

let processData = [
    {
        name: "klimPI",
        id: 0,
        res: {
            cpu: 0,
            ram: 0
        },
        status: "running"
    }
]

const createProcesses = () => {
    // if (processes) return processes;

    if (!processes) {
        fetch("https://klimdanick.nl/API/processes").then(res => res.json()).then(data => {
            processData = data;
            updateProcesses();
        });
    }

    processes = Layout.grid({ classes: ["mainContent"], id: "processes" })

    updateProcesses()

    return processes;
}

const updateProcesses = () => {
    processes.clear();

    processData.forEach(process => {
        processCard = Layout.container({ classes: ["process", process.restarting ? "restarting" : process.running ? "running" : "stopped"] })
        let graph = new BarGraph({ values: [process.cpu > 0 ? Math.max(process.cpu / 6, 5) : 0, process.ram > 0 ? Math.max(process.ram / 120, 5) : 0], labels: ["cpu", "ram"], max: 100 })
        let buttons = [
            new Button({ classes: ["startButton"], onClick: (e) => start_(process) }).append(new Icon({ src: "assets/start.svg" })),
            new Button({ classes: ["stopButton"], onClick: (e) => stop_(process) }).append(new Icon({ src: "assets/stop.svg" })),
            new Button({ classes: ["restartButton"], onClick: (e) => restart_(process) }).append(new Icon({ src: "assets/restart.svg" })),
        ]

        processCard.append(process.name, Layout.row({}).append(Layout.column({}).append(...buttons), graph));
        processes.append(processCard)
    })

    processes.render();
};

const start_ = (p) => {
    console.log("start");
    fetch("https://klimdanick.nl/API/start", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            proc: p.name
        })
    });
}

const stop_ = (p) => {
    fetch("https://klimdanick.nl/API/stop", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            proc: p.name
        })
    });
}

const restart_ = (p) => {
    fetch("https://klimdanick.nl/API/restart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            proc: p.name
        })
    });
}