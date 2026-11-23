'use strict';

/*
 * All business content lives here: settings, products, variants,
 * shipping rates and FAQ. Edit this file to change the website content.
 * Prices are in US dollars (USD), ex-works Cirebon, before freight.
 */

const CONFIG = {
  businessName: 'Ridwan Rattan Export',
  whatsappNumber: '6281234567890', // country code + number, digits only
  whatsappDisplay: '+62 812-3456-7890',
  email: 'export@ridwanrattan.example',
  currency: 'USD',
  readyProcessingDays: 3, // days to pack and hand over ready-stock items
  docFee: 40, // export documents and fumigation, once per order
  seaMinCharge: 90, // minimum sea freight charge per order
  airMinCharge: 150, // minimum air freight charge per order
  airVolumetricFactor: 167 // kg per CBM used for air freight
};

const PRODUCTS = [
  {
    id: 'chair',
    name: 'Rattan Chair',
    image: 'assets/img/rattan-chair.jpg',
    description:
      'A round, open-weave lounge chair made from hand-bent natural rattan cane on a sturdy frame.',
    variants: [
      {
        id: 'chair-standard',
        name: 'Standard, 80 cm',
        size: 'W 80 x D 72 x H 78 cm',
        price: 78,
        stock: 60,
        weightKg: 6.5,
        cbm: 0.32,
        productionDays: 14
      },
      {
        id: 'chair-large',
        name: 'Large, 95 cm',
        size: 'W 95 x D 80 x H 82 cm',
        price: 96,
        stock: 24,
        weightKg: 8.2,
        cbm: 0.45,
        productionDays: 14
      },
      {
        id: 'chair-cushion',
        name: 'Standard with seat cushion',
        size: 'W 80 x D 72 x H 78 cm',
        price: 92,
        stock: 0,
        weightKg: 7.4,
        cbm: 0.38,
        productionDays: 18
      }
    ]
  },
  {
    id: 'tableset',
    name: 'Rattan Table Set',
    image: 'assets/img/rattan-table-set-woven.jpg',
    description:
      'A rattan dining or tea table with four matching chairs, woven and finished by hand.',
    variants: [
      {
        id: 'tableset-woven',
        name: 'Woven table with 4 chairs',
        size: 'Table L 140 x W 60 x H 45 cm, 4 chairs',
        price: 420,
        stock: 12,
        weightKg: 46,
        cbm: 1.35,
        productionDays: 21,
        image: 'assets/img/rattan-table-set-woven.jpg'
      },
      {
        id: 'tableset-glass',
        name: 'Glass-top round table with 4 chairs',
        size: 'Table dia. 90 x H 75 cm, 4 chairs',
        price: 360,
        stock: 0,
        weightKg: 38,
        cbm: 1.2,
        productionDays: 21,
        image: 'assets/img/rattan-table-set-glass.jpg',
        imageFit: 'contain'
      }
    ]
  },
  {
    id: 'sofa',
    name: 'Rattan Sofa',
    image: 'assets/img/rattan-sofa.jpg',
    description:
      'A solid wood frame with cane webbing on the sides and front, and soft ivory cushions.',
    variants: [
      {
        id: 'sofa-2seater',
        name: '2-seater, ivory cushions',
        size: 'W 160 x D 78 x H 75 cm',
        price: 395,
        stock: 18,
        weightKg: 34,
        cbm: 1.25,
        productionDays: 25
      },
      {
        id: 'sofa-3seater',
        name: '3-seater, ivory cushions',
        size: 'W 200 x D 80 x H 75 cm',
        price: 520,
        stock: 0,
        weightKg: 44,
        cbm: 1.6,
        productionDays: 28
      }
    ]
  },
  {
    id: 'lamp',
    name: 'Rattan Lamp',
    image: 'assets/img/rattan-lamp.jpg',
    description:
      'A hand-woven rattan pendant shade that throws a soft, patterned light. Supplied with cord and E27 socket, bulb not included.',
    variants: [
      {
        id: 'lamp-small',
        name: 'Small, dia. 40 cm',
        size: 'dia. 40 x H 45 cm',
        price: 24,
        stock: 150,
        weightKg: 0.9,
        cbm: 0.12,
        productionDays: 10
      },
      {
        id: 'lamp-medium',
        name: 'Medium, dia. 55 cm',
        size: 'dia. 55 x H 58 cm',
        price: 36,
        stock: 90,
        weightKg: 1.3,
        cbm: 0.22,
        productionDays: 10
      },
      {
        id: 'lamp-large',
        name: 'Large, dia. 70 cm',
        size: 'dia. 70 x H 72 cm',
        price: 52,
        stock: 0,
        weightKg: 1.8,
        cbm: 0.38,
        productionDays: 12
      },
      {
        id: 'lamp-set',
        name: 'Set of 3 (40, 55 and 70 cm)',
        size: '3 shades: dia. 40, 55 and 70 cm',
        price: 105,
        stock: 30,
        weightKg: 4,
        cbm: 0.7,
        productionDays: 12
      }
    ]
  },
  {
    id: 'buffet',
    name: 'Rattan Buffet',
    image: 'assets/img/rattan-buffet.jpg',
    description:
      'A rattan sideboard with four drawers and cane-panel doors, finished with a natural top.',
    variants: [
      {
        id: 'buffet-120',
        name: 'Compact, 120 cm',
        size: 'W 120 x D 40 x H 75 cm',
        price: 395,
        stock: 14,
        weightKg: 36,
        cbm: 0.78,
        productionDays: 21
      },
      {
        id: 'buffet-160',
        name: 'Standard, 160 cm',
        size: 'W 160 x D 42 x H 78 cm',
        price: 485,
        stock: 9,
        weightKg: 46,
        cbm: 1.0,
        productionDays: 21
      },
      {
        id: 'buffet-200',
        name: 'Long, 200 cm',
        size: 'W 200 x D 45 x H 80 cm',
        price: 590,
        stock: 0,
        weightKg: 58,
        cbm: 1.3,
        productionDays: 28
      }
    ]
  }
];

/*
 * Shipping to a US port. Sea freight is charged per CBM (cubic metre),
 * air freight per kg. Transit days are [minimum, maximum].
 */
const SHIPPING_METHODS = [
  { id: 'sea', label: 'Sea freight (LCL), best for furniture' },
  { id: 'air', label: 'Air freight, faster but costly' }
];

const SHIPPING_ZONES = [
  {
    id: 'west',
    name: 'West Coast',
    ports: 'Los Angeles / Long Beach',
    seaRatePerCbm: 105,
    seaDays: [28, 35],
    airRatePerKg: 5.2,
    airDays: [5, 8]
  },
  {
    id: 'gulf',
    name: 'Gulf Coast',
    ports: 'Houston',
    seaRatePerCbm: 125,
    seaDays: [35, 42],
    airRatePerKg: 5.6,
    airDays: [6, 9]
  },
  {
    id: 'east',
    name: 'East Coast',
    ports: 'New York / New Jersey, Savannah',
    seaRatePerCbm: 135,
    seaDays: [38, 45],
    airRatePerKg: 5.4,
    airDays: [6, 9]
  },
  {
    id: 'midwest',
    name: 'Midwest (via rail)',
    ports: 'Chicago',
    seaRatePerCbm: 160,
    seaDays: [42, 52],
    airRatePerKg: 6.0,
    airDays: [7, 10]
  }
];

const FAQS = [
  {
    question: 'How do I know if a product is ready stock?',
    answer:
      'Every product card shows its stock status for the variant and quantity you choose. "Ready stock" means we can pack it within ' +
      CONFIG.readyProcessingDays +
      ' days. "Made to order" means we weave it after your order is confirmed, and the card shows how many days production takes.'
  },
  {
    question: 'What variants can I choose from?',
    answer:
      'Each product has several variants, such as different sizes, a set option, or a version with cushions. Pick a variant on the product card to see its size, price and stock.'
  },
  {
    question: 'How is the total price calculated?',
    answer:
      'The total is the price of each item multiplied by its quantity, plus freight to the US port you choose, plus a fixed export documents and fumigation fee of $' +
      CONFIG.docFee +
      ' per order. The My order section updates automatically when you change anything.'
  },
  {
    question: 'How much is shipping?',
    answer:
      'Sea freight is charged by volume (cost per CBM) and air freight by weight (cost per kg), depending on the US region. Sea freight has a minimum charge of $' +
      CONFIG.seaMinCharge +
      ' and air freight $' +
      CONFIG.airMinCharge +
      '. See the Shipping rates table for every region.'
  },
  {
    question: 'How long until my order arrives?',
    answer:
      'Arrival time is the production or packing time plus sea or air transit to the US port. Ready-stock orders to the West Coast by sea usually take about 4 to 5 weeks. Made-to-order items take longer. The My order section shows an estimated arrival date range.'
  },
  {
    question: 'Is there a minimum order?',
    answer:
      'No. You can order from one piece. For small orders the minimum freight charge applies, so combining several products in one shipment is usually cheaper per item.'
  },
  {
    question: 'What payment terms do you offer?',
    answer:
      'After you send your order request, we reply with a proforma invoice. We normally ask for a 50% deposit by bank transfer to start production or packing, and the balance before the goods are shipped.'
  },
  {
    question: 'Are US import duties and inland delivery included?',
    answer:
      'No. Our price covers the goods and freight to the US port. Import duties, customs clearance and delivery from the port to your address are not included. We provide the commercial documents, and we suggest you check the details with your customs broker.'
  },
  {
    question: 'Can you change the size or finish?',
    answer:
      'Yes, for made-to-order items. Write your request in the notes field when you place your order and we will confirm the price and lead time.'
  },
  {
    question: 'How are the products packed?',
    answer:
      'Furniture is wrapped in protective film and foam, then packed in strong export cartons with edge protection. Lamp shades are nested carefully and boxed to keep their shape.'
  }
];
