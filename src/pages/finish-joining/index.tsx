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
import { Mail, Phone } from "lucide-react";
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

export default function FinishSignup() {
  const router = useRouter();
  const { token: queryToken } = router.query as { token?: string };
  const [token, setToken] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [step, setStep] = useState<number>(1);

  interface ProfessionalPayload {
    name: string;
    username: string;
    avatar: string;
    description: string;
    occupation: string;
    otherOccupation?: string;
    skills: string[];
    languages: { name: string; level: string }[];
    phoneNumber: string;
  }

  interface ClientPayload {
    name: string;
    username: string;
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
        const res = await fetch("http://localhost:3001/users/me", {
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
    await fetch(`http://localhost:3001/users/${userId}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: selectedRole }),
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

  // 2) Guard: if you're already onboarded, kick them out immediately
  useEffect(() => {
    if (!token) return;
    (async () => {
      const res = await fetch("http://localhost:3001/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setValidating(false);
        return;
      }
      const me = await res.json();
      // if role is anything but "pending", redirect:
      if (me.role === "client") {
        router.replace("/dashboard");
      } else if (me.role === "professional") {
        router.replace("/dashboard/pro");
      } else {
        // still pending → show finish-joining
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
          description,
          phoneNumber,
        };
        await fetch("http://localhost:3001/client-profile", {
          method: "POST",
          headers,
          body: JSON.stringify(clientPayload),
        });
        router.replace("/dashboard");
      } else {
        // collect everything you’ve gathered
        const payload: ProfessionalPayload = {
          name: name,
          username,
          avatar: avatarUrl,
          description,
          occupation,
          otherOccupation: occupation === "Other" ? otherOccupation : undefined,
          skills,
          languages,
          phoneNumber,
        };

        await fetch("http://localhost:3001/professional-profile/me", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        router.replace("/dashboard/pro");
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
    <div className="">
      {step === 1 && (
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <h1 className="text-2xl mb-6">Welcome! What type of account?</h1>
          <div className="flex gap-6 justify-center mb-8">
            {(["client", "professional"] as const).map((role) => (
              <div
                key={role}
                onClick={() => setSelectedRole(role)}
                className={` flex-shrink-0 border rounded-lg p-28 cursor-pointer transition
              ${
                selectedRole === role
                  ? "border-2 border-blue-500 shadow-lg"
                  : "border-gray-200 hover:shadow-md"
              }`}
              >
                <h2 className="text-xl mb-2">
                  {role === "client" ? "I am a Client" : "I am a Professional"}
                </h2>
                <img
                  src={
                    role === "client"
                      ? "/assets/client.png"
                      : "/assets/freelancer.png"
                  }
                  alt={role}
                  className="mx-auto h-80"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={handleNext}
            disabled={!selectedRole}
            className="w-36 text-lg bg-blue-950 hover:bg-[#121d3a] transition-colors disabled:opacity-50 mx-auto"
          >
            Next
          </Button>
        </div>
      )}

      {step === 2 && selectedRole === "client" && (
        <>
          <div className=" py-5 px-24 ">
            <OnboardingStepper currentStep={step} steps={clientSteps} />
            <div className=" mb-10 flex flex-row items-center justify-between">
              <div className=" max-w-xl">
                <h1 className="text-4xl text-gray-700 mb-4 font-semibold">
                  PERSONAL INFOS
                </h1>
                <span className=" mt-5 text-gray-500 w-20">
                  {" "}
                  tell us a bit about yourself. This informations will only
                  appear on your public profile, so that potential clients can
                  get to know you better
                </span>
              </div>
              <div className="">
                <img
                  width={250}
                  src="assets/personalinfos.png"
                  alt="personal infos"
                />
              </div>
            </div>

            <Separator className=" mb-5 text-gray-800" />

            <div className="space-y-6 mx-auto">
              {/* Full Name row */}
              <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
                <label className="text-xl font-normal">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <Input
                  placeholder="John Doe …"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14"
                />
              </div>

              {/* Username row */}
              <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
                <label className="text-xl font-normal">
                  Username{" "}
                  <span className="text-sm text-gray-400">(display name)</span>
                  <span className="text-red-600">*</span>
                </label>
                <Input
                  placeholder="ex: mr_haircut"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-14"
                />
              </div>

              {/* Avatar upload row */}
              <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
                <label className="text-xl font-normal">Profile Picture</label>
                <FileUploadField
                  onFileSelected={(fileOrUrl) => {
                    setAvatarUrl(fileOrUrl);
                  }}
                />
              </div>

              {/* Description row (multi-line) */}
              <div className="grid grid-cols-[200px_minmax(0,1fr)] items-start gap-16">
                <label className="text-xl font-normal">Description</label>
                <Textarea
                  placeholder="Share a bit about your self and what are you looking for as a client!"
                  className="w-full"
                />
              </div>
            </div>
            <div className="float-end">
              <Button
                onClick={handleNextStep2Client}
                className="mt-6 w-36 bg-blue-950 hover:bg-blue-[#0e193d] transition-colors"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
      {step === 3 && selectedRole === "client" && (
        <>
          <div className="py-5 px-24 space-y-6">
            <OnboardingStepper currentStep={3} steps={clientSteps} />

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
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
              <Phone className="text-gray-500 w-6 h-6" />

              <div>
                <span className="text-xl font-normal">Phone Number:</span>{" "}
                <span className="text-xl font-semibold italic text-gray-500">
                  PRIVATE
                </span>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-8 py-6 border border-gray-300 text-sm font-medium rounded-none"
                  >
                    Add Phone Number
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
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
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button>Save</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="text-right">
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
                className="mt-6 w-36 bg-blue-950 rounded-none hover:rounded-xl transition-all hover:bg-blue-950 py-5"
              >
                Finish
              </Button>
            </div>
          </div>
        </>
      )}

      {step === 2 && selectedRole === "professional" && (
        <div className=" py-5 px-24 ">
          <OnboardingStepper currentStep={step} steps={professionalSteps} />
          <div className=" mb-10 flex flex-row items-center justify-between">
            <div className=" max-w-xl">
              <h1 className="text-4xl text-gray-700 mb-4 font-semibold">
                PERSONAL INFOS
              </h1>
              <span className=" mt-5 text-gray-500 w-20">
                {" "}
                tell us a bit about yourself. This informations will only appear
                on your public profile, so that potential clients can get to
                know you better
              </span>
            </div>
            <div className="">
              <img
                width={250}
                src="assets/personalinfos.png"
                alt="personal infos"
              />
            </div>
          </div>

          <Separator className=" mb-5 text-gray-800" />

          <div className="space-y-6 mx-auto">
            {/* Full Name row */}
            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
              <label className="text-xl font-normal">
                Full Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="John Doe …"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14"
              />
            </div>

            {/* Username row */}
            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
              <label className="text-xl font-normal">
                Username{" "}
                <span className="text-sm text-gray-400">(display name)</span>
                <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="ex: mr_haircut"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14"
              />
            </div>

            {/* Avatar upload row */}
            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
              <label className="text-xl font-normal">Profile Picture</label>
              <FileUploadField
                onFileSelected={(fileOrUrl) => {
                  setAvatarUrl(fileOrUrl);
                }}
              />
            </div>

            {/* Description row (multi-line) */}
            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-start gap-16">
              <label className="text-xl font-normal">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share a bit about your work experience!"
                className="w-full"
              />
            </div>
          </div>
          <div className="float-end">
            <Button
              onClick={handleNextStep2}
              disabled={!name || !username}
              className="mt-6 w-36 bg-blue-950 hover:bg-blue-[#0e193d] transition-colors"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && selectedRole === "professional" && (
        <div className="py-5 px-24 space-y-6">
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
        <div className="py-5 px-24 space-y-6">
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
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            <Phone className="text-gray-500 w-6 h-6" />

            <div>
              <span className="text-xl font-normal">Phone Number:</span>{" "}
              <span className="text-xl font-semibold italic text-gray-500">
                PRIVATE
              </span>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-8 py-6 border border-gray-300 text-sm font-medium rounded-none"
                >
                  Add Phone Number
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[425px]">
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full"
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Save</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
