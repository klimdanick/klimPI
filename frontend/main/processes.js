let processes;

const createProcesses = () => {
    if (processes) return processes;

    processes = Layout.grid({ classes: ["mainContent"], id: "processes" })

    return processes;
}