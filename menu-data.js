


const MENU_DATA = [
  { category: "Petit Déjeuner", image: "", items: [
    { name: "Classique", price: 7.5, desc: "Café au choix - Eau 1/2 - 1 Viennoiserie - Jus" },
    { name: "Le Bonjour", price: 15, desc: "Café au choix - Eau 1/2 - Viennoiserie - Assiette charcuterie & fromages - Jus - Omelette fromage" },
    { name: "Familly", price: 28, desc: "2 cafés au choix - 2 jus - Eau 1L - 2 viennoiseries - Assiette charcuterie & fromages - 2 mini crêpes - 2 omelettes fromage - Corbeille de pain" }
  ]},
  { category: "Cocktails", image: "", items: [
    { name: "Pina Colada", price: 10, desc: "" },
    { name: "Fraise - Banane", price: 12, desc: "" },
    { name: "Kiwi - Banane", price: 12, desc: "" },
    { name: "Trio", price: 15, desc: "Ananas, Mangue, Kiwi" },
    { name: "Power", price: 16, desc: "Banane, Datte, Fruit Sec" }
  ]},
  { category: "Smoothies", image: "", items: [
    { name: "Red", price: 13, desc: "Fraise, Banane, Fruits rouges" },
    { name: "Fraicheur", price: 14, desc: "Kiwi, Pomme, Ananas" }
  ]},
  { category: "Milkshake", image: "", items: [
    { name: "Classique", price: 8, desc: "Chocolat / Fraise / Vanille" },
    { name: "Nutella", price: 10, desc: "" },
    { name: "Au choix", price: 12, desc: "Oreo - Kinder - Spéculoos - Ferrero" }
  ]},
  { category: "Frappuccino", image: "", items: [
    { name: "Classique", price: 7, desc: "" },
    { name: "Nutella", price: 9, desc: "" },
    { name: "Au choix", price: 11, desc: "Oreo - Kinder - Spéculoos - Ferrero" }
  ]},
  { category: "Crêpes Sucrées", image: "", items: [
    { name: "Crêpe Chocolat", price: 8, desc: "" },
    { name: "Nutella", price: 12, desc: "" },
    { name: "Nutella Banane", price: 14, desc: "" },
    { name: "Nutella Fruits Sec", price: 14, desc: "" },
    { name: "Nutella Banane Fruits Sec", price: 16, desc: "" },
    { name: "Au choix", price: 14, desc: "Oreo - Kinder - Spéculoos - Ferrero" },
    { name: "Dubai", price: 15, desc: "" },
    { name: "Over Dose", price: 18, desc: "" }
  ]},
  { category: "Crêpes Salées", image: "", items: [
    { name: "Thon Fromage", price: 10, desc: "" },
    { name: "Jambon Fromage", price: 10, desc: "" },
    { name: "Crêpe Tanit", price: 13, desc: "Thon, Jambon, Fromage" },
    { name: "Crêpe Sauce Blanche et Champignon", price: 18, desc: "" }
  ]},
  { category: "Gaufres", image: "", items: [
    { name: "Chocolat", price: 9, desc: "" },
    { name: "Nutella", price: 13, desc: "" },
    { name: "Nutella Banane", price: 15, desc: "" },
    { name: "Nutella Fruits Secs", price: 15, desc: "" },
    { name: "Nutella Banane Fruits Secs", price: 17, desc: "" },
    { name: "Au choix", price: 14, desc: "Oreo - Kinder - Spéculoos - Ferrero" },
    { name: "Over Dose", price: 20, desc: "" }
  ]},
  { category: "Pancakes", image: "", items: [
    { name: "Nutella", price: 12, desc: "" },
    { name: "Over Dose", price: 18, desc: "" }
  ]},
  { category: "Omelettes", image: "", items: [
    { name: "Fromage", price: 9, desc: "" },
    { name: "Thon Fromage", price: 11, desc: "" },
    { name: "Jambon Fromage", price: 11, desc: "" },
    { name: "Végétarienne", price: 12, desc: "" }
  ]},
  { category: "Burgers", image: "", items: [
    { name: "Chicken Burger", desc: "", variants: [ { label: "Simple", price: 10 }, { label: "Double", price: 14 } ] },
    { name: "Beef Burger", desc: "", variants: [ { label: "Simple", price: 13 }, { label: "Double", price: 18 } ] }
  ]},
  { category: "Makloub", image: "", items: [
    { name: "Makloub Thon", price: 10, desc: "" },
    { name: "Makloub Jambon", price: 10, desc: "" },
    { name: "Makloub Escalope Grillé", price: 11, desc: "" },
    { name: "Makloub Escalope Pané", price: 12, desc: "" },
    { name: "Makloub Kabeb Fromage", price: 14, desc: "" }
  ]},
  { category: "Tacos", image: "", items: [
    { name: "Poulet Grillé", price: 10, desc: "" },
    { name: "Poulet Pané", price: 12, desc: "" },
    { name: "Viande Hachée", price: 14, desc: "" }
  ]},
  { category: "Les Plats", image: "", items: [
    { name: "Poulet Grillé", price: 15, desc: "" },
    { name: "Poulet Pané", price: 16, desc: "" },
    { name: "Mexicain", price: 16, desc: "" },
    { name: "Kebab", price: 20, desc: "" },
    { name: "Cordon Bleu", price: 18, desc: "" },
    { name: "Poulet aux Champignons", price: 20, desc: "" },
    { name: "Steak de Veau", price: 26, desc: "" },
    { name: "Dourade", price: 22, desc: "" },
    { name: "Loup", price: 25, desc: "" },
    { name: "Grillade Mixte", price: 33, desc: "" },
    { name: "Grillade Fruit de Mer", price: 36, desc: "1 personne 36 DT / 2 personnes 48 DT" },
    { name: "Crispy Poulet", price: 22, desc: "" }
  ]},
  { category: "Ojja", image: "", items: [
    { name: "Ojja Merguez", price: 15, desc: "" },
    { name: "Ojja Poulet", price: 17, desc: "" },
    { name: "Ojja Fruit de Mer", price: 25, desc: "" },
    { name: "Ojja Royale", price: 25, desc: "Merguez, poulet, champignons" }
  ]},
  { category: "Les Salades", image: "", items: [
    { name: "Salade Mechouia", price: 10, desc: "" },
    { name: "Salade César", price: 14, desc: "" },
    { name: "Healthy", price: 14, desc: "" }
  ]},
  { category: "Gratin", image: "", items: [
    { name: "Poulet", price: 16, desc: "" },
    { name: "Lasagne", price: 18, desc: "" },
    { name: "Fruit de Mer", price: 25, desc: "" }
  ]},
  { category: "Pâtes", image: "", items: [
    { name: "Spaghetti Puttanesca", price: 16, desc: "" },
    { name: "Spaghetti Carbonara", price: 18, desc: "" },
    { name: "Spaghetti Bolognaise", price: 18, desc: "" },
    { name: "Spaghetti 4 Fromages", price: 22, desc: "" },
    { name: "Spaghetti Fruit de Mer", price: 28, desc: "" },
    { name: "Pasta Pesto", price: 24, desc: "" }
  ]},
  { category: "Pizza", image: "", items: [
    { name: "Margueritta", price: 12, desc: "Sauce tomate, fromage" },
    { name: "Neptune", price: 15, desc: "Sauce tomate, fromage, thon" },
    { name: "Mexicaine", price: 19, desc: "Sauce tomate, fromage, viande hachée" },
    { name: "4 Saisons", price: 19, desc: "Sauce tomate, fromage, thon, champignon, légume" },
    { name: "Peperoni", price: 16, desc: "" },
    { name: "Sauce Blanche - Champignon", price: 19, desc: "" },
    { name: "Fruit de Mer", price: 25, desc: "Sauce tomate fraiche, mozzarella, moule, crevette, calamar, blanc de seiche, huile d'olive" }
  ]},
  { category: "Baguettes Farcies", image: "", items: [
    { name: "Baguette Farcie Poulet Grillé", price: 12, desc: "" },
    { name: "Baguette Farcie Poulet Pané", price: 14, desc: "" }
  ]},
  { category: "Chicha", image: "", items: [
    { name: "Parfum au Choix", price: 8, desc: "" },
    { name: "Chicha Orientale", price: 12, desc: "Avec glaçon" },
    { name: "BOSS", price: 25, desc: "Avec glaçon et assiette de fruits" }
  ]},
  { category: "Formule Tanit", image: "", items: [
    { name: "Offre Duo — Crêpe Nutella Fruits Sec", price: 23, desc: "2 cafés + eau 1L + crêpe Nutella fruits sec" },
    { name: "Offre Duo — 2 Assida", price: 25, desc: "2 cafés + eau 1L + 2 Assida" },
    { name: "Offre Chicha — Chicha + Mojito", price: 16, desc: "" },
    { name: "Offre Chicha — Chicha + Thé + Eau 1/2", price: 12.5, desc: "" },
    { name: "Offre Chicha — Chicha + Café + Eau 1/2", price: 13, desc: "" }
  ]},
  { category: "Café", image: "", items: [
    { name: "Express", price: 3.5, desc: "" },
    { name: "Capucin", price: 4, desc: "" },
    { name: "Café Crème", price: 4.5, desc: "" },
    { name: "Americain", price: 4.5, desc: "" },
    { name: "Café Turc", price: 6.5, desc: "" },
    { name: "Chocolat au lait", price: 4.5, desc: "" },
    { name: "Nescafé", price: 4.5, desc: "" },
    { name: "Cappuccino", price: 7.5, desc: "" },
    { name: "Café Glacé", price: 7, desc: "Noisette - Vanille - Caramel" }
  ]},
  { category: "Thé", image: "", items: [
    { name: "Thé à la menthe", price: 3.5, desc: "" },
    { name: "Thé aux amandes", price: 7.5, desc: "" },
    { name: "Thé aux pignons", price: 10, desc: "" },
    { name: "Thé Baklawa", price: 13, desc: "" },
    { name: "Thé infusion", price: 4.5, desc: "" },
    { name: "Supplément Nestlé", price: 3, desc: "Supplément" },
    { name: "Supplément Arôme", price: 2.5, desc: "Supplément" }
  ]},
  { category: "Drinks", image: "", items: [
    { name: "Eau 1/2L", price: 2, desc: "" },
    { name: "Eau 1L", price: 3.5, desc: "" },
    { name: "Soda", price: 4.5, desc: "" },
    { name: "Boisson Énergétique", price: 10, desc: "" }
  ]},
  { category: "Chocolat", image: "", items: [
    { name: "Chocolat Classique", price: 7, desc: "Chaud ou glacé" },
    { name: "Chocolat Nutella", price: 9, desc: "Chaud ou glacé" },
    { name: "Chocolat Au choix", price: 11, desc: "Oreo - Snickers - Kinder - Spéculoos - Ferrero" }
  ]},
  { category: "Dessert", image: "", items: [
    { name: "Cheesecake", price: 8, desc: "Nutella - Oreo - Spéculoos - Ferrero" },
    { name: "Gâteau", price: 11, desc: "" },
    { name: "Jwajem", price: 13, desc: "" },
    { name: "Saint Sébastien", price: 13, desc: "" },
    { name: "Assiette de fruits", price: 25, desc: "" }
  ]},
  { category: "Mojito", image: "", items: [
    { name: "Mojito Virgin", price: 10, desc: "" },
    { name: "Mojito Bleu", price: 12, desc: "" },
    { name: "Mojito Red", price: 12, desc: "" },
    { name: "Mojito Black", price: 12, desc: "" },
    { name: "Mojito Énergétique", price: 18, desc: "" },
    { name: "Mojito + Arôme", price: 2.5, desc: "Supplément" },
    { name: "Mojito + Nestlé", price: 3, desc: "Supplément" },
    { name: "Mojito + Chantilly", price: 3.5, desc: "Supplément" },
    { name: "Mojito + Amandes", price: 4, desc: "Supplément" },
    { name: "Mojito + Pignons", price: 6.5, desc: "Supplément" }
  ]},
  { category: "Jus", image: "", items: [
    { name: "Citronnade", price: 6.5, desc: "" },
    { name: "Jus d'orange", price: 6, desc: "" },
    { name: "Jus de fraise", price: 7, desc: "" },
    { name: "Citronnade à la menthe", price: 7.5, desc: "" },
    { name: "Citronnade aux amandes", price: 10, desc: "" },
    { name: "Jus fruits de saison", price: 10, desc: "Banane / Ananas / Kiwi / Pomme / Fruit rouge" }
  ]},
  { category: "Detox", image: "", items: [
    { name: "Detox Strong", price: 13, desc: "Pomme - Carotte - Gingembre" },
    { name: "Detox Red", price: 13, desc: "Betterave - Fraise - Citron" },
    { name: "Detox Green", price: 13, desc: "Concombre - Kiwi - Menthe - Citron" }
  ]}
];

const CATEGORY_PLACEHOLDERS = {
  "Petit Déjeuner": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
  "Cocktails": "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&q=80",
  "Smoothies": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80",
  "Milkshake": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
  "Frappuccino": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80",
  "Crêpes Sucrées": "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80",
  "Crêpes Salées": "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&q=80",
  "Gaufres": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80",
  "Pancakes": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80",
  "Omelettes": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&q=80",
  "Burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  "Makloub": "https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=800&q=80",
  "Tacos": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
  "Les Plats": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "Ojja": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",
  "Les Salades": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Gratin": "https://images.unsplash.com/photo-1621510456681-2330135e5871?w=800&q=80",
  "Pâtes": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
  "Pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  "Baguettes Farcies": "https://images.unsplash.com/photo-1559054663-e8d23213f55c?w=800&q=80",
  "Chicha": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "Formule Tanit": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Café": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "Thé": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
  "Drinks": "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&q=80",
  "Chocolat": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80",
  "Dessert": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
  "Mojito": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
  "Jus": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
  "Detox": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&q=80"
};



function formatPrice(price) {
  return `${Number(price).toFixed(2)} DT`;
}

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
}


function baseName(name) {
  return String(name).replace(/\s*\([^()]*\)\s*$/, "").trim();
}


function itemCategory(name) {
  const base = baseName(name);
  for (const block of MENU_DATA) {
    if (block.items.some(it => it.name === name || it.name === base)) {
      return block.category;
    }
  }
  return "";
}


function flatMenuItems() {
  const out = [];
  for (const block of MENU_DATA) {
    for (const it of block.items) {
      if (it.variants && it.variants.length) {
        it.variants.forEach(v => out.push({
          category: block.category,
          name: `${it.name} (${v.label})`,
          baseName: it.name,
          price: v.price
        }));
      } else {
        out.push({ category: block.category, name: it.name, baseName: it.name, price: it.price });
      }
    }
  }
  return out;
}
