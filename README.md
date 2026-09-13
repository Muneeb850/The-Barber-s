# Bro502 Grooming Lounge

Build a fully functional, multi-page, responsive website for a premium barbershop brand called "Bro502." The site should feel upscale, elegant, and modern — like a high-end grooming lounge — not a generic template.

Tech stack: React + Tailwind CSS, with smooth animations (Framer Motion). Fully responsive for mobile, tablet, and desktop.

Pages (6 total, multi-page site with routing):

Home — Hero section with scroll-scrubbed video (details below), tagline, "Book Appointment" CTA, brief intro, and service highlights.

About Us — Brand story, founder/team background, shop philosophy, interior photos.

Services — Elegant cards listing services (haircut, beard trim, hot towel shave, kids cuts, combo packages) with price and duration.

Our Barbers — Barber profiles with photo, name, specialty, and social links.

Gallery — Grid of before/after and styling photos with lightbox/zoom on click.

Contact/Booking — Address, phone, embedded map, contact form, business hours, social icons.

Design & Theme:

Light, luxurious color palette — warm ivory/cream/soft beige base, with rich gold/bronze and deep espresso-brown accents. No dark/black theme.

Elegant serif font for headings (e.g., Playfair Display), clean sans-serif for body text.

Generous whitespace, subtle marble/linen textures, refined gold detailing.

Balanced, readable color contrast throughout.

Consistent sticky nav bar (logo left, menu right) across all pages, collapsing into a hamburger menu on mobile.

Hero Section — Scroll-Scrubbed Video Animation:

The Home page hero contains a video clip (a barber cutting a client's hair, roughly 10-15 seconds long) that I will provide/upload as an asset.

The video should NOT autoplay normally. Instead, its playback position must be tied directly to scroll position (scrollytelling/scroll-scrubbing technique) — as the user scrolls down, the video plays forward frame-by-frame in sync with scroll distance; scrolling up plays it in reverse.

Lock page scroll during this sequence: while the hero video hasn't finished playing, scrolling further should only advance the video (not move the user to the next section). Once the video reaches its final frame, unlock normal page scroll so the user can naturally continue to the next section.

Implementation should use the HTML5 <video> element with currentTime manipulated via scroll position (e.g., using Framer Motion's useScroll/useTransform or an Intersection Observer + scroll-lock technique), not a standard autoplay <video autoplay> tag.

Must be smooth and lag-free — preload the video, use requestAnimationFrame for scroll updates rather than heavy scroll-event listeners, and ensure no jank/stutter.

Provide a graceful fallback for mobile/low-power devices or reduced-motion settings: if scroll-scrubbing performance/support is an issue, fall back to a simple autoplay-once video (muted, plays through once) or a static hero image with fade-in.

Include a placeholder/config spot in the code where I can drop in my actual video file (e.g., /public/hero-haircut.mp4).

Animations (site-wide):

Scroll-triggered fade-ins/slide-ins for each section on every page.

Hover effects on buttons, cards, and images (subtle scale/glow, gold shimmer).

Testimonials section scrolls horizontally (auto-sliding carousel or draggable slider) with name, photo, rating, and quote.

Gallery: 3D tilt/parallax hover on images, or smooth 2D masonry scale/fade-in animation as images enter viewport; lightbox opens with zoom/fade transition.

Booking wizard: 3D-style card-flip/slide transition between steps on desktop, simplified 2D slide on mobile.

Subtle floating/parallax decorative elements (gold accents, barber tool icons) on Home and About pages.

All animations should use smooth easing (no bouncy/cartoonish motion), reinforcing the luxury feel, and must be performant with no jank.

Multi-Step Booking System:
Build a guided booking wizard (not a single form) with a progress indicator (Step X of 6):

Select Service — service list with price/duration.

Select Barber — barber list with photo/specialty, or "Any available barber."

Select Date & Time — calendar view + time slot grid (disabled slots grayed out).

Enter Details — name, phone, email, optional notes.

Review & Confirm — summary of all selections with "Edit" links back to each step.

Confirmation — success screen with booking reference and confirmation message.

Requirements:

Preserve data when navigating back/forward between steps.

Validate each step before allowing progression (e.g., required fields, valid phone/email format).

Booking flow accessible from Home, Services, and Contact pages via "Book Now" buttons.

Store bookings (use Supabase if backend/database is needed for persisting bookings, services, barbers, and time slot availability).

Additional sections:

Sticky floating "Book Now" button (mobile + desktop).

Business hours block.

Instagram feed/social proof section.

FAQ accordion (parking, walk-ins vs. appointments, cancellation policy).

Footer with logo, quick links, contact info, social icons, copyright.

Business Details (include in Contact page, Footer, and anywhere relevant):

Address: 1430 Kona St #105, Honolulu, HI 96814, United States

Phone: (808) 949-6081

Embed Google Map pinned to this address.

General requirements:

Clean, semantic, component-based code structure.

Optimized images/assets for fast load times despite animations.

SEO-friendly structure (proper headings, meta tags, alt text per page).

Fully tested and working across Chrome, Safari, Firefox, and Edge, and across all screen sizes.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://bro502-grooming-luxe.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/109578f5-1877-4278-806b-88e1c8b6e0a7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
