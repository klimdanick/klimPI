let proxy;

let proxyEntries = [
    { "name": "elementaljs", "port": "8088", "url": "/elementaljs" },
    { "name": "authAPI", "port": "8087", "url": "/authAPI" },
    { "name": "mainAPI", "port": "8089", "url": "/API" },
    { "name": "auth", "port": "8086", "url": "/auth" },
    { "name": "adminPanel", "port": "8085", "url": "/admin" },
    { "name": "website", "port": "8084", "url": "/" }
]

let lastProxyEntries = proxyEntries;

const createProxy = () => {
    // if (proxy) return proxy;

    fetch("https://klimdanick.nl/API/proxy").then(res => res.json()).then(data => {
        proxyEntries = data;
        updateProxy();
    });

    proxy = Layout.row({ classes: ["mainContent"], id: "proxy" })

    updateProxy();

    lastProxyEntries = proxyEntries;

    return proxy;
}

let updateProxy = () => {
    proxy.clear();

    let form;
    proxy.append(form = new Form())

    proxyEntries.sort((a, b) => a.port - b.port);

    form.append(Layout.column().append(
        ...proxyEntries.map(entry => Layout.row({ classes: ["proxyEntry"] }).append(
            new TextInput({
                label: "name",
                value: entry.name
            }),
            "|",
            new TextInput({
                label: "url",
                value: entry.url
            }),
            "→",
            new NumberInput({
                label: "Port",
                value: entry.port
            }),
        ))
    ))

    proxy.render();
}