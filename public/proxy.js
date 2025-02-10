function ProxyCard(p) {
    let cardLayout = new Layout();
    let card = new Card();
    card.appendChild(new Text(p.url));
    card.appendChild(new Text(p.name));
    card.appendChild(new Text("<br><br>"));
    card.appendChild(new Text(p.port));
    cardLayout.appendChild(card);
    return cardLayout;
}