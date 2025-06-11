// pages/index.tsx
import {
  ArrowRight, ChevronRight, Palette, Wrench,
  Leaf,
  Plug,
  Dumbbell,
  Laptop,
  Scissors,
  LineChart,
  Sparkles,
  Headset,
  CalendarClock,
  Layers,
  ShieldCheck,
  MessageCircle,
  Box
} from "lucide-react";
import Head from "next/head";
import { motion } from "framer-motion";
import CategoryCarousel from "@/component/Caroussel";
import Image from "next/image";
import { useEffect, useState } from "react";
import { findAll } from "../../core/services/auth.service";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/router";

export default function Home() {
  const cardItems = [
    { title: "Design Consultation", icon: <Palette className="w-5 h-5" /> },
    { title: "Home Plumbing", icon: <Wrench className="w-5 h-5" /> },
    { title: "Garden Landscaping", icon: <Leaf className="w-5 h-5" /> },
    { title: "Electrical Repair", icon: <Plug className="w-5 h-5" /> },
    { title: "Personal Training", icon: <Dumbbell className="w-5 h-5" /> },
    { title: "Developers", icon: <Laptop className="w-5 h-5" /> },
    { title: "Barbers", icon: <Scissors className="w-5 h-5" /> },
    { title: "Marketing Specialists", icon: <LineChart className="w-5 h-5" /> },
    { title: "Other Services", icon: <Sparkles className="w-5 h-5" /> },
  ];

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  const [loading, setLoading] = useState(false)
  const [proProfils, setProProfils] = useState<any>([])
  const router = useRouter()
  const [check, setCheck] = useState(false)

  const trustedBrands = [
    { name: "paypal", src: "https://www.urbantool.com/wp-content/uploads/2016/12/paypal-logo-png.png" },
    { name: "meta", src: "/assets/meta.png" },
    { name: "google", src: "/assets/google.png" },
    { name: "payoneer", src: "https://companieslogo.com/img/orig/PAYO_BIG-aa26e6e0.png?t=1720244493" },
    { name: "netflix", src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1024px-Netflix_2015_logo.svg.png" },
    { name: "venmo", src: "/assets/venmo.png" },
  ];

  useEffect(() => {

    const loadProfessionals = async () => {
      setLoading(true)
      try {
        const res = await findAll()
        setProProfils(res)
        console.log(proProfils, ' fetched professionals')
      } catch (error) {
        console.error(error, 'failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    loadProfessionals()
  }, [])

  useEffect(() => {
    const getAuthUsers = () => {
      const authUser = localStorage.getItem('dalone:token')
      if (authUser) {
        setCheck(true)
      } else {
        setCheck(false)
      }
    }

    getAuthUsers()
  },[])

  return (
    <>
      <Head>
        <title>Professional Services | Find Experts</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="min-h-screen flex flex-col">

        {/* HERO SECTION */}
        <section className="relative flex-1 h-[screen] flex items-center justify-center">
          {/* Background image */}
          <div className="absolute inset-0 bg-[url('/assets/professionall.png')] bg-cover bg-center" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

          {/* Content */}
          <div className="relative z-10 h-screen py-48 w-full px-6 sm:px-8 md:px-12 lg:px-24 mx-auto">
            <div className="text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
              >
                <span className="block text-6xl">Our Professionals</span>
                <span className="text-transparent text-7xl bg-clip-text bg-gradient-to-r from-blue-400 to-orange-500">
                  Will take it from here
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto md:mx-0 mb-8"
              >
                Connecting you with top-tier professionals for all your needs. Quality service guaranteed.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto md:mx-0"
              >
                {cardItems.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    className="
                      group flex items-center justify-between
                      w-full p-4 text-base md:text-lg
                      border border-white/30 rounded-xl
                      bg-white/5 text-white backdrop-blur-sm
                      hover:bg-white/10 hover:border-white/50 transition-all
                    "
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-white flex flex-col items-center"
            >
              <span className="text-sm mb-1">Scroll down</span>
              <ArrowRight className="w-5 h-5 rotate-90" />
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-10 bg-gradient-to-b from-gray-50 to-white px-6 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <div className="inline-block relative mb-4">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur-md opacity-20"></div>
                <h2 className="relative text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Trusted by leading companies
                </h2>
              </div>
              <p className="text-gray-500 max-w-2xl mx-auto">
                We're proud to serve some of the most innovative organizations in the world
              </p>
            </motion.div>

            <div className="relative">
              {/* Gradient fades */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />

              <div className="flex overflow-x-auto py-4 hide-scrollbar">
                <div className="flex items-center gap-12 md:gap-16 px-8">
                  {trustedBrands.map((brand, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                      className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105"
                    >
                      <img
                        src={brand.src}
                        alt={`${brand.name} logo`}
                        width={150}
                        className="h-8 object-contain opacity-80 hover:opacity-100"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why us section */}
        <section className="py-20 bg-white text-gray-900">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 px-6">
            {/* Left Column */}
            <div className="space-y-8">
              <span className="inline-flex items-center bg-blue-50 text-blue-900 text-xs uppercase font-semibold tracking-wider px-4 py-2 rounded-full">
                WHY CHOOSE DALONE
              </span>

              <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                Your Go-To Platform for <span className="text-blue-800">Quality</span> Services
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed">
                DALONE connects you with trusted professionals across various industries. Whether it's an urgent need or a scheduled appointment,
                we've built a platform that's fast, secure, and tailored to your lifestyle.
              </p>

              <div className="flex gap-4">
                <button className="px-6 py-3 bg-blue-900 hover:bg-blue-950 text-white font-medium rounded-lg transition-all duration-200 shadow-sm">
                  Explore Services
                </button>
                <button className="px-6 py-3 border border-gray-300 hover:border-blue-300 text-gray-700 font-medium rounded-lg transition-all duration-200 flex items-center gap-2">
                  <MessageCircle size={18} />
                  Contact Us
                </button>
              </div>
            </div>

            {/* Right Column: Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck size={24} className="text-blue-800" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Verified Professionals</h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Every service provider on DALONE is verified and rated by the community for quality and trust.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Layers size={24} className="text-blue-800" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Wide Range of Services</h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  From home repairs to beauty and wellness, DALONE offers everything you need in one place.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <CalendarClock size={24} className="text-blue-800" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Flexible Booking</h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Book instantly or schedule at your convenience. DALONE adapts to your time.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-sm">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Headset size={24} className="text-blue-800" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Dedicated Support</h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  Need help? Our team is here to assist before, during, and after every booking.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Services Section */}
        <section className="h-80  mt-10 mb-28">
          <h1 className="text-4xl ml-10"> Popular Services :</h1>
          <CategoryCarousel />
        </section>

        {/* Video presentation section */}
        <section className="bg-[url('/assets/hero-bg.png')] bg-cover bg-center text-white rounded-3xl my-12 px-4 py-16 sm:px-6 md:px-10 lg:px-16 xl:mx-32 ">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column */}
            <div className="space-y-6 text-center lg:text-left">
              <h3 className="text-xl font-bold">DALONE</h3>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-tight font-extrabold">
                Instant results.<br />
                Top talent.
              </h1>

              <p className="text-md sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0">
                Find the right professional instantly on DALONE. Whether you need a service now or prefer to schedule ahead,
                browse verified profiles, book in a few clicks, and get the job done. And if anything needs adjusting, your expert
                is always ready to help.
              </p>

              <button className="inline-block bg-white text-black font-medium py-3 px-8 rounded-lg hover:bg-gray-100 transition">
                Get started
              </button>
            </div>

            {/* Right Column */}
            <div className="w-full">
              <video
                src="/assets/Hero-video.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="rounded-xl w-full h-auto shadow-lg"
              />
            </div>
          </div>
        </section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl p-4 max-w-xs mx-auto">
                <Skeleton className="w-full h-40 rounded-2xl mb-4" />
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <section>

            <div className="mx-32">
              <h1 className="text-4xl mb-10">Explore Professionals:</h1>

              <div className="flex flex-row gap-8 overflow-x-auto pb-4 scrollbar-hide">
                {/* Card Container */}
                {proProfils.slice(0, 12).map((p: any, index: any) => (
                  <div key={index} className="rounded-2xl p-4 text-center max-w-xs duration-300">
                    {/* Image */}
                    <div className="relative overflow-hidden cursor-pointer rounded-2xl group" onClick={() => router.push(`/profile/professional/${p.user?.id}`)}>
                      <img
                        src={`${API_BASE_URL}${p?.heroImage}`}
                        alt="Professional work card"
                        className="rounded-2xl mx-auto transform group-hover:scale-105 transition-transform duration-300"
                        width={350}
                      />
                    </div>

                    <div className="flex flex-row items-end mt-3 justify-between">
                      {/* Username */}
                      <div className="flex flex-row items-center gap-2">
                        <div className="relative">
                          <img
                            src={`${API_BASE_URL}${p?.avatar}`}
                            width={28}
                            alt="user avatar"
                            className="rounded-full border-2 border-white shadow-sm"
                          />
                        </div>
                        <p className="text-gray-800 font-medium">@{p?.username}</p>
                      </div>

                      {/* Meta info (orders, likes, etc.) */}
                      <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5 font-medium text-gray-600">
                          <Box className="w-4 h-4 text-indigo-500" />
                          {p.orders || 5} orders
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className=" text-md text-blue-800 hover:underline transition-all cursor-pointer justify-self-center mt-5"> See more ... </p>
            </div>
          </section>
        )}

        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Make it all happen with <span className="text-indigo-600">Professionals</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Connect with skilled professionals ready to bring your projects to life
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className=" p-6 rounded-xl transition-all duration-300 flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-4">
                <img src="/assets/logo1.png" alt="Professionals icon" width={100} height={100} />
              </div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Diverse Talent Pool</h3>
              <p className="text-gray-600 text-sm">
                Access a pool of top professionals across 700+ categories
              </p>
            </div>

            {/* Feature 2 */}
            <div className=" p-6 rounded-xl transition-all duration-300 flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-4">
                <img src="/assets/verified.png" alt="Professionals icon" width={100} height={100} />
              </div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Verified Experts </h3>
              <p className="text-gray-600 text-sm">
                All professionals are vetted for quality and expertise
              </p>
            </div>

            {/* Feature 3 */}
            <div className=" p-6 rounded-xl transition-all duration-300 flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-4">
                <img src="/assets/matching.png" alt="Professionals icon" width={100} height={100} />
              </div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Quick Matching </h3>
              <p className="text-gray-600 text-sm">
                Find the right professional for your project in minutes
              </p>
            </div>

            {/* Feature 4 */}
            <div className=" p-6 rounded-xl transition-all duration-300 flex flex-col items-center text-center">
              <div className="flex items-center justify-center mb-4">
                <img src="/assets/support.png" alt="Professionals icon" width={100} height={100} />
              </div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2"> Dedicated Support </h3>
              <p className="text-gray-600 text-sm">
                24/7 assistance throughout your project journey
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br rounded-[2rem]px-6 py-16 sm:px-8 md:px-8 lg:px-20 xl:mx-auto ">
          {/* <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"> */}
          {/* Video Column - Now on left */}
          {/* <div className="w-full relative group"> */}
          {/* Decorative background element */}
          {/* <div className="absolute -inset-4 bg-green-200/80 rounded-2xl -z-10 rotate-2 transition-all duration-500 group-hover:rotate-1 group-hover:scale-105"></div> */}

          {/* Video container with hover effect */}
          {/* <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-video border-4 border-white/10">
                <video
                  src="/assets/howToOrder.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover "
                />

              </div>
            </div> */}

          {/* Text Column - Now on right */}
          {/* <div className="space-y-8 text-center lg:text-left"> */}

          {/* Headline with improved gradient */}
          {/* <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-tight font-bold text-gray-900">
                How to Book a Service<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-700 to-green-800 animate-gradient-x">
                  on DALONE
                </span>
              </h1> */}

          {/* Description with better readability */}
          {/* <p className="text-lg text-gray-600/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Ordering on Dalone is fast and effortless. Browse available professionals, choose your preferred service,
                select a time slot, and confirm your reservation — all in just a few clicks.
              </p>
            </div>
          </div> */}
          <h1 className=" text-3xl text-gray-700 mb-10"> How to book a Professional :</h1>
          <video
            src="/assets/howToOrder.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full rounded-3xl h-full object-cover "
          />
        </section>

        {!check ? (
        <section
          className="relative h-96 bg-cover bg-center flex items-center justify-center mx-20 rounded-3xl"
          style={{ backgroundImage: "url('/assets/CTA.png')" }}
        >

          {/* Content */}
          <div className="relative z-10 text-center px-36">
            <h2 className="text-3xl md:text-4xl lg:text-5xl mx-10 mb-4">
              <span className="text-black"> Join 10k+ of Professionals <br /> And <br /> start making more profits</span>
            </h2>
            <div className="flex mt-10 flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-950 text-white rounded-full hover:bg-[#24246a] transition">
                Sign In
              </button>
              <button className="px-6 py-3 border border-black text-black rounded-full hover:bg-white hover:text-blue-900 transition">
                Brows Professionals
              </button>
            </div>
          </div>
        </section>

        ) : (
          null
        )}
      </main>
    </>
  );
}