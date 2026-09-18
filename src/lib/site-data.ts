import barber1 from "@/assets/barber-1.jpg";
import barber2 from "@/assets/barber-2.jpg";
import barber3 from "@/assets/barber-3.jpg";
import barber4 from "@/assets/barber-4.jpg";

import realFadeCut from "@/assets/real-fade-cut.jpg";
import realLadiesService from "@/assets/real-ladies-service.jpg";
import realExterior from "@/assets/real-exterior.jpg";
import realBackCut from "@/assets/real-back-cut.jpg";
import realInterior from "@/assets/real-interior.jpg";
import realInterior2 from "@/assets/real-interior-2.jpg";
import realFadeCut2 from "@/assets/real-fade-cut-2.jpg";
import realHaircutAction from "@/assets/real-haircut-action.jpg";
import realShopExterior from "@/assets/real-shop-exterior.jpg";

export const BUSINESS = {
  name: "Tom's Barber",
  tagline: "The Art of the Modern Gentleman",
  email: "thetxtbarbersone@gmail.com",
  phone: "(808) 949-6081",
  phoneHref: "tel:+18089496081",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "TikTok", href: "https://tiktok.com" },
  ],
};

export type LocationData = {
  id: "honolulu";
  name: string;
  shortName: string;
  address: string;
  street: string;
  city: string;
  timezone: string;
  hours: { day: string; hours: string }[];
  mapEmbed: string;
  mapLink: string;
};

export const LOCATIONS: LocationData[] = [
  {
    id: "honolulu",
    name: "Honolulu",
    shortName: "Honolulu",
    address: "1430 Kona St #105, Honolulu, HI 96814",
    street: "1430 Kona St #105",
    city: "Honolulu, HI 96814",
    timezone: "US (Hawaii Standard Time - HST)",
    hours: [
      { day: "Monday", hours: "8:00 AM – 6:00 PM HST" },
      { day: "Tuesday", hours: "8:00 AM – 6:00 PM HST" },
      { day: "Wednesday", hours: "8:00 AM – 6:00 PM HST" },
      { day: "Thursday", hours: "8:00 AM – 6:00 PM HST" },
      { day: "Friday", hours: "8:00 AM – 6:00 PM HST" },
      { day: "Saturday", hours: "8:00 AM – 6:00 PM HST" },
      { day: "Sunday", hours: "10:00 AM – 3:00 PM HST" },
    ],
    mapEmbed:
      "https://maps.google.com/maps?q=1430%20Kona%20St%20%23105,%20Honolulu,%20HI%2096814&t=&z=15&ie=UTF8&iwloc=&output=embed",
    mapLink:
      "https://www.google.com/maps/search/?api=1&query=1430+Kona+St+%23105+Honolulu+HI+96814",
  },
];

export const HOURS = LOCATIONS[0].hours;

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: "men" | "ladies";
  subtitle?: string;
  tag?: string;
};

export const SERVICES: Service[] = [
  // ── Men's Services ──
  {
    id: "regular-men-haircut",
    name: "Regular Men Haircut",
    description:
      "A classic men's cut with consultation, precision clipper and scissor work, finished and styled.",
    price: 28,
    duration: 30,
    category: "men",
  },
  {
    id: "regular-men-skin-fade",
    name: "Regular Men Skin Fade",
    description:
      "Clean skin fade blended to perfection, tapered to your preference with a sharp finish.",
    price: 30,
    duration: 35,
    category: "men",
  },
  {
    id: "men-haircut-beard-trim",
    name: "Men Haircut & Beard Trim",
    description:
      "Full haircut paired with a detailed beard line-up, shape and trim for a polished look.",
    price: 40,
    duration: 45,
    category: "men",
  },
  {
    id: "men-haircut-beard-shave",
    name: "Men Haircut & Beard Shave",
    description:
      "Precision haircut combined with a hot towel beard shave for the ultimate clean finish.",
    price: 50,
    duration: 50,
    category: "men",
  },
  {
    id: "men-style-cut",
    name: "Men Style Cut",
    description:
      "A tailored style cut with consultation, crafted to suit your face shape and personal style.",
    price: 35,
    duration: 40,
    category: "men",
  },
  {
    id: "premium-service",
    name: "Premium Service",
    description:
      "The complete grooming experience — haircut, beard trim or shave, and a relaxing shampoo.",
    price: 60,
    duration: 60,
    category: "men",
    subtitle: "Haircut, Beard Trim / Shave, Shampoo",
  },
  {
    id: "men-haircut-shampoo",
    name: "Men Haircut & Shampoo",
    description:
      "A fresh haircut with an invigorating shampoo wash for a clean, refreshed finish.",
    price: 35,
    duration: 40,
    category: "men",
  },
  // ── Ladies' Services ──
  {
    id: "lady-short-layer",
    name: "Lady Short Layer",
    description:
      "Layered cut for short hair, shaped and styled to add volume and movement.",
    price: 40,
    duration: 45,
    category: "ladies",
  },
  {
    id: "lady-long-layer",
    name: "Lady Long Layer",
    description:
      "Flowing layers for longer hair, precision-cut to enhance texture and natural fall.",
    price: 50,
    duration: 50,
    category: "ladies",
  },
  {
    id: "lady-shampoo-blowdry",
    name: "Lady Shampoo & Blowdry",
    description:
      "A refreshing shampoo followed by a professional blowdry for smooth, voluminous results.",
    price: 30,
    duration: 35,
    category: "ladies",
  },
  {
    id: "lady-shampoo-blowdry-style",
    name: "Lady Shampoo, Blowdry & Style",
    description:
      "Full wash, blowdry and styling — finished and polished, ready for any occasion.",
    price: 50,
    duration: 50,
    category: "ladies",
  },
];

export type Barber = {
  id: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  image: string;
  socials: { label: string; href: string }[];
};

export const BARBERS: Barber[] = [
  {
    id: "marcus",
    name: "Marcus Vance",
    role: "Master Barber & Lead Stylist",
    specialty: "Classic tapers, modern fades & precision cuts",
    bio: "Over fifteen years of dedicated craftsmanship, establishing Tom's Barber as Honolulu's premier grooming destination.",
    image: barber1,
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "TikTok", href: "https://tiktok.com" },
    ],
  },
  {
    id: "devin",
    name: "Devin Sato",
    role: "Senior Barber",
    specialty: "Textured crops & scissor work",
    bio: "Devin brings a quiet, architectural precision to every silhouette, specializing in modern textured crops.",
    image: barber2,
    socials: [{ label: "Instagram", href: "https://instagram.com" }],
  },
  {
    id: "leilani",
    name: "Leilani Cruz",
    role: "Barber & Styling Specialist",
    specialty: "Grey blending & styling",
    bio: "A colourist's eye and a barber's hand — Leilani's finishes photograph beautifully.",
    image: barber3,
    socials: [
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Facebook", href: "https://facebook.com" },
    ],
  },
  {
    id: "makoa",
    name: "Makoa Reyes",
    role: "Master Barber",
    specialty: "Straight razor shaves",
    bio: "Thirty years of straight-razor craft. Ask him about the hot towel ritual — he'll take his time.",
    image: barber4,
    socials: [{ label: "Instagram", href: "https://instagram.com" }],
  },
];

export const ANY_BARBER = {
  id: "any",
  name: "Any available barber",
  specialty: "We'll match you with the first open chair",
};

export const GALLERY = [
  { src: realFadeCut, alt: "Curly skin fade — fresh from the chair at Tom's Barber", span: "tall" },
  { src: realInterior, alt: "Tom's Barber lounge — barbers at work on multiple chairs", span: "wide" },
  { src: realBackCut, alt: "Precision taper cut — back view at Tom's Barber", span: "tall" },
  { src: realLadiesService, alt: "Ladies styling service — expert curling iron finish", span: "wide" },
  { src: realInterior2, alt: "It's a good hair day — inside Tom's Barber lounge", span: "tall" },
  { src: realFadeCut2, alt: "Clean skin fade — precision neckline at Tom's Barber", span: "tall" },
  { src: realHaircutAction, alt: "Master barber haircut — precision styling at Tom's Barber", span: "tall" },
  { src: realShopExterior, alt: "Tom's Barber shop building & entrance on Kona Street, Honolulu", span: "wide" },
] as const;

export { realInterior, realExterior, realBackCut, realFadeCut, realLadiesService, realHaircutAction, realShopExterior };

export const TESTIMONIALS = [
  {
    name: "Marcus H.",
    rating: 5,
    quote:
      "The most consistent fade I've had in Honolulu. They remember exactly how I like it, every single visit.",
    initials: "MH",
  },
  {
    name: "Jared K.",
    rating: 5,
    quote:
      "The hot towel shave is worth the trip alone. Forty-five unhurried minutes that feel like a reset.",
    initials: "JK",
  },
  {
    name: "Tony P.",
    rating: 5,
    quote:
      "Booked the Executive Ritual before my wedding. Photographer said it was the sharpest he'd seen.",
    initials: "TP",
  },
  {
    name: "Sam L.",
    rating: 5,
    quote:
      "Brought my son for his first real haircut. They were patient, kind, and he left grinning.",
    initials: "SL",
  },
  {
    name: "Dee R.",
    rating: 5,
    quote:
      "Beautiful room, no attitude, exceptional work. It feels like a lounge, not a waiting room.",
    initials: "DR",
  },
];

export const FAQS = [
  {
    q: "Where should I park?",
    a: "Convenient parking is available near our Kona Street location with street and nearby dedicated customer parking.",
  },
  {
    q: "Do you take walk-ins?",
    a: "We welcome walk-ins whenever a chair is open, but appointments always take priority. Weekends fill early — booking ahead is strongly recommended.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Please give us at least 12 hours' notice. Cancellations inside 12 hours, or no-shows, may be charged 50% of the service price.",
  },
  {
    q: "How early should I arrive?",
    a: "Five minutes early is perfect. That gives us time for a proper consultation and a coffee before we begin.",
  },
  {
    q: "Do you sell the products you use?",
    a: "Yes. Every pomade, oil and balm we use in the chair is available at the front counter, along with staff recommendations for your hair type.",
  },
];

export const TIME_SLOTS = [
  "8:00 AM",
  "8:45 AM",
  "9:00 AM",
  "9:45 AM",
  "10:30 AM",
  "11:15 AM",
  "12:00 PM",
  "1:00 PM",
  "1:45 PM",
  "2:30 PM",
  "3:15 PM",
  "4:00 PM",
  "4:45 PM",
  "5:30 PM",
  "6:15 PM",
  "7:00 PM",
  "7:30 PM",
];
