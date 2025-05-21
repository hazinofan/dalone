import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FileUploadField({
  onFileSelected,
}: {
  onFileSelected: (file: File) => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileSelected(file)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <label>
        <Input
          type="file"
          className="sr-only"      // hide the native input
          onChange={handleChange}
        />
        <Button asChild>
          <span>Select a file…</span>
        </Button>
      </label>
      {fileName && <span className="text-sm">{fileName}</span>}
    </div>
  )
}
