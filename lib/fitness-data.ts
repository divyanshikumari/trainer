export const GOOGLE_FORM_URL = "GOOGLE_FORM_URL"
export const ABOUT_VIDEO_URL = "/hero-training-latest.mp4"
export const SECOND_VIDEO_URL = "/about-fitness.mp4"

export const TRAINER_PHONE = "9334349698"
export const TRAINER_WHATSAPP = "919334349698"

export const contact = {
  phone: TRAINER_PHONE,
  phoneHref: `tel:+91${TRAINER_PHONE}`,
  whatsappHref: `https://wa.me/${TRAINER_WHATSAPP}?text=${encodeURIComponent("Hi Pappu, I would like to book a fitness training session.")}`,
  instagram: "@pmfitnesscoach",
  instagramHref: "https://www.instagram.com/pmfitnesscoach/",
  email: "businessmahto@gmail.com",
  title: "Certified Fitness Trainer",
  location: "Ramgarh, Jharkhand",
}

export const images = {
  hero: "/trainer-hero-lift.jpg",
  profile: "/trainer-profile.jpg",
  strength: "/trainer-flex.jpg",
  lift: "/trainer-fourth.jpg",
  flex: "/trainer-profile.jpg",
}

export const trainerSlides = [images.hero, images.profile, images.strength, images.lift]

export const clientPlaceholders = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
]

export const services = [
  ["01", "Personal Training", "For Men & Women — personalized training customized to individual fitness goals."],
  ["02", "Fat Loss", "Structured workouts and nutrition guidance for sustainable fat loss."],
  ["03", "Muscle & Weight Gain", "Build strength and lean muscle with structured training."],
  ["04", "Strength Training", "Improve strength, endurance and overall performance."],
  ["05", "Diet & Nutrition", "Personalized nutrition guidance to support fitness goals."],
  ["06", "Mobility & Stretching", "Improve flexibility, movement and recovery."],
]

export const packages = [
  { label: "20 SESSIONS", name: "Normal Training", price: "₹3,000", amount: 3000, features: ["20 Personal Training Sessions", "Personalized Workout Plan", "Diet & Nutrition Guidance", "Progress Tracking"] },
  { label: "20 SESSIONS", name: "Advanced Personal Training", price: "₹3,800", amount: 3800, features: ["20 Personal Training Sessions", "Personalized Workout Plan", "Diet & Nutrition Guidance", "Strength, Fat Loss & Muscle Gain", "Mobility & Stretching"] },
  { label: "PARTNER", name: "Partner Training", price: "₹4,600", amount: 4600, featured: true, features: ["Personalized Workout Plan", "Diet & Nutrition Guidance", "Partner Training", "Progress Tracking"] },
  { label: "20 SESSIONS", name: "Online Personal Training", price: "₹3,400", amount: 3400, features: ["20 Online Personal Training Sessions", "Personalized Workout Plan", "Diet & Nutrition Guidance", "Weekly Progress Tracking", "Online Exercise Guidance & Trainer Support"] },
]

export const testimonials = [
  { name: "Client feedback", quote: "The plan is clear, the guidance is personal, and every session feels purposeful.", meta: "Personal Training" },
  { name: "Client feedback", quote: "Pappu keeps the focus on safe form and real progress. I feel stronger every week.", meta: "Strength Training" },
  { name: "Client feedback", quote: "A practical approach to fitness that finally fits into my routine.", meta: "Fat Loss & Nutrition" },
]

export const programs = [
  ["PERSONAL TRAINING", "One-to-one fitness coaching built around your starting point and your next milestone."],
  ["MEN'S TRAINING", "Strength, muscle building, fat loss and performance-focused training."],
  ["WOMEN'S TRAINING", "Fat loss, strength, fitness and confidence-focused coaching."],
  ["DIET & NUTRITION", "Personalized nutrition guidance according to your individual goals."],
]
