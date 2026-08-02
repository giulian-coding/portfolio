# MSP Ticket Search

Findet pro Queue und Kunde die relevantesten aktiven Tickets
per Keyword-Suche, statt sich durch endlose Listen zu klicken.

    from search import search, Ticket
    treffer = search(tickets, "Netzwerk", "Bucher AG", ["vpn"])
