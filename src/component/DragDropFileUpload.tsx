import { FileIcon, X } from 'lucide-react'
import React, { useState, useRef } from 'react'

export interface FileUploadProps {
    /** The dynamic folder segment: /upload/files/{folder} */
    folder: string
    /** Base upload path (if you need to change from /upload/files) */
    baseUrl?: string
    /** accepted file types, e.g. "image/*,application/pdf" */
    accept?: string
    /** allow multiple files */
    multiple?: boolean
    /** callback when user selects files (before upload) */
    onFilesSelected?: (files: File[]) => void
    /** callback on successful upload; receives server JSON */
    onUploadSuccess?: (response: any) => void
    /** callback on upload error */
    onUploadError?: (error: Error) => void
    /** extra classes for the drop area */
    className?: string
}

export const DragDropFileUpload: React.FC<FileUploadProps> = ({
    folder,
    baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/upload`,
    accept,
    multiple = false,
    onFilesSelected,
    onUploadSuccess,
    onUploadError,
    className = '',
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    const uploadUrl = `${baseUrl}/${folder}`

    const openFileDialog = () => inputRef.current?.click()

    const handleFiles = (filesList: FileList) => {
        const files = Array.from(filesList)
        setSelectedFiles(files)
        onFilesSelected?.(files)
        uploadToServer(files)
    }

    const uploadToServer = async (filesList: File[]) => {
        const formData = new FormData()
        filesList.forEach(file => formData.append('files', file))

        // 1) Setup timeout
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 30_000) // 30s

        try {
            // 2) Fire the request
            const res = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            })
            clearTimeout(timeout)

            // 3) HTTP‐level check
            if (!res.ok) {
                // attempt to read any error message from body
                let errMsg: string
                try {
                    errMsg = await res.text()
                } catch {
                    errMsg = res.statusText
                }
                throw new Error(`Upload failed (status ${res.status}): ${errMsg}`)
            }

            // 4) Parse JSON
            let data: any
            try {
                data = await res.json()
            } catch (parseErr: any) {
                throw new Error(`Failed to parse server response: ${parseErr.message}`)
            }

            // 5) Success callback
            onUploadSuccess?.(data)
        } catch (err: any) {
            clearTimeout(timeout)

            // 6) Timeout vs. other errors
            if (err.name === 'AbortError') {
                onUploadError?.(new Error('Upload timed out. Please try again.'))
            } else {
                onUploadError?.(err)
            }
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files)
            e.dataTransfer.clearData()
        }
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(e.target.files)
    }

    return (
        <div>
            {/* Drop area */}
            <div
                onClick={openFileDialog}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          ${className}
          flex flex-col items-center justify-center
          border-2 border-dashed rounded-lg p-8 cursor-pointer
          transition-colors
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                />
                <p className="text-gray-600 mb-1">
                    {isDragging ? 'Drop files here …' : 'Drag & drop files here or click to browse'}
                </p>
                {accept && (
                    <p className="text-xs text-gray-500">
                        Supported: <code>{accept}</code>
                    </p>
                )}
            </div>

            {/* Previews */}
            {selectedFiles.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files ({selectedFiles.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {selectedFiles.map((file, idx) => (
                            <div
                                key={idx}
                                className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-200"
                            >
                                {/* Image Preview */}
                                {file.type.startsWith('image/') ? (
                                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-48 h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center p-3">
                                        <FileIcon className="w-8 h-8 text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-600 text-center font-medium truncate w-full px-2">
                                            {file.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 mt-1">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                )}

                                {/* File Info Overlay */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                    <p className="text-xs text-white font-medium truncate">{file.name}</p>
                                    <p className="text-[10px] text-gray-300">
                                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'} • {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                                >
                                    <X className="w-3.5 h-3.5 text-gray-700" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
