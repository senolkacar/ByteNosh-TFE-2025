import Link from "next/link";

interface MainTitleProps{
    title: string;
    description: string;
    linkText: string;
    linkUrl: string;
}

export default function MainTitle({title, description, linkText, linkUrl}: MainTitleProps) {
    return (
        <div className="bg-amber-50 px-4 py-24 pb-4">
            <section className="mx-auto max-w-screen-xl p-9">
                <div className="flex flex-col justify-between items-center md:grid grid-cols-2">
                    <div className="py-12 col-span-1">
                        <h1 className="text-center text-6xl font-semibold md:text-left">
                            {title}
                        </h1>
                        <p className="text-lg mt-4 text-gray-500">
                            {description}
                        </p>
                    </div>
                    <div className="col-span-1 mt-6 flex md:justify-end md:mt-4">
                        <Link href={linkUrl}>
                            <p className="bg-yellow-400 px-12 py-3 md:px-6 md:py-3">{linkText}</p>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}