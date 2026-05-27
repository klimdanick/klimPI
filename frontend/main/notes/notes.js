let notesDisplay, notesDisplayMain, sideBar, notes;
let allFiles = [];
let noteData = [];

let currentNote;
let noteName;

const notesAPIUrl = "https://klimdanick.nl/filesAPI/api/notes";

const storage = {
    get(key, fallback = null) {
        const value = localStorage.getItem(key);
        return value !== null ? value : fallback;
    },

    set(key, value) {
        localStorage.setItem(key, value);
    },

    delete(key) {
        localStorage.removeItem(key);
    }
};

const createNotesDisplay = () => {

    currentNote = storage.get("note", "");
    noteName = currentNote.split("/");
    noteName = noteName[noteName.length - 1];

    notesDisplay = Layout.row({ classes: ["mainContent"], id: "notes" });

    fetch(`${notesAPIUrl}/struct`, {
        method: "GET"
    })
        .then(res => res.json())
        .then(async (data) => {
            allFiles = data
            
            // sort files: dirs first, then alphabetically
            allFiles.sort((a, b) => {
                if (typeof a === "string" && typeof b === "string") {
                    return a.localeCompare(b);
                } else if (typeof a === "string") {
                    return 1;
                } else if (typeof b === "string") {
                    return -1;
                } else {
                    return a.dir.localeCompare(b.dir);
                }
            });

            if (currentNote) {
                let res = await fetch(`${notesAPIUrl}/${currentNote.replace(/\//g, ".")}`, {
                    method: "GET"
                });
                let data = await res.json();
                noteData = data;
            }

            notes = fileStruct();
            notes.id = "noteStruct"

            notesDisplayMain = Layout.container({ id: "mainContainer" });
            sideBar = Layout.column({ id: "sideBar" });

            let createButton = new MenuItem({
                label: "New",
                icon: new Icon({ src: "assets/plus.svg" }),
                action: () => {
                    fetch(notesAPIUrl, {
                        method: "POST",
                        body: JSON.stringify({
                            title: "New Note",
                            content: "",
                            path: "",
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                        .then(res => res.json())
                        .then(data => {
                            storage.set("note", data.path);
                            loadPage(createNotesDisplay())
                        });
                }
            });

            sideBar.append(createButton, notes);

            notesDisplayMain.append(note = loadNote());

            notesDisplay.append(sideBar, notesDisplayMain);

            notesDisplay.render();
        });

    return notesDisplay
};

// noteData = {
//     id: 'f0c1e050-8c15-4999-9453-f4be154fa774',
//     title: 'Todo',
//     content: '# test123\n[ ] 1\n[x] 2\n[ ] 3\n[ ] 4\n---\n [New Todo](http://127.0.0.1:5501/frontend/index.html?note=Todo&tab=1&md=true)',
//     path: 'Old/',
//     createdAt: '2026-03-13T13:27:29.556Z'
// }

const fileStruct = (files = allFiles, path = "") => {
    let struct = new Menu({
        type: "dropdown",
        animate: false,
        classes: ["fileStruct"]
    });

    files.forEach(file => {
        let item;

        if (typeof file == "string") {
            item = new MenuItem({
                label: file,
                icon: new Icon({
                    src: getEjsAsset("file"),
                    classes: ["note"]
                }),
                action: () => {
                    storage.set("note", path + file);
                    loadPage(createNotesDisplay())
                }
            });

            item.classes.push("note");

            if (storage.get("note") == path + file) {
                item.classes.push("selected");
            }

            item.append(
                new Icon({
                    src: getEjsAsset("delete"),
                    classes: ["delete"],
                    listeners: {
                        click: () => {
                            fetch(`${notesAPIUrl}/${(path + file).replace(/\//g, ".")}`, {
                                method: "DELETE",
                            }).then(() => {
                                storage.delete("note");
                                loadPage(createNotesDisplay())
                            });
                        }
                    }
                })
            );
        } else {
            item = new MenuItem({
                label: file.dir,
                classes: ["dir"],
                icon: new Icon({
                    src: getEjsAsset("folder")
                }),
                submenu: fileStruct(file.content, path + file.dir + "/")
            });

            item.classes.push("dir");

            if (storage.get("note", "").includes(path + file.dir)) {
                item.children[1].show();
            }

            item.append(
                new Icon({
                    src: getEjsAsset("file"),
                    classes: ["create"],
                    listeners: {
                        click: () => {
                            fetch(`${notesAPIUrl}`, {
                                method: "POST",
                                body: JSON.stringify({
                                    title: "New Note",
                                    content: "",
                                    path: path + file.dir + "/"
                                }),
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            })
                                .then(res => res.json())
                                .then(data => {
                                    storage.set("note", data.path + data.title);
                                    loadPage(createNotesDisplay())
                                });
                        }
                    }
                })
            );
        }

        struct.append(item);
    });

    return struct;
};

let title, content, md;
let typingTimer;

const loadNote = () => {
    let note = Layout.column({ id: "note" });

    if (storage.get("md") == "true") {
        content = Layout.column({ id: "content" });

        parseMarkdown(content, noteData.content);
    } else {
        content = new TextArea({
            id: "content",
            name: "content",
            value: noteData.content,
        });

        content.listeners.input = () => {
            noteData.content = content.value();

            clearTimeout(typingTimer);

            typingTimer = setTimeout(() => {
                saveNote();
            }, 500);
        };
    }

    note.append(
        title = new TextInput({
            id: "title",
            name: "title",
            value: noteData.title
        }),

        content,

        md = new ToggleSwitch({
            id: "md",
            name: "md",
            checked: (storage.get("md") == "true"),
        })
    );

    md.id = "md";

    title.listeners.input = () => {
        noteData.title = title.value();
    };

    md.listeners.input = () => {
        storage.set("md", md.value());
        loadPage(createNotesDisplay());
    };

    return note;
};

const saveNote = async () => {
    const currentNote = storage.get("note", "");

    if (!currentNote) return;

    await fetch(`${notesAPIUrl}/${currentNote.replace(/\//g, ".")}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: noteData.title,
            content: noteData.content
        }),
    });
};

const parseMarkdown = (layout, str) => {
    if (!str) return;

    // Escape HTML
    const escapeHTML = (s) =>
        s.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    str = escapeHTML(str);

    const tables = [];

    str = str.replace(
        /((?:\|.*\|(?:\n|$))+)/g,
        (match) => {
            const lines = match.trim().split("\n").filter(Boolean);

            if (lines.length < 2) return match;

            // header
            const headers = lines[0]
                .split("|")
                .map(s => s.trim())
                .filter(Boolean);

            // skip separator row (---|---)
            const dataLines = lines.slice(2);

            const data = dataLines.map(line => {
                    line = line.split("|")
                    line.shift()
                    return line
                        .map(s => s.trim())
                        .filter((_, i) => i < headers.length)
                }
            );


            const token = `__TABLE_${tables.length}__`;

            tables.push(
                new Table({
                    columns: headers,
                    data
                })
            );

            return token;
        }
    );

    // Store code blocks temporarily
    const codeBlocks = [];

    str = str.replace(/```([\s\S]*?)```/g, (_, code) => {
        const token = `__CODE_BLOCK_${codeBlocks.length}__`;

        codeBlocks.push(
            `<pre><code>${code}</code></pre>`
        );

        return token;
    });

    // Store inline code temporarily
    const inlineCodes = [];

    str = str.replace(/`([^`\n]+?)`/g, (_, code) => {
        const token = `__INLINE_CODE_${inlineCodes.length}__`;

        inlineCodes.push(
            `<code>${code}</code>`
        );

        return token;
    });

    // Headings
    str = str
        .replace(/^###### (.*)$/gim, '<h6>$1</h6>')
        .replace(/^##### (.*)$/gim, '<h5>$1</h5>')
        .replace(/^#### (.*)$/gim, '<h4>$1</h4>')
        .replace(/^### (.*)$/gim, '<h3>$1</h3>')
        .replace(/^## (.*)$/gim, '<h2>$1</h2>')
        .replace(/^# (.*)$/gim, '<h1>$1</h1>');

    // Horizontal rules
    str = str.replace(/^(\s*)(-{3,}|_{3,})\s*$/gm, '<hr>');

    // Blockquotes
    str = str.replace(
        /^> (.*)$/gim,
        '<blockquote>$1</blockquote>'
    );

    // Task lists
    str = str.replace(
        /^\s*\[( |x|X)\] (.*)$/gim,
        (_, checked, text) => {
            const isChecked = checked.toLowerCase() === 'x';

            return `<ul class="task-list"><li><input type="checkbox" ${isChecked ? 'checked' : ''}><span>${text}</span></li></ul>`;
        }
    );

    // Merge adjacent task lists
    str = str.replace(
        /<\/ul>\s*<ul class="task-list">/g,
        ''
    );

    // Unordered lists
    str = str.replace(
        /^\s*[-*] (.*)$/gim,
        '<ul><li>$1</li></ul>'
    );

    // Ordered lists
    str = str.replace(
        /^\s*\d+\. (.*)$/gim,
        '<ol><li>$1</li></ol>'
    );

    // Merge adjacent lists
    str = str
        .replace(/<\/ul>\s*<ul>/g, '')
        .replace(/<\/ol>\s*<ol>/g, '');

    // Bold + italic
    str = str.replace(
        /\*\*\*([^\*]+)\*\*\*/gim,
        '<b><i>$1</i></b>'
    );

    // Bold
    str = str.replace(
        /\*\*([^\*]+)\*\*/gim,
        '<b>$1</b>'
    );

    // Italic
    str = str.replace(
        /\*([^\*]+)\*/gim,
        '<i>$1</i>'
    );

    // Strikethrough
    str = str.replace(
        /~~(.*?)~~/gim,
        '<del>$1</del>'
    );

    // Images
    str = str.replace(
        /!\[(.*?)\]\((.*?)\)/gim,
        (_, alt, src) => {
            return `<img src="${encodeURI(src)}" alt="${alt}">`;
        }
    );

    // Links
    str = str.replace(
        /\[(.*?)\]\((.*?)\)/gim,
        (_, text, href) => {

            // Prevent javascript: injection
            const safeHref = /^\s*javascript:/i.test(href)
                ? '#'
                : href;

            return `<a href="${encodeURI(safeHref)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
    );

    // Paragraph spacing
    str = str.replace(/\n{2,}/g, '<br><br>');

    // Single line breaks
    str = str.replace(/(?<!>)\n(?!<)/g, '<br>');

    // Restore inline code
    inlineCodes.forEach((code, i) => {
        str = str.replace(
            `__INLINE_CODE_${i}__`,
            code
        );
    });

    // Restore code blocks
    codeBlocks.forEach((block, i) => {
        str = str.replace(
            `__CODE_BLOCK_${i}__`,
            block
        );
    });

    // Render safely
    const wrapper = document.createElement("div");

    wrapper.innerHTML = str;

    tables.forEach((tableObj, i) => {
        const token = `__TABLE_${i}__`;

        tableObj.render();

        const placeholder = document.createElement("span");
        placeholder.replaceWith(tableObj.html.outerHTML);

        wrapper.innerHTML = wrapper.innerHTML.replace(
            token,
            tableObj.html.outerHTML
        );
    });

    const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.nodeValue.includes('\n')) {
                const frag = document.createDocumentFragment();

                const parts = node.nodeValue.split('\n');

                parts.forEach((part, i) => {
                    frag.append(part);

                    // every newline becomes <br>
                    if (i < parts.length - 1) {
                        frag.append(document.createElement('br'));
                    }
                });

                node.replaceWith(frag);
            }
        } else {
            node.childNodes.forEach(walk);
        }
    };

    walk(wrapper);

    console.log(str);

    layout.append(...wrapper.childNodes);
};