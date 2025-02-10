function ProxyCard(p) {
    let cardLayout = new Layout();
    let card = new Card();
    let portInput;
    card.appendChild(new TextInput(p.name));
    card.appendChild(new TextInput(p.url));
    card.appendChild(portInput = new NumberInput(p.port));

    portInput.style.marginTop="100px";

    cardLayout.appendChild(card);
    return cardLayout;
}

class TextInput extends Element {
    constructor(value) {
        super("input");
        this.htmlEl.classList.add("Input");
        this.htmlEl.value = value;
    }
}

class NumberInput extends Element {
    constructor(value) {
        super("input");
        this.htmlEl.classList.add("Input");
        this.htmlEl.value = value;
        this.htmlEl.type = "number";
    }
}