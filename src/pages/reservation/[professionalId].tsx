import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { getAvailableSlots } from "../../../core/services/reservations";
import { createReservation } from "../../../core/services/availability";
import { GalleryGrid } from "@/component/GalleryImages";
import { getProfile, getUserById } from "../../../core/services/auth.service";
import { MapPin, MessageCircle, Package, Star, StarIcon, User } from "lucide-react";
import { HorizontalTimeline } from "@/component/Availabiility";
import { DateTimeRangePicker } from "@/component/DateTimePicker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { fetchReviewsForProfessional } from "../../../core/services/reviews.services";
import { createConversation, findConversationBetween } from "../../../core/services/conversations.service";

export default function ReservationPage() {
    const router = useRouter();
    const { professionalId } = router.query;

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false)
    const [reviews, setReviews] = useState([])
    const { toast } = useToast()
    const [startTime, setStartTime] = useState<any>(null);
    const [endTime, setEndTime] = useState<string | null>(null);
    const [proProfile, setProProfile] = useState<any>("")
    const [message, setMessage] = useState("");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL


    useEffect(() => {
        if (!professionalId) return;

        const fetchProfile = async () => {
            try {
                const res = await getUserById(Number(professionalId));
                setProProfile(res);
                console.log(res, 'pro profile');
            } catch (error) {
                console.error(error);
            }
        };

        fetchProfile();
    }, [professionalId]);

    const handleConfirm = async () => {
        if (!startTime || !endTime) {
            return toast({
                variant: 'destructive',
                title: "Error while Booking",
                description: "Please Choose a start ad end Date",
            })
        }

        try {
            await createReservation({
                professionalId: pid,
                date: format(selectedDate, "yyyy-MM-dd"),
                startTime,
                endTime,
                message,
            });
            toast({
                title: "Success",
                description: "Your reservation is confirmed !",
            })
            router.push("/my-reservations");
        } catch (err: any) {
            console.error(err);
            toast({
                variant: 'destructive',
                title: "Error while Booking",
                description: "❌ Failed to book: " + (err.response?.data?.message || err.message),
            })
        }
    };

    useEffect(() => {
        async function loadReviews() {
            if (!professionalId) return;
            setLoading(true);
            try {
                const res: any = await fetchReviewsForProfessional(Number(professionalId));
                setReviews(res);
            } catch (err) {
                console.error('Error loading reviews', err);
            } finally {
                setLoading(false);
            }
        }

        loadReviews()
    }, [professionalId])

    const handleStartConversation = async () => {
        const me = await getProfile();
        const myId = String(me?.id);
        const rawId:any = professionalId

        // Try to find an existing conversation (your “between” call),
        // but DON’T navigate to its _id—just use targetId:
        const existing = await findConversationBetween(myId, rawId);
        if (existing) {
            // ← DON’T do router.push(`/messages/${existing._id}`);
            router.push(`/messages/${rawId}`);
            return;
        }

        // Create a new conversation doc on the server:
        await createConversation(myId, rawId);

        // NOW navigate to /messages/<rawId> (the other user’s ID)
        router.push(`/messages/${rawId}`);
    };

    const avrgRating = reviews.length > 0 ? (reviews.reduce((sum, r: any) => sum + r.rating, 0 / reviews.length)).toFixed(1) : 0.0
    const raw = router.query.professionalId;
    const pid =
        Array.isArray(raw)
            ? parseInt(raw[0], 10)
            : raw
                ? parseInt(raw, 10)
                : undefined;

    // if pid is missing or invalid, you can early-return a loader/message
    if (!pid || isNaN(pid)) return <p style={{ justifySelf: 'center', height: '100vh', alignContent: 'center', fontSize: '25px' }}> Loading ...</p>;;


    return (
        <>
            <Toaster />
            <div className=" px-48 py-32 grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Left - Booking Form */}
                <div className="col-span-3">
                    <GalleryGrid images={[
                        "https://www.ecostylia.com/wp-content/uploads/2024/10/adriana-lima-fond-bleu.jpg",
                        "https://www.ecostylia.com/wp-content/uploads/2024/10/adriana-lima-fond-bleu.jpg",
                        "https://www.ecostylia.com/wp-content/uploads/2024/10/adriana-lima-fond-bleu.jpg",
                        "https://www.ecostylia.com/wp-content/uploads/2024/10/adriana-lima-fond-bleu.jpg",
                        "https://www.ecostylia.com/wp-content/uploads/2024/10/adriana-lima-fond-bleu.jpg",
                        "https://www.ecostylia.com/wp-content/uploads/2024/10/adriana-lima-fond-bleu.jpg",
                    ]} />
                    <h1 className=" text-lg mt-10 ">
                        <p className="flex flex-row - gap-5">{proProfile.professionalProfile?.occupation} •
                            <span className=" flex gap-2"><MapPin color="gray" /> {proProfile.professionalProfile?.country}, {proProfile.professionalProfile?.city} </span></p>
                    </h1>
                    <h2 className="text-4xl font-semibold mt-3">
                        {proProfile.professionalProfile?.username} Reservation Page
                    </h2>
                    <div className="flex flex-row gap-2 items-center mt-2">
                        <svg viewBox="0 0 24 24" width={25} fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.4834 16.7674C17.8471 16.9195 17.1829 17 16.5 17C11.8056 17 8 13.1944 8 8.50001C8 8.01653 8.04036 7.54249 8.11791 7.08105C8.08172 7.11586 8.04432 7.14792 8.00494 7.17781C7.72433 7.39083 7.37485 7.46991 6.67589 7.62806L6.03954 7.77204C3.57986 8.32856 2.35002 8.60682 2.05742 9.54774C1.76482 10.4887 2.60325 11.4691 4.2801 13.4299L4.71392 13.9372C5.19042 14.4944 5.42868 14.773 5.53586 15.1177C5.64305 15.4624 5.60703 15.8341 5.53498 16.5776L5.4694 17.2544C5.21588 19.8706 5.08912 21.1787 5.85515 21.7602C6.62117 22.3417 7.77267 21.8116 10.0757 20.7512L10.6715 20.4768C11.3259 20.1755 11.6531 20.0249 12 20.0249C12.3469 20.0249 12.6741 20.1755 13.3285 20.4768L13.9243 20.7512C16.2273 21.8116 17.3788 22.3417 18.1449 21.7602C18.9109 21.1787 18.7841 19.8706 18.5306 17.2544L18.4834 16.7674Z" fill="#f7d918"></path> <path opacity="0.5" d="M9.15302 5.40838L8.82532 5.99623C8.46538 6.64194 8.28541 6.96479 8.0048 7.17781C8.04418 7.14791 8.08158 7.11586 8.11777 7.08105C8.04022 7.54249 7.99986 8.01653 7.99986 8.50001C7.99986 13.1944 11.8054 17 16.4999 17C17.1828 17 17.8469 16.9195 18.4833 16.7674L18.4649 16.5776C18.3928 15.8341 18.3568 15.4624 18.464 15.1177C18.5712 14.773 18.8094 14.4944 19.2859 13.9372L19.7198 13.4299C21.3966 11.4691 22.235 10.4886 21.9424 9.54773C21.6498 8.60682 20.42 8.32856 17.9603 7.77203L17.324 7.62805C16.625 7.4699 16.2755 7.39083 15.9949 7.17781C15.7143 6.96479 15.5343 6.64194 15.1744 5.99624L14.8467 5.40837C13.58 3.13612 12.9467 2 11.9999 2C11.053 2 10.4197 3.13613 9.15302 5.40838Z" fill="#f7d918"></path> </g></svg>
                        <p> {avrgRating} <span className="text-gray-600 underline ml-2"> {reviews.length} reviews</span></p>
                    </div>
                    <div className="mt-10">
                        <h2 className=" py-3 text-2xl"> Check Professional availability from the his work calendar :</h2>
                        <HorizontalTimeline professionalId={professionalId} />
                        <h2 className=" py-3 text-2xl font-semibold"> Choose reservation dates :</h2>
                        <DateTimeRangePicker
                            professionalId={Number(professionalId)}
                            onChange={(date, s, e) => {
                                setSelectedDate(date);
                                setStartTime(s);
                                setEndTime(e);
                            }}
                        />
                    </div>
                    <div className="my-5">
                        <label className=" text-lg"> Add a description : <span className="text-gray-600 text-sm">(optional)</span></label>
                        <Textarea onChange={(e) => setMessage(e.target.value)} value={message} cols={10} rows={5} />
                    </div>
                    <Button onClick={handleConfirm} className="rounded-none py-6 justify-self-end text-white rounded-tr-xl rounded-bl-xl px-20 bg-gradient-to-r from-blue-900 to-black hover:bg-blue-950 hover:rounded-lg transition-all mt-5">
                        Complete Reservation
                    </Button>
                </div>

                {/* Right - Professional Profile Summary */}
                <div className="lg:col-span-1 border border-gray-200 rounded-xl p-6 h-fit sticky top-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div onClick={() => router.push(`/profile/professional/${professionalId}`)} className="relative w-32 h-32 rounded-full hover:cursor-pointer overflow-hidden border-4 border-white ring-2 ring-green-100">
                            <img
                                className="w-full h-full object-cover"
                                src={`${API_BASE_URL}${proProfile.professionalProfile?.avatar}`}
                                alt={proProfile.professionalProfile?.username}
                            />
                        </div>

                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold flex items-center justify-center gap-1">
                                <User size={18} />
                                {proProfile.professionalProfile?.username}
                            </h3>
                            <p className="text-sm text-green-600 font-medium">{proProfile.professionalProfile?.occupation}</p>
                            <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                                <MapPin size={14} />
                                {proProfile.professionalProfile?.city}, {proProfile.professionalProfile?.country}
                            </p>
                        </div>

                        <div className="w-full border-t border-gray-200 pt-4">
                            <p className="text-sm text-gray-700 text-center">
                                {proProfile.professionalProfile?.description || "No description provided"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                            <StarIcon size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{avrgRating}</span>
                            <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm">
                            <Package size={14} className="text-green-600" />
                            <span className="text-gray-500">Orders</span>
                            <span className="font-medium text-green-700">1</span>
                            <span className="text-gray-400">completed</span>
                        </div>
                        <button onClick={handleStartConversation} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-50 hover:border-indigo-300 transition-all duration-200">
                            <MessageCircle size={16} />
                            CONTACT
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
