# Tanit Lounge — Menu & Commande en ligne

Application web de **menu digital et de prise de commande** pour le Tanit Lounge (Megrine, Tunisie).
Les clients consultent le menu et passent commande depuis leur table via un QR code ; le personnel
suit les commandes en temps réel depuis une interface de caisse (POS).

## Fonctionnalités

- **Menu client** ([`index.html`](index.html)) : catégories repliables, recherche, images par catégorie.
- **Panier** ([`cart.html`](cart.html)) : ajout/retrait d'articles, total, saisie du numéro de table
  (manuelle ou via le paramètre `?table=` du QR code) et envoi de la commande.
- **Espace staff** : connexion ([`login.html`](login.html)) puis interface de caisse
  ([`pos.html`](pos.html)) pour suivre et mettre à jour le statut des commandes.
- **Persistance** : le panier est conservé localement (`localStorage`) ; les commandes sont
  enregistrées dans Supabase.

## Stack technique

- HTML / CSS / JavaScript **vanilla** (aucun build, aucune dépendance à installer).
- [Supabase](https://supabase.com) (API REST) comme back-end pour les commandes et l'authentification staff.
- Polices Google Fonts et icônes Font Awesome via CDN.

## Structure du projet

| Fichier | Rôle |
|---|---|
| `index.html` / `styles.css` / `script.js` | Page menu client et logique d'affichage/panier |
| `cart.html` / `cart.css` / `cart-script.js` | Page panier et envoi de commande |
| `login.html` | Connexion du personnel |
| `pos.html` / `pos.css` / `pos-script.js` | Interface de caisse (suivi des commandes) |
| `supabase.js` | Configuration Supabase et appels à l'API REST |

## Lancer en local

Le projet est entièrement statique. Pour le tester, servez le dossier avec n'importe quel
serveur HTTP statique, par exemple :

```bash
# Python 3
python -m http.server 8000
```

Puis ouvrez http://localhost:8000 dans votre navigateur.

> Ouvrir les fichiers directement (`file://`) peut empêcher certains appels réseau (CORS) ;
> il est recommandé de passer par un serveur local.

## Commande via QR code

Chaque table dispose d'un QR code pointant vers la page panier avec son numéro pré-rempli,
par exemple `cart.html?table=5`. Le numéro peut aussi être saisi manuellement.
