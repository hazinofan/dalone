import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Columns3Cog, ShieldQuestion, Trash, Trash2 } from "lucide-react";
import { Fira_Sans } from "next/font/google";
import { deleteGig, getGigByUser } from "../../core/services/gigs.services";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getProfile } from "../../core/services/auth.service";
const fira = Fira_Sans({ subsets: ["latin"], weight: ["300", "400", "700"] });

type Gig = {
  id: number | string;
  title: string;
  heroImage: string;
  createdAt: string;
  availability: any;
  priceAfterPromo?: number;
  priceBeforePromo: number;
  servicePeriod: string;
  rating?: number;
  reviewCount?: number;
  whatsIncluded?: string[];
  enableCustomOffers?: boolean;
};


const GigCard = ({ gig }: { gig: Gig }) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;
  const daysCount = Object.keys(gig.availability).length
  const { toast } = useToast()

  const [gigs, setGigs] = useState<any>([])
  const router = useRouter();
  const [authUser, setAuthUser] = useState(0)
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady && typeof router.query.id === 'string') {
      setId(router.query.id);
    }
  }, [router.isReady]);

  async function fetchGigs() {
    try {
      const data = await getGigByUser(Number(id));
      setGigs(data);
    } catch (err) {
      console.error("Could not load gigs:", err);
    }
  }

  useEffect(() => {
    fetchGigs();
  }, []);

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


  async function handleDelete(id: number | string) {
    try {
      await deleteGig(Number(id));
      console.log(`Gig ${id} deleted`);
      await fetchGigs()

      toast({
        title: "Gig Deleted Successfully",
        description: "Your GIG has been deleted permanently from your account !",
      })
      window.location.reload()
    } catch (error) {
      console.error("Failed to delete gig:", error);

      toast({
        title: "Not authorized",
        description: "Your are not authorized to delete this GIG !",
      })
    }
  }

  return (
    <div className="mb-3 mx-auto mt-8">
      <Toaster />
      <div
        className="
          border-2 flex flex-row gap-16
          border-gray-300 rounded-2xl p-8
          bg-gray-50 hover:bg-gray-100
          hover:border-gray-400 transition-colors duration-200
          h-full
        "
      >
        <div>
          <img
            src={`${API_BASE_URL}/public/${gig.heroImage}`} // Add a fallback image
            alt="GIG Hero image"
            className="rounded-2xl w-80 max-h-72 object-cover"
          />
        </div>

        {/* Make this a column flex and stretch to full height */}
        <div className="w-full flex flex-col justify-between">
          {/* Top / header area */}
          <div>
            <div className="flex flex-row items-start justify-between">
              <div className="">
                <h1 className="text-2xl">{gig.title}</h1>
                <h4 className="text-lg text-gray-400">created: {gig.createdAt}</h4>
              </div>
              <button
                className=" p-2 pb-0 rounded-full transition-colors duration-200  "
              >
                <Popover>
                  <PopoverTrigger asChild>
                    {Number(id) === authUser && (
                      <button
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Delete gig"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </PopoverTrigger>
                  <PopoverContent
                    className={`${fira.className} w-80 p-4 rounded-xl shadow-lg border border-gray-200`}
                    align="end"
                    sideOffset={8}
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900">Delete Gig</h3>
                        <p className="text-sm text-gray-600">
                          Are you sure you want to delete this gig? This action cannot be undone.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          onClick={() => {
                            handleDelete(gig.id);
                            // close the popover
                            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </button>
            </div>
            <div className="mt-8 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar />
                <p className=" text-lg">Service period: {gig.servicePeriod}</p>
              </div>
              <div className="flex items-center gap-2">
                <Columns3Cog />
                <p className="text-lg">Custom Offers: {String(gig.enableCustomOffers)}</p>
              </div>
              <div className="flex items-center gap-2">
                <ShieldQuestion color="green" />
                <p className="text-lg">Availability: <span className=" text-gray-600"> {daysCount} Days/week </span></p>
              </div>
            </div>
          </div>

          {/* Bottom row will always sit at the bottom */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-lg">
              <span className="text-green-800"> average selling price : {gig.priceAfterPromo}$</span>
            </p>
            <Link href={`/profile/professional/${id}/services/${gig.id}`} className="rounded-none py-1 text-white rounded-tr-xl rounded-bl-xl px-10 bg-blue-950 hover:bg-blue-950">
              Preview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCard;
