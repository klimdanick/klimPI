let processes;

let processData = [
    {
        name: "klimPI",
        id: 0,
        res: {
            cpu: 10,
            ram: 20
        },
        status: "running"
    },
    {
        name: "minecraft",
        id: 1,
        res: {
            cpu: 40,
            ram: 45
        },
        status: "restarting"
    },
    {
        name: "acetto corsa",
        id: 2,
        res: {
            cpu: 0,
            ram: 0
        },
        status: "stopped"
    }
]

const createProcesses = () => {
    if (processes) return processes;

    processes = Layout.grid({ classes: ["mainContent"], id: "processes" })

    processData.forEach(process => {
        processCard = Layout.container({classes: ["process", process.status]})
        let graph = new BarGraph({ values: [process.res.cpu, process.res.ram], labels: ["cpu", "ram"] })
        let buttons = [
            new Button({classes: ["startButton"]}).append(new Icon({src:"start.svg"})),
            new Button({classes: ["stopButton"]}).append(new Icon({src:"stop.svg"})),
            new Button({classes: ["restartButton"]}).append(new Icon({src:"restart.svg"})),
        ]

        processCard.append(process.name, Layout.row({}).append(Layout.column({}).append(...buttons), graph));
        processes.append(processCard)
    })

    return processes;
}