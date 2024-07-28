"use client"

import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useUploadThing } from "@/lib/uploadthing"
import { cn } from "@/lib/utils"
import { Image, Loader2, MousePointerSquareDashed } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import Dropzone, { FileRejection } from "react-dropzone"

const Page = () => {

    const { toast } = useToast()

    const [isDragOver, setIsDragOver] = useState<boolean>(false)
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const router = useRouter()

    // when startUpload is invoked, it uses the code from the backend from uploadthing and when it is uploaded it pushes the router to the next step, also it shows the upload progress for the loading bar
    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: ([data]) => {
            const configId = data.serverData.configId
            startTransition(() => {
                router.push(`/configure/design?id=${configId}`)
            })

        },
        onUploadProgress(p) {
            setUploadProgress(p)
        }
    })
    // when files is rejected, onDropRejected is invoked and the file that is going to be uploaded is not gonna be accepted and also the setIsDragOver is turned into false as there is no more dragging of files happening
    // also when it is rejected a popup will show in the bottom right of the screen called the toast which uses the provided title desc and variant using shadcn, and this is all because a <Toaster /> was added to the root layout.tsx and also a toast const was added in line 14
    const onDropRejected = (rejectedFiles: FileRejection[]) => {
        const [file] = rejectedFiles
        setIsDragOver(false)

        toast({
            title: `${file.file.type} type is not suppoerted.`,
            description: "Please choose a PNG, JPG, JPEG image instead.",
            variant: "destructive"
        })
    }

    // when the file dropped by the user is the accepted type of file, onDropAccepted is invoked and the File is stored in the acceptedfiles array and also the startUpload function is invoked starting the process of uploading it to the server and also the setIsDragOver is now false 
    const onDropAccepted = (acceptedFiles: File[]) => {
        startUpload(acceptedFiles, { configId: undefined })
        setIsDragOver(false)

    }


    const [isPending, startTransition] = useTransition()


    return <div className={cn("relative h-full flex-1 my-16 w-full rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl flex justify-center flex-col items-center",
        {
            "ring-blue-900/25 bg-blue-900/10": isDragOver,
        }
    )}>
        {/* npm i react-dropzone : THIS IS FOR DRAG AND DROP COMPONENT FOR THE WEBSITE */}
        <div className="relative flex flex-1 flex-col items-center justify-center w-full">
            {/* This dropzone only accepts the image objects if its a png jpeg and jpg and if it accepts, the onDropAccepted is gonna start, if not, then the onDropRejected is gonna take place */}
            <Dropzone
                onDropRejected={onDropRejected}
                onDropAccepted={onDropAccepted}
                accept={{
                    "image/png": [".png"],
                    "image/jpeg": [".jpeg"],
                    "image/jpg": [".jpg"],
                }}
                onDragEnter={() => setIsDragOver(true)}
                onDragLeave={() => setIsDragOver(false)}>

                {({ getRootProps, getInputProps }) => (
                    <div className=" h-full w-full flex-1 flex flex-col items-center justify-center" {...getRootProps()}>
                        <input {...getInputProps()} />
                        {/* if isDragOver(Dragging a file over the component) is true, then MousePointerSquareDashed is loaded, if it is false and the file isUploading cause it is done dragging, then Loader2 is loaded which is a loading wheel, if isDragOver is false and isUploading is false, the default state of this component is an Image icon */}

                        {isDragOver ? (
                            <MousePointerSquareDashed className="h-6 w-6 text-zinc-500 mb-2" />
                        ) : isUploading || isPending ? (
                            <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
                        ) : (
                            <Image className="h-6 w-6 text-zinc-500 mb-2" />
                        )}

                        <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">


                            {isUploading ? (
                                <div className="flex flex-col items-center">
                                    <p>Uploading...</p>
                                    <Progress value={uploadProgress} className="mt-2 w-40 h-2 bg-gray-300" />
                                </div>
                            ) : isPending ? (
                                <div className="flex flex-col items-center">
                                    <p>Redirecting, please wait...</p>
                                </div>
                            ) : isDragOver ? (
                                <p>
                                    <span className="font-semibold">Drop file</span>{" "} to upload
                                </p>
                            ) : <p>
                                <span className="font-semibold">Click to upload</span>{' '} or drag and drop
                            </p>}
                        </div>

                        {isPending ? null : (
                            <p className="text-xs text-zinc-500">PNG, JPG, JPEG</p>
                        )}
                    </div>
                )}

            </Dropzone>
        </div>
    </div>
}

export default Page