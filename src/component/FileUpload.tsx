// components/FileUploadField.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FileUploadField({
  onFileSelected,       // now will receive the **URL** of the uploaded image
}: {
  onFileSelected: (url: string) => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1) Restrict file types
    if (!["image/jpeg","image/png"].includes(file.type)) {
      alert("Only JPG/PNG images are allowed.")
      return
    }

    setFileName(file.name)
    setUploading(true)

    // 2) Upload to your NestJS endpoint
    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const res = await fetch("http://localhost:3001/upload/avatar", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Upload failed")
      const { url } = await res.json()   
      onFileSelected(url)
    } catch (err) {
      console.error(err)
      alert("Upload error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <label>
        <Input
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={handleChange}
          disabled={uploading}
        />
        <Button asChild disabled={uploading} variant="outline" size="sm">
          <span>{uploading ? "Uploading…" : "Select a file…"}</span>
        </Button>
      </label>
      {fileName && <span className="text-sm">{fileName}</span>}
    </div>
  )
}
