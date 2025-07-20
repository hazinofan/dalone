import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getGigById, getGigByUser } from '../../../../../../core/services/gigs.services';
import { getProfile } from '../../../../../../core/services/auth.service';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GigDetailsPage() {
  const router = useRouter();
  const { id, gigId } = router.query;

  const [gig, setGig] = useState<Gig | null>(null);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;
  const [loadingData, setLoadingData] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(0)

  type TimeSlot = { from?: string; to?: string };

  interface Gig {
    id: number;
    title: string;
    heroImage: string;
    priceBeforePromo: number;
    priceAfterPromo?: number;
    about: string;
    whatsIncluded: string[];
    servicePeriod: string;
    availability: Record<string, TimeSlot>;
    enableCustomOffers: boolean;
    customOfferDescription?: string;
    customOfferPriceBeforePromo?: number;
    customOfferPriceAfterPromo?: number;
    user?: {
      professionalProfile: { username: string };
    };
  };


  async function loadGigById(gId: any) {
    setLoadingData(true);
    try {
      const data = await getGigById(gId);
      console.log('fetched gig details for gigId:', gId, data);
      setGig(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1) fetch the user + nested professionalProfile
        const userRes = await fetch(`${API_BASE_URL}/users/${id}`);
        if (!userRes.ok) throw new Error("Failed to load user");
        const userData = await userRes.json();
        console.log(userData, 'data bb')
        setProfile(userData.professionalProfile);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // useEffect(() => {
  //   getProfile()
  //     .then((me) => {
  //       console.log("Logged-in user:", me);
  //       setAuthUser(me.id)
  //     })
  //     .catch((err) => {
  //       console.error("Could not load profile:", err);
  //     });
  // }, []);


  useEffect(() => {
    console.log('route params →', { id, gigId });
    if (gigId) {
      loadGigById(gigId);
    }
  }, [gigId]);

  if (loadingData) return <p>Loading…</p>;
  if (!gig) return <p>No gig data yet</p>;

  return (
    <div className='py-28 px-4 sm:px-8 md:px-16 lg:px-24 bg-gray-50'>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-col gap-12">
          {/* Main Image */}
          <div className=" h-96">
            <img
              src={`${API_BASE_URL}/public${gig.heroImage}`}
              alt="Service Image"
              className="w-1/2 h-full object-cover object-center transition-transform duration-500 rounded-2xl justify-self-center"
            />
          </div>

          {/* Details Section */}
          <div className=" flex flex-col">

            <Link href={`/profile/professional/${id}`} className='flex flex-row items-center text-xl mb-5 text-blue-900 hover:text-blue-950 gap-3'> <ArrowLeft /> <span>Go Back</span> </Link>

            <div className="flex justify-between items-start">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{gig.title}</h1>
              <div className="flex items-center bg-indigo-100 px-3 py-1 rounded-full">
                <span className="text-indigo-800 font-medium">${gig.priceAfterPromo || gig.priceBeforePromo}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                <img src="/assets/pdp.png" alt="user Professional" />
              </div>
              <span className="text-gray-600">Posted by {gig.user?.professionalProfile.username || 'seller'}</span>
            </div>

            <div className="prose max-w-none mb-6 text-gray-700">
              <p>{gig.about}</p>
            </div>

            {/* What's Included */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">What's Included</h3>
              <ul className="space-y-2">
                {gig.whatsIncluded.map((item: any, index: any) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Period */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Service Period</h3>
              <p className="text-gray-700">{gig.servicePeriod}</p>
            </div>

            {/* Pricing */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Pricing</h3>
              <div className="flex items-baseline gap-3">
                {gig.priceAfterPromo && (
                  <span className="text-2xl font-bold text-gray-900">${gig.priceAfterPromo}</span>
                )}
                <span className={`text-xl ${gig.priceAfterPromo ? 'line-through text-gray-500' : 'text-gray-900 font-bold'}`}>
                  ${gig.priceBeforePromo}
                </span>
                {gig.priceAfterPromo && (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-0.5 rounded">
                    {Math.round((1 - gig.priceAfterPromo / gig.priceBeforePromo) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {Number(id) !== authUser && (
              <div className="md:flex md:flex-row flex flex-col gap-4 mt-auto">
                <button className="bg-blue-950 py-3 px-6 rounded-tr-xl rounded-bl-xl hover:rounded-sm transition-all text-white flex flex-row items-center justify-center gap-2 md:w-1/2 ">
                  Order Now
                </button>
                <button className="bg-red-700/75 py-3 px-6 rounded-tr-xl rounded-bl-xl hover:rounded-sm transition-all text-white flex flex-row items-center justify-center gap-2 md:w-1/2">
                  Contact Seller
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Availability Section */}
        <div className="mt-16  mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Availability</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.entries(gig.availability).map(([day, times]) => (
              <div key={day} className="bg-gradient-to-tr from-blue-950 to-red-500/70 p-4 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-medium text-white capitalize mb-2">{day}</h4>
                {times.from && times.to ? (
                  <p className="text-white">{times.from} - {times.to}</p>
                ) : (
                  <p className="text-white">Not available</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Offers Section */}
        {gig.enableCustomOffers && (
          <div className="mt-16 mx-auto bg-indigo-50 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Custom Offers</h2>
            <p className="text-gray-700 mb-4">{gig.customOfferDescription}</p>
            <div className="flex items-baseline gap-3">
              {gig.customOfferPriceAfterPromo && (
                <span className="text-2xl font-bold text-gray-900">${gig.customOfferPriceAfterPromo}</span>
              )}
              <span className={`text-xl ${gig.customOfferPriceAfterPromo ? 'line-through text-gray-500' : 'text-gray-900 font-bold'}`}>
                ${gig.customOfferPriceBeforePromo}
              </span>
            </div>
            {Number(id) !== authUser && (
              <button className="mt-4 bg-white border border-violet-600 text-indigo-600 hover:bg-violet-600 hover:text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Request Custom Offer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
