"""Ticket Intelligence: findet pro Queue und Kunde die
relevantesten aktiven Tickets per Keyword-Suche."""
from dataclasses import dataclass


@dataclass
class Ticket:
    id: int
    queue: str
    customer: str
    title: str
    status: str


def search(tickets, queue, customer, keywords, limit=200):
    kws = [k.lower() for k in keywords]
    hits = []
    for t in tickets:
        if t.status != "active":
            continue
        if t.queue != queue or t.customer != customer:
            continue
        score = sum(t.title.lower().count(k) for k in kws)
        if score:
            hits.append((score, t))
    hits.sort(key=lambda x: x[0], reverse=True)
    return [t for _, t in hits[:limit]]
