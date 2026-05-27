let dashboard, cpu, ram, net_up, net_down;

let values = { cpu: 60, ram: 20, up: 10, down: 5 }

let data;

let i = 1;

const ws = new WebSocket("wss://klimdanick.nl/API");

const createDashboard = () => {
    if (dashboard) return dashboard;

    dashboard = Layout.grid({ classes: ["mainContent"], id: "dashboard" })

    cpu = new LineGraph({
        values: [{ x: 0, y: 0 }, { x: 0.5, y: 50 }, { x: 1, y: 60 }],
        min: { x: -20, y: 0 },
        max: { x: 0, y: 100 },
        n: 100
    });

    mem = new ProgressBar({
        value: 0
    });

    ram = new LineGraph({
        values: [{ x: 0, y: 0 }, { x: 0.1, y: 20 }, { x: 1, y: 20 }],
        min: { x: -20, y: 0 },
        max: { x: 0, y: 100 },
        n: 100
    });

    net_up = new LineGraph({
        values: [{ x: 0, y: 10 }, { x: 0.1, y: 10 }, { x: 1, y: 10 }],
        min: { x: -20, y: 0 },
        max: { x: 0, y: 100000 },
        n: 100
    });

    net_down = new LineGraph({
        values: [{ x: 0, y: 10 }, { x: 0.1, y: 10 }, { x: 1, y: 5 }],
        min: { x: -20, y: 0 },
        max: { x: 0, y: 100000 },
        n: 100
    });

    cpu.id = "cpu"
    ram.id = "ram"
    mem.id = "mem"
    net_up.id = "net_up"
    net_down.id = "net_down"

    cpu.attributes.style = "color: var(--DEBIAN_RED)";
    ram.attributes.style = "color: var(--TURMERIC_YELLOW)";
    net_up.attributes.style = "color: var(--AQUA_GREEN);";
    net_down.attributes.style = "color: var(--CURIOS_BLUE)";

    cpu.attributes.width = "500px";
    ram.attributes.width = "500px";
    net_up.attributes.width = "500px";
    net_down.attributes.width = "500px";

    cpu.attributes.height = "300px";
    ram.attributes.height = "300px";
    net_up.attributes.height = "300px";
    net_down.attributes.height = "300px";

    let cpu_y = new Element({ tag: "pre", id: "cpu_y" }).append("100% \n 90% \n 80% \n 70% \n 60% \n 50%\n 40% \n 30% \n 20% \n 10% \n  0");
    let net_y = new Element({ tag: "pre", id: "net_y" }).append("100% \n 90% \n 80% \n 70% \n 60% \n 50%\n 40% \n 30% \n 20% \n 10% \n  0");

    let cpu_x = new Element({ tag: "div", id: "cpu_x" })
    let net_x = new Element({ tag: "div", id: "net_x" })

    let arr = ["-20s", "-18s", "-16s", "-14s", "-12s", "-10s", " -8s", " -6s", " -4s", " -2s", " -0s"]
    cpu_x.append(...(arr.map((x) => new Element({ tag: "pre" }).append(x))))
    net_x.append(...(arr.map((x) => new Element({ tag: "pre" }).append(x))))

    ws.onmessage = (event) => {
        data = JSON.parse(event.data);
        processData = data.processes
        data = data.data
    };

    setInterval(() => updateData(), 200)

    return dashboard.append(cpu, ram, mem, net_up, net_down, cpu_y, net_y, cpu_x, net_x);
}

const updateData = () => {
    updateProcesses();
    if (!data) return;

    const now = Date.now();
    const getDeltaT = (t) => (t - now) / 1000

    const mapFunc = p => { return { x: getDeltaT(p.x), y: p.y } }

    cpu.points = data.cpu.map(mapFunc)
    ram.points = data.ram.map(mapFunc)
    net_up.points = data.up.map(mapFunc)
    net_down.points = data.down.map(mapFunc)
    mem.value = data.mem.y;

    mem.render();
}
