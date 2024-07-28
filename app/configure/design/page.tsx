import { db } from "@/app/db"
import { notFound } from "next/navigation"
import DesignConfigurator from "./DesignConfigurator"

interface PageProps {
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}
const Page = async ({ searchParams }: PageProps) => {
    const { id } = searchParams

    //This if statement shows the 404 page if the users gets to a website url without the id of the image
    if (!id || typeof id !== "string") {
        return notFound()
    }

    //This creates the configuration object where it finds the unique record of the id we got from the searchParams and finds it in the database if it really is in there and if it is not, it invokes the if statement where there is no record and shows the 404 page
    const configuration = await db.configuration.findUnique({
        where: { id }
    })
    if (!configuration) {
        return notFound()
    }

    const { imageUrl, width, height } = configuration

    //We need to put the main logic of this page in another component as this is a server component and server components is only rendered once on the server while the main logic uses react hooks like useState and useEffect which needs to be rerendered as it interacts with the user
    return <DesignConfigurator />

}

export default Page