'use cache'

import Boxes from "@/components/boxes";
import Link from "next/link";



export default async function About() {

  return (
    <main className=" mt-12 m-auto max-w-3xl">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-medium">About Page</h1>
        <Link className="mt-2 text-muted-foreground" href={"/"}>
          Go back home
        </Link>
      </div>
      <Boxes />
    </main>
  );
}
