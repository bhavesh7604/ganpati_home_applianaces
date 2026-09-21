// Store details. Edit here and the whole site updates.
export const site = {
  name: 'Ganpati Home Appliances',
  owner: 'Bhavesh Mali',
  tagline: 'Kitchenware and home appliances for every home',
  phone: '9116705227',
  whatsapp: '919116705227',
  email: 'bhaveshmali9116@gmail.com',
  address: 'Main Road, Takhatgarh, Pali, Rajasthan (306912)',
  returnDays: 7,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

export const waLink = (text: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
