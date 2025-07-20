// pages/finish-joining.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingStepper } from "@/component/OnboardingStepper";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/component/FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CountrySelect } from "@/component/countrySelector";
import { getProfile, UserProfile } from "../../../core/services/auth.service";

export default function FinishSignup() {
  const router = useRouter();
  const { token: queryToken } = router.query as { token?: string };
  const [token, setToken] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempPhone, setTempPhone] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [step, setStep] = useState<number>(1);
  const { toast } = useToast();

  interface ProfessionalPayload {
    name: string;
    username: string;
    avatar: string;
    description: string;
    country: string;
    city: string;
    occupation: string;
    otherOccupation?: string;
    skills: string[];
    languages: { name: string; level: string }[];
    phoneNumber: string;
  }

  interface ClientPayload {
    name: string;
    username: string;
    country: string;
    avatar: string;
    description: string;
    phoneNumber: string;
  }

  // Role choix step 1
  const [selectedRole, setSelectedRole] = useState<
    "client" | "professional" | null
  >(null);

  const clientSteps = [
    { label: "Personal Info", value: 2 },
    { label: "Account Security", value: 3 },
  ];

  const handleNextStep2Client = () => {
    if (selectedRole === "client") setStep(3);
  };

  const professionalSteps = [
    { label: "Personal Info", value: 2 },
    { label: "Professional Info", value: 3 },
    { label: "Account Security", value: 4 },
  ];

  // Step 2 form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  type Skill = string;
  type Language = { name: string; level: "Native" | "Fluent" | "Beginner" };

  const [occupation, setOccupation] = useState<string>("Hairdresser");
  const [country, setCountry] = useState("");
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [city, setCity] = useState("");
    const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ;
  const [otherOccupation, setOtherOccupation] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>([""]);
  const [languages, setLanguages] = useState<Language[]>([
    { name: "", level: "Beginner" },
  ]);

  const addSkill = () => {
    if (skills.length < 7) setSkills([...skills, ""]);
  };
  const updateSkill = (idx: number, val: string) => {
    const s = [...skills];
    s[idx] = val;
    setSkills(s);
  };
  const removeSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const addLanguage = () => {
    setLanguages([...languages, { name: "", level: "Beginner" }]);
  };
  const updateLanguage = (idx: number, field: keyof Language, val: string) => {
    const l = [...languages] as Language[];
    l[idx] = { ...l[idx], [field]: val };
    setLanguages(l);
  };
  const removeLanguage = (idx: number) => {
    setLanguages(languages.filter((_, i) => i !== idx));
  };

  const OCCUPATIONS = [
    "Hairdresser",
    "Barber",
    "Makeup Artist",
    "Nail Technician",
    "Massage Therapist",
    "Other",
  ];

  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Not authorized");
        const me = await res.json();
        setUserId(me.id);
        // you could grab the profile if you need it
      } catch {
        return router.replace("/login");
      } finally {
        setValidating(false);
      }
    };
    validate();
  }, [token, router]);

  // Load token from query or storage
  useEffect(() => {
    if (queryToken) {
      setToken(queryToken);
      localStorage.setItem("dalone:token", queryToken);
    } else {
      const stored = localStorage.getItem("dalone:token");
      if (stored) setToken(stored);
    }
  }, [queryToken]);

  // Step 1 → next to step 2
  const handleNext = async () => {
    if (!selectedRole || !token || userId === null) return;

    // 1) Patch our role on the server
    await fetch(`${API_BASE_URL}/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: selectedRole }),
    });

    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // 2) advance to step 2
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (selectedRole === "professional") {
      setStep(3);
    }
  };

  const handleNextStep3 = () => {
    if (selectedRole === "professional") {
      setStep(4);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("dalone:token");
    if (t) setToken(t);
    else setValidating(false);
  }, []);

  useEffect(() => {
    getProfile()
      .then((me) => {
        console.log("Logged-in user:", me);
        setUserInfo(me);
      })
      .catch((err) => {
        console.error("Could not load profile:", err);
      });
  }, []);

  // 2) Guard: if you're already onboarded, kick them out immediately
  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setValidating(false);
        return;
      }
      const me = await res.json();
      // if role is anything but "pending", redirect:
      if (me.role === "client") {
        router.replace(`/profile/${me.id}`);
      } else if (me.role === "professional") {
        router.replace(`/profile/professional/${me.id}`);
      } else {
        setValidating(false);
      }
    })();
  }, [token, router]);

  if (validating) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
        <div className="relative w-16 h-16">
          {/* Outer ring */}
          <div className="absolute w-full h-full rounded-full border-4 border-green-200"></div>
          {/* Animated spinner */}
          <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
          {/* Optional center dot (remove if you prefer minimal) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-500"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700 animate-pulse">
          Checking your status...
        </p>
      </div>
    );
  }

  // Final submit
  const handleSubmit = async () => {
    if (!token) return;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    try {
      if (selectedRole === "client") {
        const clientPayload: ClientPayload = {
          name: name,
          username,
          avatar: avatarUrl,
          country: country,
          description,
          phoneNumber,
        };
        await fetch(`${API_BASE_URL}/client-profile`, {
          method: "POST",
          headers,
          body: JSON.stringify(clientPayload),
        });
        router.replace(`/profile/${userInfo?.id}`);
        toast({
          title: "Account created Successfully",
          description:
            "You can Now fill missing informations and start looking for professionals !",
        });
      } else {
        // collect everything you’ve gathered
        const payload: ProfessionalPayload = {
          name: name,
          username,
          avatar: avatarUrl,
          country: country,
          city: city,
          description,
          occupation,
          otherOccupation: occupation === "Other" ? otherOccupation : undefined,
          skills,
          languages,
          phoneNumber,
        };

        await fetch(`${API_BASE_URL}/professional-profile/me`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        router.replace("/profile/professional");
        toast({
          title: "Account created Successfully",
          description:
            "You can Now fill missing informations and start looking for Clients !",
        });
      }
    } catch (error) {
      console.error(error, "error saving the user data");
    }
  };

  // Pendant la validation on peut afficher un loader
  if (validating) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        Vérification du token…
      </div>
    );
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>Token manquant…</h2>
      </div>
    );
  }

  if (!token) {
    return (
      <p style={{ textAlign: "center", marginTop: 40, margin: "0 auto" }}>
        Token manquant…
      </p>
    );
  }

  return (
    <div className="mt-26">
      {step === 1 && (
        <div className="flex flex-col mt-28 sm:mt-28 md:mt-40 items-center text-center w-full px-4 sm:px-6 max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl mb-4 sm:mb-6">
            Welcome! What type of account?
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-6 sm:mb-8 w-full">
            {(["client", "professional"] as const).map((role) => (
              <div
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-shrink-0 border rounded-lg p-4 sm:p-6 md:p-8 lg:p-28 cursor-pointer transition w-full sm:w-auto
            ${
              selectedRole === role
                ? "border-2 border-blue-500 shadow-lg"
                : "border-gray-200 hover:shadow-md"
            }`}
              >
                <h2 className="text-lg sm:text-xl mb-2">
                  {role === "client" ? "I am a Client" : "I am a Professional"}
                </h2>
                <img
                  src={
                    role === "client"
                      ? "/assets/client.png"
                      : "/assets/freelancer.png"
                  }
                  alt={role}
                  className="mx-auto h-40 sm:h-60 md:h-80 object-contain"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={handleNext}
            disabled={!selectedRole}
            className="w-full sm:w-36 text-base sm:text-lg bg-blue-950 hover:bg-[#121d3a] transition-colors disabled:opacity-50 mx-auto"
          >
            Next
          </Button>
        </div>
      )}

      {step === 2 && selectedRole === "client" && (
        <div className="px-4 sm:px-6 md:px-24 pt-28 sm:pt-32">
          <OnboardingStepper currentStep={step} steps={clientSteps} />

          {/* header + illustration */}
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-xl text-center md:text-left">
              <h1 className="text-4xl text-gray-700 mb-4 font-semibold">
                PERSONAL INFOS
              </h1>
              <span className="block mt-5 text-gray-500">
                tell us a bit about yourself. This information will only appear
                on your public profile, so that potential clients can get to
                know you better
              </span>
            </div>
            <div className="mt-8 md:mt-0">
              <img
                src="assets/personalinfos.png"
                alt="personal infos"
                className="w-full max-w-xs md:max-w-[250px] mx-auto"
              />
            </div>
          </div>

          <Separator className="mb-5" />

          {/* form fields */}
          <div className="space-y-6 mx-auto max-w-lg md:max-w-none mb-5">
            {[
              {
                label: "Full Name",
                placeholder: "John Doe …",
                value: name,
                onChange: (e: any) => setName(e.target.value),
              },
              {
                label: "Username",
                placeholder: "ex: mr_haircut",
                value: username,
                onChange: (e: any) => setUsername(e.target.value),
                extra: (
                  <span className="text-sm text-gray-400">(display name)</span>
                ),
              },
            ].map(({ label, placeholder, value, onChange, extra }) => (
              <div
                key={label}
                className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] items-center gap-6 sm:gap-16"
              >
                <label className="text-xl font-normal">
                  {label} {extra} <span className="text-red-600">*</span>
                </label>
                <Input
                  placeholder={placeholder}
                  value={value}
                  onChange={onChange}
                  className="w-full h-14"
                />
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] items-center gap-6 sm:gap-16">
              <label className="text-xl font-normal">
                Country: <span className="text-red-600">*</span>
              </label>
              <CountrySelect
                value={country}
                onChange={setCountry}
                placeholder="Search and select country"
              />
            </div>

            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
              <label className="text-xl font-normal">
                City :<span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Florida ..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-14"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] items-center gap-6 sm:gap-16">
              <label className="text-xl font-normal">Profile Picture</label>
              <FileUploadField onFileSelected={setAvatarUrl} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] items-start gap-6 sm:gap-16">
              <label className="text-xl font-normal">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Share a bit about yourself and what you’re looking for as a client!"
                className="w-full"
              />
            </div>
          </div>

          {/* next button */}
          <div className="mt-8 flex justify-center md:justify-end">
            <Button
              onClick={handleNextStep2Client}
              className="w-full sm:w-36 bg-blue-950 hover:bg-blue-[#0e193d] transition-colors"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && selectedRole === "client" && (
        <>
          <div className="py-32 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-8 md:px-12 lg:px-24 space-y-4 sm:space-y-6">
            <OnboardingStepper currentStep={3} steps={clientSteps} />

            <h1 className="text-2xl sm:text-3xl md:text-4xl text-gray-700 mb-2 sm:mb-4 font-semibold">
              ACCOUNT SECURITY
            </h1>
            <p className="block mb-4 sm:mb-6 text-sm sm:text-base text-gray-500">
              Trust and safety is a big deal in our community. Please verify
              your Email and Phone number so that we can keep your account
              secured!{" "}
              <span className=" text-sm text-gray-600">
                {" "}
                ( you can update your informations later in your profile section
                ){" "}
              </span>
            </p>

            <Separator />

            {/* Email row */}
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
              <Mail className="text-gray-500 w-5 h-5 sm:w-6 sm:h-6" />

              <div>
                <span className="text-base sm:text-lg md:text-xl font-normal">
                  Email:
                </span>{" "}
                <span className="text-base sm:text-lg md:text-xl font-semibold italic text-gray-500">
                  PRIVATE
                </span>
              </div>

              <button
                disabled
                className="px-4 sm:px-6 py-2 sm:py-3 md:py-4 border border-gray-300 text-xs sm:text-sm font-medium bg-gray-400/15 cursor-not-allowed"
              >
                Verified
              </button>
            </div>

            {/* Phone Number row */}
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
              <Phone className="text-gray-500 w-5 h-5 sm:w-6 sm:h-6" />

              <div>
                <span className="text-base sm:text-lg md:text-xl font-normal">
                  Phone Number:
                </span>{" "}
                <span className="text-base sm:text-lg md:text-xl font-semibold italic text-gray-500">
                  {phoneNumber ?? "PRIVATE"}
                </span>
              </div>

              {phoneNumber ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm rounded">
                  <Check className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-4 sm:px-6 py-3 sm:py-4 md:py-5 border border-gray-300 text-xs sm:text-sm font-medium rounded-none hover:bg-gray-50"
                    >
                      Add Phone Number
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="w-[90vw] sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Phone Number</DialogTitle>
                      <DialogDescription>
                        Enter your phone number so clients can reach you.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                      <Input
                        type="tel"
                        placeholder="+212 6 1234 5678"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <DialogFooter>
                      {/* only this button closes the dialog */}
                      <DialogClose asChild>
                        <Button
                          onClick={() => {
                            setPhoneNumber(tempPhone.trim());
                          }}
                          disabled={!tempPhone.trim()}
                        >
                          Save
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="text-right mt-4 sm:mt-6">
              <Button
                onClick={handleSubmit}
                disabled={
                  !avatarUrl ||
                  !phoneNumber ||
                  !name ||
                  !username ||
                  !occupation ||
                  !skills
                }
                className="w-full sm:w-36 bg-blue-950 rounded-none hover:rounded-xl transition-all hover:bg-blue-950 py-3 sm:py-4 md:py-5"
              >
                Finish
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 2 && selectedRole === "professional" && (
        <div className="py-32 sm:py-16 md:py-24 lg:py-36 px-4 sm:px-8 md:px-12 lg:px-24">
          <OnboardingStepper currentStep={step} steps={professionalSteps} />

          <div className="mb-6 sm:mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl text-gray-700 mb-2 sm:mb-4 font-semibold">
                PERSONAL INFOS
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                Tell us a bit about yourself. This information will only appear
                on your public profile, so that potential clients can get to
                know you better.
              </p>
            </div>
            <div className="hidden md:block">
              <img
                width={250}
                src="assets/personalinfos.png"
                alt="personal infos"
                className="w-[200px] lg:w-[250px]"
              />
            </div>
          </div>

          <Separator className="mb-4 sm:mb-5 text-gray-800" />

          <div className="space-y-4 sm:space-y-6 mx-auto">
            {/* Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(150px,200px)_minmax(0,1fr)] items-center gap-4 sm:gap-8 md:gap-16">
              <label className="text-base sm:text-lg md:text-xl font-normal">
                Full Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="John Doe …"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 sm:h-14"
              />
            </div>

            {/* Username */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(150px,200px)_minmax(0,1fr)] items-center gap-4 sm:gap-8 md:gap-16">
              <label className="text-base sm:text-lg md:text-xl font-normal">
                Username{" "}
                <span className="text-xs sm:text-sm text-gray-400">
                  (display name)
                </span>
                <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="ex: mr_haircut"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 sm:h-14"
              />
            </div>

            {/* Country */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(150px,200px)_minmax(0,1fr)] items-center gap-4 sm:gap-8 md:gap-16 mt-6 sm:mt-8">
              <label className="text-base sm:text-lg md:text-xl font-normal">
                Country <span className="text-red-600">*</span>
              </label>
              <CountrySelect
                value={country}
                onChange={setCountry}
                placeholder="Search and select country"
              />
            </div>

            {/* City */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(150px,200px)_minmax(0,1fr)] items-center gap-4 sm:gap-8 md:gap-16">
              <label className="text-base sm:text-lg md:text-xl font-normal">
                City <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="Florida ..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-12 sm:h-14"
              />
            </div>

            {/* Profile Picture */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(150px,200px)_minmax(0,1fr)] items-center gap-4 sm:gap-8 md:gap-16">
              <label className="text-base sm:text-lg md:text-xl font-normal">
                Profile Picture
              </label>
              <FileUploadField
                onFileSelected={(fileOrUrl) => {
                  setAvatarUrl(fileOrUrl);
                }}
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(150px,200px)_minmax(0,1fr)] items-start gap-4 sm:gap-8 md:gap-16">
              <label className="text-base sm:text-lg md:text-xl font-normal">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share a bit about your work experience!"
                className="w-full min-h-[150px] sm:min-h-[200px]"
                rows={8}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleNextStep2}
              disabled={!name || !username || !country || !city}
              className="w-full sm:w-36 bg-blue-950 hover:bg-[#0e193d] transition-colors"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && selectedRole === "professional" && (
        <div className="py-36 md:px-24 px-8 space-y-6">
          <OnboardingStepper currentStep={3} steps={professionalSteps} />

          <div className="flex flex-row items-center justify-between">
            <div className="">
              <h1 className="text-4xl text-gray-700 mb-4 font-semibold">
                PROFESSIONAL INFOS
              </h1>
              <span className="block mb-6 text-gray-500">
                THIS IS YOUR TIME TO SHINE. LET POTENTIAL CLIENTS KNOW WHAT YOU
                DO BEST…
              </span>
            </div>
            {/* <img src="/assets/professional.png" alt="professional" width={350} className=" pr-32 rounded-xl"/> */}
          </div>

          <Separator />

          {/* 1) Occupation */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] items-start md:items-center gap-4 mb-6">
            <label className="text-base font-medium text-gray-700 md:text-lg">
              Occupation :<span className="text-red-600">*</span>
            </label>
            <div className="space-y-3">
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all">
                  <SelectValue placeholder="Sélectionnez une profession" />
                </SelectTrigger>

                <SelectContent>
                  {OCCUPATIONS.map((occ) => (
                    <SelectItem key={occ} value={occ}>
                      {occ}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {occupation === "Other" && (
                <Input
                  placeholder="Please specify your occupation"
                  value={otherOccupation}
                  onChange={(e) => setOtherOccupation(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                />
              )}
            </div>
          </div>

          {/* 2) Skills */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-4 items-start mb-6">
            <label className="text-base font-medium text-gray-700 md:text-xl">
              Skills :<span className="text-red-600">*</span>
              <span className=" text-gray-700 text-xs ml-5">
                (Max 7 skills)
              </span>{" "}
            </label>
            <div className="space-y-3">
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    placeholder={`Skill #${i + 1}`}
                    value={skill}
                    onChange={(e) => updateSkill(i, e.target.value)}
                    className="flex-1 h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  />
                  {skills.length > 1 && (
                    <button
                      onClick={() => removeSkill(i)}
                      className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      type="button"
                      aria-label="Remove skill"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {skills.length < 7 && (
                <Button
                  onClick={addSkill}
                  variant="outline"
                  size="sm"
                  type="button"
                  className="mt-2 text-blue-900  border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Add Skill
                </Button>
              )}
            </div>
          </div>

          {/* 3) Languages */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-4 items-start mb-6">
            <label className="text-base font-medium text-gray-700 md:text-lg">
              Languages
            </label>
            <div className="space-y-3">
              {languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    placeholder="Language"
                    value={lang.name}
                    onChange={(e) => updateLanguage(i, "name", e.target.value)}
                    className="flex-1 h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all"
                  />

                  <Select
                    value={lang.level}
                    onValueChange={(val) => updateLanguage(i, "level", val)}
                  >
                    <SelectTrigger className="w-32 h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-transparent transition-all">
                      <SelectValue placeholder="Niveau" />
                    </SelectTrigger>

                    <SelectContent>
                      {["Native", "Fluent", "Beginner"].map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {languages.length > 1 && (
                    <button
                      onClick={() => removeLanguage(i)}
                      className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      type="button"
                      aria-label="Remove language"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <Button
                onClick={addLanguage}
                variant="outline"
                size="sm"
                type="button"
                className="mt-2 text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Add Language
              </Button>
            </div>
          </div>

          <div className="text-right">
            <Button
              onClick={handleNextStep3}
              className="mt-6 w-36 bg-blue-900 hover:bg-blue-950"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 4 && selectedRole === "professional" && (
        <div className="md:py-32 pt-32 md:px-24 px-5 space-y-6">
          <OnboardingStepper currentStep={4} steps={professionalSteps} />

          <h1 className="text-4xl text-gray-700 mb-4 font-semibold">
            ACCOUNT SECURITY
          </h1>
          <span className="block mb-6 text-gray-500">
            Trust and safety is a big deal in our community. Please verify you
            Email and Phone number so that we can keep your account secured !
          </span>

          <Separator />

          {/* Password */}
          {/* Email row */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            <Mail className="text-gray-500 w-6 h-6" />

            <div>
              <span className="text-xl font-normal">Email:</span>{" "}
              <span className="text-xl font-semibold italic text-gray-500">
                PRIVATE
              </span>
            </div>

            <button
              disabled
              className="px-8 cursor-not-allowed py-4 border border-gray-300 text-sm font-medium bg-gray-400/15"
            >
              Verified
            </button>
          </div>

          {/* Phone Number row */}
          <div className="grid grid-cols-1 xs:grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
      {/* Icon - Hidden on smallest screens */}
      <div className="hidden xs:block">
        <Phone className="text-gray-500 w-5 h-5 sm:w-6 sm:h-6" />
      </div>

      {/* Label and value */}
      <div className="flex flex-col xs:flex-row gap-1 xs:items-center">
        <span className="text-base sm:text-lg font-medium text-gray-700">
          Phone Number:
        </span>
        <span className="text-sm sm:text-base font-medium italic text-gray-500">
          {phoneNumber || "PRIVATE"}
        </span>
      </div>

      {/* Button / Verified badge */}
      {phoneNumber ? (
        <div className="flex items-center justify-end xs:justify-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm rounded">
          <Check className="w-4 h-4" />
          <span>Verified</span>
        </div>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full xs:w-auto px-4 py-3 sm:px-6 sm:py-4 border border-gray-300 text-xs sm:text-sm font-medium rounded hover:bg-gray-50"
            >
              Add Phone Number
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[90vw] max-w-[400px] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                Add Phone Number
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Enter your phone number so clients can reach you.
              </DialogDescription>
            </DialogHeader>

            {/* <-- use tempPhone here */}
            <div className="mt-4">
              <Input
                type="tel"
                placeholder="+212 6 1234 5678"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                className="w-full h-10 sm:h-11"
              />
            </div>

            <DialogFooter>
              {/* only this button will close */}
              <DialogClose asChild>
                <Button
                  className="w-full sm:w-auto"
                  disabled={!tempPhone.trim()}
                  onClick={() => {
                    setPhoneNumber(tempPhone.trim());
                    setTempPhone("");
                  }}
                >
                  Save Changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>

          <div className="text-right">
            <Button
              onClick={handleSubmit}
              className="mt-6 w-36 bg-blue-950 rounded-none hover:rounded-xl transition-all hover:bg-blue-950 py-5"
            >
              Finish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
