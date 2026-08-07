let users;

let userEntries = [
    
]

let lastUserEntries

const createUsers = () => {
    // if (proxy) return proxy;

    fetch("https://klimdanick.nl/authAPI/users").then(res => res.json()).then(data => {
        userEntries = data;
        updateUsers();
    });

    users = Layout.row({ classes: ["mainContent"], id: "users" })

    updateUsers();

    lastUserEntries = userEntries;

    return users;
}

let updateUsers = () => {
    users.clear();

    let form;
    users.append(form = new Form())

    form.append(Layout.column().append(
        ...userEntries.map(entry => Layout.row({ classes: ["userEntrie"] }).append(
            new TextInput({
                label: "name",
                value: entry.user
            }),
            new TextInput({
                label: "role",
                value: entry.roles[0]
            }),
        ))
    ))

    users.render();
}