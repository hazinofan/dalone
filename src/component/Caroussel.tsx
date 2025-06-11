import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";

const categories = [
  { title: "Barbers", image: "/assets/barber.png" },
  { title: "Home Plumbing", image: "/assets/plumbing.png" },
  { title: "Electricians", image: "/assets/plumbing.png" },
  { title: "Gardeners", image: "/assets/plumbing.png" },
  { title: "Fitness", image: "/assets/plumbing.png" },
  { title: "Developers", image: "/assets/plumbing.png" },
  { title: "Designers", image: "/assets/plumbing.png" },
  { title: "Cleaners", image: "/assets/plumbing.png" },
  { title: "Tutors", image: "/assets/plumbing.png" },
  { title: "Drivers", image: "/assets/plumbing.png" },
];

export default function CategoryCarousel() {
  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-20 py-10">
      <Swiper
        spaceBetween={16}
        freeMode
        slidesPerView={2.2}
        breakpoints={{
          480: {
            slidesPerView: 2.5,
          },
          640: {
            slidesPerView: 3,
          },
          768: {
            slidesPerView: 4,
          },
          1024: {
            slidesPerView: 5,
          },
          1280: {
            slidesPerView: 6,
          },
        }}
        modules={[FreeMode]}
        className="pb-4"
      >
        {categories.map((cat, i) => (
          <SwiperSlide
            key={i}
            className="!w-auto max-w-[200px] bg-blue-950 text-white rounded-2xl flex flex-col justify-between p-4 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <h3 className="text-sm md:text-base font-semibold mb-4">{cat.title}</h3>
            <img
              src={cat.image}
              alt={cat.title}
              className="rounded-xl object-cover w-full h-36 sm:h-40 md:h-44 lg:h-48"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
