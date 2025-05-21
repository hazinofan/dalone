// pages/finish-joining.tsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OnboardingStepper } from '@/component/OnboardingStepper'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { FileUploadField } from '@/component/FileUpload'

export default function FinishSignup() {
  const router = useRouter()
  const { token: queryToken } = router.query as { token?: string }
  const [token, setToken] = useState<string | null>(null)
  const [validating, setValidating] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<number | null>(null)
  const [step, setStep] = useState<number>(1)

  // Role choix step 1
  const [selectedRole, setSelectedRole] = useState<'client' | 'professional' | null>(null)

  // Step 2 form state
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [description, setDescription] = useState('')
  const [bio, setBio] = useState('')
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


  // Load token from query or storage
  useEffect(() => {
    if (queryToken) {
      setToken(queryToken)
      localStorage.setItem('dalone:token', queryToken)
    } else {
      const stored = localStorage.getItem('dalone:token')
      if (stored) setToken(stored)
    }
  }, [queryToken])

  // Step 1 → next to step 2
  const handleNext = async () => {
    if (!selectedRole || !token || userId === null) return

    // 1) Patch our role on the server
    await fetch(`http://localhost:3001/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: selectedRole }),
    })

    // 2) advance to step 2
    setStep(2)
  }

  const handleNextStep2 = () => {
    if (selectedRole === 'professional') {
      setStep(3)
    }
  }


  // Final submit
  const handleSubmit = async () => {
    if (!token) return
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    if (selectedRole === 'client') {
      await fetch('http://localhost:3001/client-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ firstName, lastName }),
      })
      router.replace('/dashboard')
    } else {
      await fetch('http://localhost:3001/professional-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ companyName, bio }),
      })
      router.replace('/dashboard/pro')
    }
  }

  useEffect(() => {
    if (!token) {
      setValidating(false)
      return
    }

    const validate = async () => {
      try {
        const res = await fetch('http://localhost:3001/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Not authorized')
        const me = await res.json()
        setUserId(me.id)
        // you could grab the profile if you need it
      } catch {
        return router.replace('/login')
      } finally {
        setValidating(false)
      }
    }
    validate()
  }, [token, router])

  // Pendant la validation on peut afficher un loader
  if (validating) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Vérification du token…</div>
  }

  if (!token) {
    return <div style={{ textAlign: 'center', padding: 40 }}>
      <h2>Token manquant…</h2>
    </div>
  }

  if (!token) {
    return <p style={{ textAlign: 'center', marginTop: 40, margin: '0 auto' }}>Token manquant…</p>
  }

  return (
    <div className="">
      {step === 1 && (
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <h1 className="text-2xl mb-6">Welcome! What type of account?</h1>
          <div className="flex gap-6 justify-center mb-8">
            {(['client', 'professional'] as const).map((role) => (
              <div
                key={role}
                onClick={() => setSelectedRole(role)}
                className={` flex-shrink-0 border rounded-lg p-6 cursor-pointer transition
              ${selectedRole === role
                    ? 'border-2 border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:shadow-md'}`}
              >
                <h2 className="text-xl mb-2">{role === 'client' ? 'I am a Client' : 'I am a Professional'}</h2>
                <img
                  src={role === 'client' ? '/assets/client.png' : '/assets/freelancer.png'}
                  alt={role}
                  className="mx-auto h-64"
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

      {step === 2 && selectedRole === 'client' && (
        <div>
          <h1 className="text-2xl mb-4">Tell us about you</h1>
          <div className="space-y-4">
            <Input
              placeholder="First Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
          <Button onClick={handleSubmit} className="mt-6 w-36">
            Finish
          </Button>
        </div>
      )}

      {step === 2 && selectedRole === 'professional' && (
        <div className=' py-5 px-24 '>
          <OnboardingStepper currentStep={step} />
          <div className=" mb-10 flex flex-row items-center justify-between">
            <div className=" max-w-xl">
              <h1 className="text-4xl text-gray-700 mb-4 font-semibold">PERSONAL INFOS</h1>
              <span className=' mt-5 text-gray-500 w-20'> tell us a bit about yourself.
                This informations will only appear on your public profile, so that potential clients can get to know you better
              </span>
            </div>
            <div className="">
              <img width={250} src="assets/personalinfos.png" alt="personal infos" />
            </div>
          </div>

          <Separator className=' mb-5 text-gray-800' />

          <div className="space-y-6 mx-auto">
            {/* Full Name row */}
            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
              <label className="text-xl font-normal">
                Full Name <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="John Doe …"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-14"
              />
            </div>

            {/* Username row */}
            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
              <label className="text-xl font-normal">
                Username <span className="text-sm text-gray-400">(display name)</span>
                <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="ex: mr_haircut"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full h-14"
              />
            </div>

            {/* Avatar upload row */}
            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-center gap-16">
              <label className="text-xl font-normal">Profile Picture</label>
              <FileUploadField onFileSelected={setSelectedFile} />
            </div>

            {/* Description row (multi-line) */}
            <div className="grid grid-cols-[200px_minmax(0,1fr)] items-start gap-16">
              <label className="text-xl font-normal">Description</label>
              <Textarea
                placeholder="Share a bit about your work experience!"
                className="w-full"
              />
            </div>
          </div>
          <div className="float-end">
            <Button onClick={handleNextStep2} className="mt-6 w-36 bg-blue-950 hover:bg-blue-[#0e193d] transition-colors">
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 3 && selectedRole === 'professional' && (
        <div className="py-5 px-24 space-y-6">
          <OnboardingStepper currentStep={3} />

          <h1 className="text-4xl text-gray-700 mb-4 font-semibold">PROFESSIONAL INFOS</h1>
          <span className="block mb-6 text-gray-500">
            THIS IS YOUR TIME TO SHINE. LET POTENTIAL CLIENTS KNOW WHAT YOU DO BEST…
          </span>

          <Separator />

          {/* 1) Occupation */}
          {/* 1) Occupation */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] items-start md:items-center gap-4 mb-6">
            <label className="text-base font-medium text-gray-700 md:text-lg">Occupation</label>
            <div className="space-y-3">
              <select
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiA2Yjc1ODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
              >
                {OCCUPATIONS.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
              {occupation === "Other" && (
                <Input
                  placeholder="Please specify your occupation"
                  value={otherOccupation}
                  onChange={e => setOtherOccupation(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              )}
            </div>
          </div>

          {/* 2) Skills */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-4 items-start mb-6">
            <label className="text-base font-medium text-gray-700 md:text-lg">Skills</label>
            <div className="space-y-3">
              {skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    placeholder={`Skill #${i + 1}`}
                    value={skill}
                    onChange={e => updateSkill(i, e.target.value)}
                    className="flex-1 h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  {skills.length > 1 && (
                    <button
                      onClick={() => removeSkill(i)}
                      className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      type="button"
                      aria-label="Remove skill"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  className="mt-2 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 hover:border-green-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
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
            <label className="text-base font-medium text-gray-700 md:text-lg">Languages</label>
            <div className="space-y-3">
              {languages.map((lang, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    placeholder="Language"
                    value={lang.name}
                    onChange={e => updateLanguage(i, "name", e.target.value)}
                    className="flex-1 h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <select
                    value={lang.level}
                    onChange={e => updateLanguage(i, "level", e.target.value)}
                    className="w-32 h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiA2Yjc1ODAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1jaGV2cm9uLWRvd24iPjxwYXRoIGQ9Im02IDkgNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_0.5rem]"
                  >
                    {["Native", "Fluent", "Beginner"].map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                  {languages.length > 1 && (
                    <button
                      onClick={() => removeLanguage(i)}
                      className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      type="button"
                      aria-label="Remove language"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className="mt-2 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 hover:border-green-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Add Language
              </Button>
            </div>
          </div>

          <div className="text-right">
            <Button
              onClick={handleSubmit}
              className="mt-6 w-36 bg-green-600 hover:bg-green-700"
            >
              Finish
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
