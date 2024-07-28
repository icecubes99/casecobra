import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from 'zod';
import sharp from 'sharp'
import { db } from "@/app/db";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });


export const ourFileRouter = {

    imageUploader: f({ image: { maxFileSize: "4MB" } })
        .input(z.object({ configId: z.string().optional() }))
        .middleware(async ({ input }) => {
            return { input };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const { configId } = metadata.input

            // First is that it fetches the url of the file from uploadthings, then converts that res(file url) into a buffer so that we can get the metadata of the image using a library called sharp, creating a const named imgMetadata and loading the buffer into sharp and using the metadata() function from that library gives us the necessary information of that image that was uploaded
            // from that metadata function we get the width and the height of the image uploaded
            const res = await fetch(file.url)
            const buffer = await res.arrayBuffer()

            const imgMetadata = await sharp(buffer).metadata()
            const { width, height } = imgMetadata

            // this is the necessary backend for uploading the metadata into our database in which is an if else statement, an if is invoked if there is still no configId, which means a user has just uploaded the image into our site, wherein we need to create a prisma invocation where it creates a record in our database with the data of imageUrl, height and width and also returns the id of that record back into us so that it may be used for step 2 
            if (!configId) {
                const configuration = await db.configuration.create({
                    data: {
                        imageUrl: file.url,
                        height: height || 500,
                        width: width || 500,
                    },
                })
                return { configId: configuration.id }

                //this is for step 2 where there is already a configId as the user has already uploaded the image to our site and we just want his croppedImageUrl that is why we use the prisma update function of that configuration
            } else {
                const updatedConfiguration = await db.configuration.update({
                    where: {
                        id: configId,
                    },
                    data: {
                        croppedImageUrl: file.url
                    }
                })
                return { configId: updatedConfiguration.id }
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;